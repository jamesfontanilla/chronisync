# 🩺 Chronic Disease Management Platform

> A two-sided digital healthcare platform that empowers patients to manage chronic diseases while enabling physicians to monitor long-term health trends through explainable, physician-reviewed workflows.

---

## 📖 Overview

The **Chronic Disease Management Platform** is a web application designed to improve the management of chronic illnesses by providing patients and physicians with a shared digital health workspace.

Patients can record medications, allergies, symptoms, vital signs, and disease-specific health information, while physicians receive a centralized dashboard displaying patient trends, treatment history, clinical alerts, and AI-assisted summaries.

Unlike traditional AI-powered healthcare systems, this platform follows a **human-in-the-loop** approach:

* ✅ AI assists only with administrative tasks
* ✅ Clinical alerts are generated using transparent rules
* ✅ Physicians review every AI-generated output
* ❌ AI never diagnoses diseases or prescribes treatment

---

# 🎯 Problem Statement

Millions of people living with chronic diseases rely on handwritten notes, scattered laboratory reports, and memory to manage their health.

Healthcare providers often spend valuable consultation time reviewing fragmented medical records instead of focusing on patient care.

This leads to:

* Poor medication adherence
* Missed abnormal health trends
* Delayed interventions
* Inefficient documentation
* Difficulty monitoring long-term disease progression

---

# 💡 Solution

Our platform creates a shared digital health record between patients and physicians.

Patients can:

* Record medications
* Track allergies
* Log symptoms
* Monitor vital signs
* Upload laboratory reports
* View treatment history

Physicians can:

* Monitor patient progress
* Review longitudinal health trends
* Receive explainable clinical alerts
* Review uploaded documents
* Approve AI-generated visit summaries
* Update treatment plans

---

# 🌍 Community Impact

### Primary Beneficiaries

* Patients living with chronic diseases
* Senior citizens
* Community healthcare workers
* Physicians
* Rural health clinics

---

# ✨ Features

## 👤 Patient Portal

* Secure Authentication
* Medication Tracker
* Allergy Management
* Vital Signs Logging
* Symptom Journal
* Disease Monitoring
* Laboratory Report Upload
* Treatment History
* Responsive Dashboard

---

## 👨‍⚕️ Physician Portal

* Patient Dashboard
* Longitudinal Health Trends
* Treatment Updates
* Clinical Alerts
* Document Review
* AI Visit Summary Approval
* Patient Timeline

---

## 🤖 Responsible AI

The platform integrates the **Google Gemini API** for low-risk administrative assistance.

### AI Features

* Medical document extraction
* Consultation summarization

### AI Restrictions

The AI **does not**:

* Diagnose diseases
* Recommend medications
* Modify treatment plans
* Override physician decisions

Every AI-generated output must be reviewed and approved by a physician before becoming part of the patient's medical record.

---

# 🏥 Supported Diseases (MVP)

* Diabetes
* Hypertension

The system architecture is modular and allows future support for additional chronic diseases.

---

# 🧠 Rules-Based Clinical Alerts

Clinical alerts are generated through deterministic medical rules rather than generative AI.

Examples:

* Blood Pressure > 140/90 mmHg
* Blood Glucose > 180 mg/dL
* Missed Medication Logging
* Consecutive Abnormal Readings

Each alert includes:

* Triggered rule
* Recorded value
* Threshold
* Explanation

---

# 🏗️ System Architecture

```text
Patient Portal
        │
        ▼
Firebase Authentication
        │
        ▼
Firestore Database
        │
        ├──────────► Firebase Storage
        │                    │
        │                    ▼
        │             Medical Documents
        │                    │
        ▼                    ▼
Rules Engine          Gemini API
        │                    │
        ▼                    ▼
Clinical Alerts    AI Extraction & Summary
        │                    │
        └────────────┬────────┘
                     ▼
             Physician Dashboard
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js 15
* React 19
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

* Google Gemini API

---

## Validation

* React Hook Form
* Zod

---

# 📁 Project Structure

```text
app/
components/
features/
services/
lib/
firebase/
functions/
hooks/
schemas/
types/
docs/
public/
```

---

# 🚀 Getting Started

## Prerequisites

* Node.js 22+
* pnpm
* Firebase Project
* Google Gemini API Key

---

## Installation

```bash
git clone https://github.com/your-org/chronic-disease-management.git

cd chronic-disease-management

pnpm install
```

---

## Environment Variables

Create a `.env.local` file.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=

NEXT_PUBLIC_FIREBASE_PROJECT_ID=

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

NEXT_PUBLIC_FIREBASE_APP_ID=

GEMINI_API_KEY=
```

---

## Run Development Server

```bash
pnpm dev
```

Application runs at

```text
http://localhost:3000
```

---

# 📊 MVP Scope

### Patient

* Authentication
* Medication Tracking
* Allergy Tracking
* Vital Signs
* Symptoms
* Disease Monitoring
* Document Upload

---

### Physician

* Dashboard
* Patient Review
* Clinical Alerts
* Treatment Updates
* AI Summary Review

---

### AI

* Medical Document Extraction
* Visit Summarization

---

# 🔐 Security

* Firebase Authentication
* HTTPS Encryption
* Role-Based Access Control
* Secure Cloud Storage
* Firestore Security Rules

---

# 📈 Future Improvements

* Mobile Application
* Wearable Device Integration
* Google Fit Integration
* Telemedicine
* SMS Notifications
* Appointment Scheduling
* Additional Chronic Diseases
* Electronic Health Record Integration
* Predictive Risk Scoring (Physician Reviewed)

---

# 📚 Documentation

| Document          | Description                                |
| ----------------- | ------------------------------------------ |
| `requirements.md` | Functional and non-functional requirements |
| `design.md`       | System architecture and technical design   |
| `roadmap.md`      | Planned development milestones             |
| `architecture.md` | Detailed architecture overview             |
| `api.md`          | API documentation                          |

---

# 👥 Team

| Role               | Member |
| ------------------ | ------ |
| Project Manager    | TBD    |
| Frontend Developer | TBD    |
| Backend Developer  | TBD    |
| AI Engineer        | TBD    |
| UI/UX Designer     | TBD    |

---

# 📜 License

This project is licensed under the MIT License.

---

# ❤️ Acknowledgements

Built for **SparkFest 2026** to support smarter, safer, and more inclusive communities through responsible healthcare technology.

Special thanks to:

* Google Gemini API
* Firebase
* Next.js
* React
* Tailwind CSS
* shadcn/ui

---

> **Building technology that empowers patients, supports healthcare professionals, and keeps humans at the center of every clinical decision.**