# Firestore Schema

This document describes the current Firestore document shapes used by ChroniSync.
It follows the conventions established in `config/firebase.ts`, the `types/*`
definitions, and the service layer in `services/*` and `features/*`.

## Conventions

- Collection names are defined in `COLLECTIONS`.
- Document IDs are stable string IDs.
- Timestamp fields use Firestore timestamps in storage and `Date` objects in the
  TypeScript layer.
- Most records include `createdAt` and `updatedAt`.
- User-owned records usually store `patientId`, `physicianId`, or both.

## Identity Collections

| Collection | Shape | Notes |
| --- | --- | --- |
| `users` | `User` | Canonical account record for auth, roles, and status. |
| `patients` | `Patient` | Extends `User` with demographic and clinical profile fields. |
| `physicians` | `Physician` | Extends `User` with license, specialty, and availability data. |

### `users`

- `id`
- `email`
- `fullName`
- `role`
- `status`
- `emailVerified`
- `phoneNumber?`
- `timezone?`
- `language?`
- `photoURL?`
- `createdAt`
- `updatedAt`
- `lastLoginAt?`

### `patients`

- All `users` fields
- `dateOfBirth`
- `biologicalSex`
- `bloodType?`
- `heightCm?`
- `weightKg?`
- `chronicConditions[]`
- `emergencyContact`
- `physicianId?`

### `physicians`

- All `users` fields
- `licenseNumber`
- `specialty`
- `organization?`
- `department?`
- `yearsOfExperience?`
- `biography?`
- `availability`
- `activePatientCount?`

## Clinical Collections

| Collection | Shape | Notes |
| --- | --- | --- |
| `medications` | `Medication` | Active and historical medication records. |
| `allergies` | `Allergy` | Patient allergy history and severity. |
| `vitals` | `Vital` | Blood pressure, glucose, weight, and other readings. |
| `symptoms` | `Symptom` | Patient-reported symptom tracking. |
| `diseases` | `Disease` | Diagnosed condition tracking. |
| `alerts` | `Alert` | Rules engine and manual alert records. |
| `documents` | `Document` | Uploaded files and AI extraction metadata. |
| `summaries` | `Summary` | Visit, care, and document summaries. |
| `notifications` | `NotificationRecord` | Patient and physician notification feed. |

### `medications`

- `patientId`
- `prescribedBy?`
- `name`
- `genericName?`
- `dosage`
- `strength?`
- `route?`
- `frequency`
- `customFrequency?`
- `instructions?`
- `startDate`
- `endDate?`
- `status`
- `refillRemaining?`
- `isAsNeeded?`
- `notes?`

### `allergies`

- `patientId`
- `allergen`
- `type`
- `reaction?`
- `severity`
- `firstObservedAt?`
- `lastReactionAt?`
- `status`
- `recordedBy?`
- `notes?`

### `vitals`

- `patientId`
- `type`
- `recordedAt`
- `recordedBy?`
- `source?`
- `notes?`
- Type-specific fields such as `systolic` / `diastolic` or `value` / `unit`

### `symptoms`

- `patientId`
- `diseaseId?`
- `name`
- `description?`
- `severity`
- `frequency?`
- `onsetAt?`
- `resolvedAt?`
- `status`
- `triggers?`
- `notes?`
- `recordedBy?`

### `diseases`

- `patientId`
- `name`
- `icd10Code?`
- `diagnosedAt?`
- `severity?`
- `status`
- `managedByPhysicianId?`
- `isChronic?`
- `notes?`

### `alerts`

- `patientId`
- `physicianId?`
- `title`
- `message`
- `level`
- `status`
- `source?`
- `ruleId?`
- `metric?`
- `threshold?`
- `actualValue?`
- `acknowledgedBy?`
- `acknowledgedAt?`
- `resolvedAt?`
- `notes?`
- `metadata?`

### `documents`

- `patientId`
- `title`
- `fileName`
- `filePath`
- `contentType`
- `sizeBytes`
- `category`
- `status`
- `source?`
- `downloadUrl?`
- `extractedText?`
- `summary?`
- `uploadedBy?`
- `reviewedBy?`
- `reviewedAt?`

### `summaries`

- `patientId`
- `physicianId?`
- `encounterId?`
- `title`
- `type`
- `source`
- `status`
- `content`
- `highlights?`
- `recommendations?`
- `generatedBy?`
- `model?`
- `reviewedBy?`
- `reviewedAt?`
- `publishedAt?`
- `metadata?`

### `notifications`

- `recipientId`
- `title`
- `message`
- `type`
- `status`
- `link?`
- `source?`
- `metadata?`
- `deliveredAt?`
- `readAt?`
- `archivedAt?`

## Reserved Collections

The app config also reserves these collection names for later expansion:

- `treatmentPlans`
- `appointments`

They are not yet backed by dedicated service modules in the current phase.

## Relationship Notes

- `patients.physicianId` links a patient to the primary physician panel.
- `alerts.patientId` and `summaries.patientId` connect clinical workflows to the
  patient timeline.
- `documents.patientId` links uploaded files to patient review queues.
- `notifications.recipientId` is the target account for the feed.
