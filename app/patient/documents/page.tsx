import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadForm } from "@/components/forms/UploadForm";
import { EmptyState } from "@/components/common/EmptyState";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient record"
        title="Documents"
        description="Upload supporting files and keep the clinical review flow organized."
        level={1}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <UploadForm />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload notes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
              <p>Capture the file metadata before attaching extraction results.</p>
              <p>Choose the most specific category available so filters stay useful later.</p>
            </CardContent>
          </Card>

          <EmptyState
            icon={<FileText size={24} />}
            eyebrow="Archive"
            title="No document archive is open."
            description="Uploaded files will appear here once the patient has records to review."
          />
        </div>
      </section>
    </main>
  );
}
