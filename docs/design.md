# design.md

# Chronic Disease Management Platform

## System Design Document

---

# 1. Overview

The Chronic Disease Management Platform is a two-sided web application that connects patients and physicians through a centralized digital health management system.

Patients record medications, allergies, symptoms, vital signs, and disease-specific information, while physicians monitor patient progress through an integrated dashboard.

Artificial Intelligence is intentionally restricted to low-risk administrative tasks such as medical document extraction and visit summarization. All clinical decisions remain rules-based and require physician review.

---

# 2. Design Goals

The system is designed to be:

* Secure
* Explainable
* Easy to use
* Mobile responsive
* Scalable
* Suitable for community healthcare

---

# 3. System Architecture

```
                        +----------------------+
                        |      Web Client      |
                        |  (Next.js / React)   |
                        +----------+-----------+
                                   |
                    Firebase Authentication
                                   |
                 +-----------------+-----------------+
                 |                                   |
      Patient Portal                     Physician Portal
                 |                                   |
                 +-----------------+-----------------+
                                   |
                        Firebase Firestore
                                   |
          +------------+-----------+-------------+
          |            |                         |
     Cloud Storage   Cloud Functions       Notification Service
          |            |                         |
          |            |                         |
      Uploaded      Rules Engine          Email / Push Alerts
      Documents
          |
          |
     Gemini API
(Document Extraction &
 Visit Summarization)
```

---

# 4. Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Recharts

---

## Backend

* Firebase Authentication
* Firestore
* Firebase Storage
* Firebase Cloud Functions

---

## Artificial Intelligence

Google Gemini API

Used only for:

* OCR-assisted medical document extraction
* Consultation summarization

Not used for:

* Diagnosis
* Prescription
* Clinical recommendations

---

## Deployment

* Firebase Hosting
* Vercel (optional)

---

# 5. User Roles

## Patient

Permissions

* Manage profile
* Record medications
* Record allergies
* Log symptoms
* Record vital signs
* Upload documents
* View treatment history

---

## Physician

Permissions

* View assigned patients
* Review patient trends
* Approve AI summaries
* Update treatment plans
* Review uploaded documents
* Monitor alerts

---

# 6. System Modules

## Authentication Module

Features

* Login
* Registration
* Password reset
* Role-based access

---

## Patient Health Module

Stores

* Medications
* Allergies
* Symptoms
* Vitals
* Disease-specific records

---

## Document Management Module

Allows patients to upload

* Laboratory reports
* Prescriptions
* Consultation notes

Files stored in Firebase Storage.

---

## AI Processing Module

Workflow

1. Patient uploads document.
2. Cloud Function sends file to Gemini.
3. Gemini extracts structured information.
4. Physician reviews extracted information.
5. Approved data is saved.

---

## Physician Dashboard

Displays

* Patient overview
* Recent uploads
* Vital trends
* Medication history
* Clinical alerts
* Visit summaries

---

## Rules Engine

Responsible for generating explainable alerts.

Example Rules

```
IF Blood Pressure > 140/90
THEN High Blood Pressure Alert

IF Blood Sugar > 180
THEN Hyperglycemia Alert

IF Medication not logged for 2 days
THEN Medication Adherence Alert
```

Rules are configurable and transparent.

---

# 7. User Flow

## Patient Workflow

```
Register

↓

Complete Profile

↓

Log Medication

↓

Record Symptoms

↓

Record Vitals

↓

Upload Laboratory Report

↓

Receive Reminder

↓

Physician Reviews Data
```

---

## Physician Workflow

```
Login

↓

Open Dashboard

↓

View Assigned Patient

↓

Review Trends

↓

Review AI Summary

↓

Approve or Edit Summary

↓

Update Treatment Plan

↓

Patient Receives Update
```

---

# 8. Database Design

## users

```
id
role
name
email
phone
createdAt
```

---

## patients

```
patientId
birthDate
sex
height
weight
emergencyContact
```

---

## physicians

```
physicianId
specialty
licenseNumber
```

---

## medications

```
medicationId
patientId
name
dosage
frequency
startDate
endDate
```

---

## allergies

```
allergyId
patientId
allergen
severity
reaction
```

---

## vitals

```
vitalId
patientId
type
value
unit
recordedAt
```

---

## symptoms

```
symptomId
patientId
severity
notes
recordedAt
```

---

## documents

```
documentId
patientId
storageURL
uploadedAt
status
```

---

## aiSummaries

```
summaryId
patientId
summary
approved
approvedBy
```

---

## alerts

```
alertId
patientId
rule
severity
status
timestamp
```

---

# 9. Firestore Structure

```
users/
patients/
physicians/
medications/
allergies/
symptoms/
vitals/
documents/
summaries/
alerts/
```

---

# 10. Security Design

Authentication

* Firebase Authentication

Authorization

* Role-based access

Patients

* Can access only their own records

Physicians

* Can access assigned patients only

All communication uses HTTPS.

Medical files are stored securely in Firebase Storage.

---

# 11. AI Workflow

```
Patient Uploads PDF

↓

Firebase Storage

↓

Cloud Function Trigger

↓

Gemini API

↓

Extract Structured Data

↓

Physician Review

↓

Approved Information Saved
```

---

# 12. Dashboard Design

## Patient Dashboard

Cards

* Today's Medication
* Recent Symptoms
* Upcoming Appointment
* Latest Vitals

Charts

* Blood Pressure Trend
* Blood Sugar Trend
* Weight Trend

---

## Physician Dashboard

Cards

* Assigned Patients
* High-Risk Patients
* Pending Reviews
* Active Alerts

Charts

* Population Blood Pressure Trend
* Medication Adherence
* Recent Uploads

Tables

* Latest Laboratory Reports
* Patient Timeline
* AI Summaries Awaiting Approval

---

# 13. Explainable Clinical Alerts

Every alert contains:

* Triggered rule
* Recorded value
* Threshold
* Date
* Recommended physician review

Example

```
High Blood Pressure Alert

Patient Reading:
165/102

Threshold:
140/90

Reason:
Reading exceeds configured threshold.
```

No AI-generated diagnosis is displayed.

---

# 14. Responsive Design

Supported Devices

* Desktop
* Tablet
* Mobile

The interface follows a mobile-first design approach.

---

# 15. Future Expansion

The architecture allows future integration with

* Wearable devices
* Google Fit
* Electronic Health Records (EHR)
* Telemedicine
* SMS reminders
* Additional chronic disease modules
* Predictive analytics (physician-reviewed)

---

# 16. Design Principles

* Simplicity over complexity
* Explainable clinical workflows
* Human-in-the-loop AI
* Secure by design
* Accessibility-first
* Modular architecture
* Community-focused healthcare

---

# 17. MVP Scope

The MVP includes:

✅ Patient authentication

✅ Physician authentication

✅ Patient health logging

✅ Medication tracking

✅ Allergy management

✅ Vital signs recording

✅ Symptom tracking

✅ Medical document upload

✅ AI document extraction

✅ AI visit summarization

✅ Physician dashboard

✅ Rules-based clinical alerts

✅ Treatment updates

---

# 18. Design Summary

The system follows a modular client-cloud architecture using Firebase as the backend platform and Gemini API for limited administrative AI tasks. Clinical decisions remain explainable through a deterministic rules engine, ensuring that physicians retain full authority over diagnoses and treatment plans. This design prioritizes usability, security, and scalability while delivering a practical MVP suitable for community healthcare settings and the SparkFest hackathon.