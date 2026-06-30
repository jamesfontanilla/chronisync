import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { COLLECTIONS, MAX_DOCUMENT_SIZE, ALLOWED_FILE_TYPES } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { getAdminDb, getAdminStorage } from "@/lib/firebase/admin";
import { buildPatientDocumentPath } from "@/lib/firebase/storage";
import {
  documentCategorySchema,
  documentSourceSchema,
  documentSchema,
} from "@/schemas/document";

const uploadMetadataSchema = z.object({
  patientId: z.string().trim().min(1, "Patient ID is required."),
  title: z.string().trim().optional(),
  category: documentCategorySchema.default("other"),
  source: documentSourceSchema.default("patient_upload"),
  uploadedBy: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  extractedText: z.string().trim().optional(),
});

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function readFormValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A file upload is required." },
        { status: 400 }
      );
    }

    if (file.size > MAX_DOCUMENT_SIZE) {
      return NextResponse.json(
        { error: "The uploaded file exceeds the document size limit." },
        { status: 413 }
      );
    }

    if (file.type && !ALLOWED_FILE_TYPES.some((allowed) => allowed === file.type)) {
      return NextResponse.json(
        { error: "That file type is not allowed for document uploads." },
        { status: 415 }
      );
    }

    const parsed = uploadMetadataSchema.safeParse({
      patientId: readFormValue(formData, "patientId"),
      title: readFormValue(formData, "title"),
      category: readFormValue(formData, "category"),
      source: readFormValue(formData, "source"),
      uploadedBy: readFormValue(formData, "uploadedBy"),
      summary: readFormValue(formData, "summary"),
      extractedText: readFormValue(formData, "extractedText"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid upload metadata is required." },
        { status: 400 }
      );
    }

    const metadata = parsed.data;
    const now = new Date();
    const documentId = globalThis.crypto.randomUUID();
    const fileName = sanitizeFileName(file.name || metadata.title || "upload");
    const storagePath = buildPatientDocumentPath(
      metadata.patientId,
      `${documentId}-${fileName}`
    );
    const bucket = getAdminStorage().bucket();
    const storageFile = bucket.file(storagePath);
    const buffer = Buffer.from(await file.arrayBuffer());

    await storageFile.save(buffer, {
      metadata: {
        contentType: file.type || "application/octet-stream",
      },
    });

    let downloadUrl: string | undefined;

    try {
      const [signedUrl] = await storageFile.getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 30,
      });

      downloadUrl = signedUrl;
    } catch (error) {
      logger.warn("Could not generate a signed document URL", {
        documentId,
        patientId: metadata.patientId,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    const record = documentSchema.parse({
      id: documentId,
      patientId: metadata.patientId,
      title: metadata.title ?? file.name,
      fileName: file.name,
      filePath: storagePath,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      category: metadata.category,
      status: "pending",
      source: metadata.source,
      downloadUrl,
      extractedText: metadata.extractedText,
      summary: metadata.summary,
      uploadedBy: metadata.uploadedBy,
      createdAt: now,
      updatedAt: now,
    });

    await getAdminDb()
      .collection(COLLECTIONS.DOCUMENTS)
      .doc(documentId)
      .set(record);

    logger.info("Uploaded a document through the API", {
      documentId,
      patientId: metadata.patientId,
      fileName: file.name,
    });

    return NextResponse.json(
      {
        document: record,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Upload route failed", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The document upload could not be completed.",
      },
      { status: 500 }
    );
  }
}
