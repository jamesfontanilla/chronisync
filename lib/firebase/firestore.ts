/**
 * =============================================================================
 * ChroniSync
 * Firestore Service
 * =============================================================================
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type CollectionReference,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";

/* -------------------------------------------------------------------------- */
/*                              Collection Helpers                            */
/* -------------------------------------------------------------------------- */

/**
 * Returns a typed Firestore collection reference.
 */
export function getCollection<T = DocumentData>(
  path: string
): CollectionReference<T> {
  return collection(db, path) as CollectionReference<T>;
}

/* -------------------------------------------------------------------------- */
/*                                Create                                      */
/* -------------------------------------------------------------------------- */

/**
 * Create or overwrite a document using a known ID.
 */
export async function createDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: T
): Promise<void> {
  await setDoc(doc(db, collectionName, documentId), data);
}

/**
 * Create a document with an auto-generated ID.
 *
 * Returns the generated document ID.
 */
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  const reference = await addDoc(
    collection(db, collectionName),
    data
  );

  return reference.id;
}

/* -------------------------------------------------------------------------- */
/*                                  Read                                      */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve a document by ID.
 */
export async function getDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string
): Promise<T | null> {
  const snapshot = await getDoc(
    doc(db, collectionName, documentId)
  );

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as T;
}

/**
 * Retrieve every document from a collection.
 */
export async function getCollectionDocuments<
  T extends DocumentData
>(
  collectionName: string
): Promise<T[]> {
  const snapshot = await getDocs(
    collection(db, collectionName)
  );

  return snapshot.docs.map(
    (document) => document.data() as T
  );
}

/**
 * Query documents using Firestore query constraints.
 */
export async function queryDocuments<
  T extends DocumentData
>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const snapshot = await getDocs(
    query(collection(db, collectionName), ...constraints)
  );

  return snapshot.docs.map(
    (document) => document.data() as T
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Update                                     */
/* -------------------------------------------------------------------------- */

/**
 * Update one or more fields in a document.
 */
export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> {
  await updateDoc(
    doc(db, collectionName, documentId),
    data
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Delete                                     */
/* -------------------------------------------------------------------------- */

/**
 * Delete a document.
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  await deleteDoc(
    doc(db, collectionName, documentId)
  );
}

/* -------------------------------------------------------------------------- */
/*                            Common Query Helpers                            */
/* -------------------------------------------------------------------------- */

/**
 * Convenience helper for simple equality queries.
 */
export function whereEquals(
  field: string,
  value: unknown
) {
  return where(field, "==", value);
}