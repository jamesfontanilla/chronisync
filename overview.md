Here is the conversion of the provided document into a Markdown file, covering the core overview, problem framing, and supported disease metrics:

# Chronic Disease Monitoring Platform - Full App Overview

## 1. Concept

An AI-assisted, guideline-grounded chronic disease monitoring platform connecting patients and physicians through continuous, structured data exchange. Patients log daily metrics, medications, symptoms, lifestyle, and free-text journal entries. The system contextualizes that data against disease-specific clinical guidelines, then generates AI summaries, trend explanations, and alerts for both patient and doctor - without diagnosing or prescribing.

The core differentiator is not "AI in healthcare" generically - it's that every Al output is grounded in a retrieved, disease-specific knowledge pack rather than the model's unconstrained internal knowledge, keeping outputs transparent, auditable, and clinician-reviewable.

## 2. Problem framing

Chronic disease management happens almost entirely outside the clinic. Between visits: symptoms get forgotten, medications change, vitals fluctuate, lifestyle factors compound and by the time of a consultation, the physician is reconstructing months of patient history from incomplete recall. Existing tools split into two camps that don't talk to each other: EMRs that only capture in-clinic events, and personal health-journal apps that never reach clinical decision-making. This platform sits in the gap, structuring the at-home data stream so it's clinically usable at the point of care.

## 3. Users

* Primary - patients managing one or more of four chronic conditions.


* Secondary - physicians, specialists, and caregivers (caregiver access is optional, attached during onboarding).



## 4. Supported diseases - metrics, thresholds, and computations

Each disease's knowledge pack is built from a small set of numeric thresholds and one or two derived computations, sourced directly from the named guideline body. These are what the offline rule engine evaluates locally (see section 12) and what the retrieval layer hands the LLM as grounding context. Figures below reflect each body's most current published standards.

### 4.1 Type 2 diabetes - American Diabetes Association (ADA), Standards of Care in Diabetes

| Metric | Threshold / target | Source |
| --- | --- | --- |
| HbA1c, general adult target

 | <7%

 | ADA Standards of Care 2026, Glycemic Goals

 |
| Time in range (TIR), glucose 70-180 mg/dL

 | >70% of readings

 | ADA Standards of Care 2026

 |
| Time below range (TBR), glucose <70 mg/dL

 | <4% of readings

 | ADA Standards of Care 2026

 |
| Time below range, serious hypoglycemia <54 mg/dL

 | <1% of readings

 | ADA Standards of Care 2026

 |
| Systolic BP goal for those at high cardiovascular/kidney risk

 | <120 mmHg

 | ADA Standards of Care 2026, Cardiovascular Disease and Risk Management

 |
| Weight loss target for overweight/obesity, to improve glycemia

 | 5-7% of body weight

 | ADA Standards of Care 2026

 |

**Computations the app performs:**

* Time in range (%) = (count of glucose readings between 70-180 mg/dL ÷ total readings in period) × 100. Computed per rolling 14-day or 90-day window, matching the CGM-metric convention ADA uses alongside HbA1c.


* Before/after-meal delta = after-meal glucose - before-meal glucose, flagged when the rise exceeds the patient's individualized post-meal target (commonly used as a coaching signal, not a diagnostic one).


* Glucose management indicator (GMI), an estimated Alc-equivalent calculated from mean CGM glucose, surfaced only when ≥14 days of CGM data exist in the window. This mirrors the ADA's own GMI methodology rather than waiting for a lab-drawn A1c.


* Adherence rate (%) = (doses logged as taken ÷ doses scheduled) × 100 over the summary window, feeding directly into the "medication adherence: 94%" line shown in the doctor's consultation brief.



**Local alert rule example:** TBR <70 mg/dL exceeding 4% of readings over a rolling 7-day window → flag for clinician review, mirroring the ADA's stated hypoglycemia threshold rather than an arbitrary cutoff.

### 4.2 Hypertension - American Heart Association / American College of Cardiology (AHA/ACC) Blood Pressure Guideline

| Category | Systolic (mmHg) | Diastolic (mmHg) | Source |
| --- | --- | --- | --- |
| Normal

 | <120

 | and <80

 | ACC/AHA Hypertension Guideline

 |
| Elevated

 | 120-129

 | and <80

 | ACC/AHA Hypertension Guideline

 |
| Stage 1 hypertension

 | 130-139

 | or 80-89

 | ACC/AHA Hypertension Guideline

 |
| Stage 2 hypertension

 | ≥140

 | or ≥90

 | ACC/AHA Hypertension Guideline

 |
| SBP goal, high CV/kidney risk (ADA-aligned)

 | <120

 |  | ADA Standards of Care 2026, Recommendation 10.4

 |

**Computations the app performs:**

* Classification function: each logged reading is mapped to the table above automatically - a reading of 134/78 returns "stage 1 hypertension" because the systolic value alone (130-139) qualifies, even though diastolic is normal; the rule is OR, not AND, on each boundary.


* Rolling average (7-day and 30-day) computed separately for systolic and diastolic, since classification should be based on consistent patterns rather than a single elevated reading - a single 142 systolic reading is not, by itself, stage 2 hypertension under the guideline's intent.


* Pulse pressure = systolic - diastolic, tracked as a secondary indicator of arterial stiffness over time, not independently thresholded in the MVP.



**Local alert rule example:** 3 or more consecutive readings ≥140/90 within a 14-day window → flag as a stage 2 pattern worth discussion, rather than alerting on every single elevated reading (which would cause alert fatigue).

### 4.3 Chronic kidney disease - Kidney Disease: Improving Global Outcomes (KDIGO)

CKD staging combines two independently measured axes: glomerular filtration rate (GFR) and albuminuria (urine albumin-to-creatinine ratio, UACR). A diagnosis requires either abnormality to persist for more than 3 months a single abnormal lab value does not establish CKD.

| GFR category | eGFR (mL/min/1.73m²) | Albuminuria category | UACR (mg/g) |
| --- | --- | --- | --- |
| G1

 | ≥90

 | A1 (normal/mildly increased)

 | <30

 |
| G2

 | 60-89

 | A2 (moderately increased)

 | 30-300

 |
| G3a

 | 45-59

 | A3 (severely increased)

 | >300

 |
| G3b

 | 30-44

 |  |  |
| G4

 | 15-29

 |  |  |
| G5

 | <15

 |  |  |

Source: KDIGO Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease.

**Computations the app performs:**

* The app does not calculate eGFR itself (that requires serum creatinine, age, sex, and the CKD-EPI 2021 equation, run by the lab) - it ingests the lab-reported eGFR and UACR values and places them on the G/A grid above to generate a plain-language risk band (low/moderately increased / high / very high), matching KDIGO's published heat map.


* Weight change rate = (current weight - weight 7 days prior) ÷ 7, flagged when it exceeds roughly 1 kg over 2-3 days, since rapid weight gain in CKD is a fluid-retention proxy worth surfacing even between formal visits.


* Fluid balance estimate = logged fluid intake - estimated output (for patients with a prescribed fluid restriction), shown as a running daily total against the physician-set limit.


* Medication adherence rate, computed the same way as in the diabetes module, since RAAS blockade (ACE inhibitor/ARB) adherence is itself a KDIGO-recommended monitoring point for slowing progression.



**Local alert rule example:** eGFR drop of ≥5 mL/min/1.73m² between two consecutive lab entries, or UACR crossing from A1/A2 into A3 → flag for clinician review, since both indicate a meaningful change in CKD risk band rather than normal lab variability.

## 5. Patient-facing features

* **Smart onboarding** - disease selection (supports multiple conditions), age, weight, height, current medications, assigned physician, optional caregiver. This single step auto-configures which dashboard modules, diary fields, and alert thresholds the patient sees from that point forward.


* **Disease-adaptive dashboard** - the same shell, different priority modules per condition. A diabetes patient's home screen leads with glucose, HbA1c, meals, and exercise; a CKD patient's leads with weight, blood pressure, fluid intake, and swelling. Based on the reference screens, the dashboard is organized as stacked cards (Blood Glucose, Blood Pressure, Weight, Diet, Exercise, Steps, A1C), each showing a recent-window summary, a distribution breakdown (good / high/low), and a trend sparkline, with a tap-through to the full trend view.


* **Medication management** - add medications, set dosage and schedule, log reminders, record missed doses, track prescription changes over time. Includes a dedicated "Medication & Reminders" and "Prescription History" area, separate from daily logging.


* **Daily health diary** - structured quick-log tiles (Glucose, Pressure, Weight, Medication, Diet, Exercise) plus unstructured free text and voice entries ("I've been feeling unusually tired after lunch"). Free text is not just stored - it becomes additional context retrieved alongside structured data when generating summaries.


* **AI food recognition** - patient photographs a meal; computer vision estimates meal type, nutritional composition, and approximate portion size. Output is tied back to the active disease's dietary guidance (e.g., carb-counting framing for diabetes, sodium framing for hypertension/CKD) rather than generic nutrition info.


* **Trend visualization** - daily / weekly / monthly views across vitals, medication adherence, and symptom severity, including before/after-meal glucose comparisons and time-of-day range breakdowns (wake-up, before/after each meal, bedtime, exercise windows).


* **Lab results and sync** - manual or synced lab values (including A1C), device sync (CGM and other connected devices), favorite-food shortcuts, and a BG measurement plan for structuring when readings should be taken.


* **PDF/Excel export** - patients (or doctors) can export structured reports for offline review or insurance/referral purposes.



## 6. Physician-facing features

* **Doctor dashboard** - a chronological patient view: timeline → trend graphs → medication history → lab values → patient diary → AI consultation summary. Modeled on EHR review patterns (Epic-style) so a clinician can scan months of data in the time it currently takes to skim a paper chart.


* **AI consultation summary** - instead of reading every entry, the physician gets a condensed 90-day brief, e.g.: medication adherence at 94%, glucose trending down overall, a dizziness episode following a medication adjustment, declining exercise frequency over the last month, and a short list of topics worth raising in today's visit. This is explicitly a chart-review time-saver, not a clinical decision in itself.


* **Medication interaction flagging** - the system checks logged medications against known interaction patterns and surfaces flags to both patient and physician, separate from the guideline-based vital alerts.

## 7. AI architecture

The pipeline is identical across all four diseases - only the retrieved knowledge changes:

1. Patient data (structured logs + diary text + photos + labs) is captured per disease module.


2. Disease module routes the request to the correct clinical knowledge pack.


3. A retrieval layer pulls the relevant guideline sections and the patient's recent history.


4. The LLM generates output constrained by what was retrieved, not by open-ended reasoning.


5. Output splits into four product surfaces: patient summary, doctor consultation summary, plain-language trend explanation, and guideline-grounded alert.



Guideline-grounded alerts compare patient data directly against the disease's knowledge pack rather than letting the model freely decide what's concerning - examples include persistently elevated glucose, repeated missed medications, worsening symptom trends, rapid CKD weight swings, and increased COPD rescue-inhaler use. The system is explicit that it surfaces patterns for review, not diagnoses or treatment recommendations; a clinician stays in the loop for every clinically meaningful decision.

## 8. Standards and interoperability

* **Data schema** - modeled on Fast Healthcare Interoperability Resources (FHIR), e.g. Observation, MedicationStatement-style resources, to ease future integration with hospital systems.


* **Clinical workflow** - informed by OpenMRS conventions: structured records, longitudinal patient histories, modular forms per condition.


* **Clinician UI** - informed by Epic-style EHR interaction patterns: dense but scannable, chronological, optimized for fast review rather than data entry.



## 9. Information architecture (navigation)

Bottom tab bar: Dashboard, Diary, Add (+), Partners, More.

* **Dashboard** - disease-adaptive summary cards (Blood Glucose, Blood Pressure, Weight, Diet, Exercise, Steps, A1C), each with trend window and "All periods" filter.


* **Diary** - searchable, filterable log list with a Table View toggle; quick-entry guide surfaces Glucose / Pressure / Weight / Medication / Diet / Exercise tiles plus shortcuts (Sync Device, Food Photo AI, Lab Results, Log with Voice).


* **Add (+)** - central quick-capture action, disease-aware.


* **Partners** - caregiver/physician connections, with a notification badge for pending items.


* **More** - settings hub: PDF Report/Excel export, Sync Device, Connect Apps & Devices (incl. CGM), Units, Goals, Daily Routine, BG Measurement Plan, Favorite Food, Medication & Reminders, Lab Results (incl. A1C), Prescription History, Profile.



## 10. Patient onboarding-to-insight flow

1. Smart onboarding - disease, biometrics, medications, physician/caregiver linkage.


2. Disease-specific dashboard auto-configures around that condition's priority metrics.


3. Patient logs through Quick log, Food photo AI, Diary entry, or Medication log - any combination, any frequency.


4. Logged data (structured + unstructured) feeds the AI orchestration layer.


5. Two parallel outputs surface: a patient-facing trend explanation in plain language, and a doctor-facing consultation brief with talking points for the next visit.



## 11. What makes this different from a standard symptom tracker

A conventional tracker collects and graphs data. This platform additionally retrieves disease-specific clinical guidance before generating any AI output, so summaries, explanations, and alerts are traceable back to an established reference (ADA, AHA, KDIGO, GOLD) rather than purely model-internal reasoning. That grounding is what makes the same AI pipeline extensible to new diseases - adding a condition means authoring a new knowledge pack, not retraining or redesigning the system - while keeping the physician as the final decision-maker rather than positioning AI as a diagnostic authority.

## 12. Offline-first architecture

This matters more here than in most apps - chronic disease patients log data multiple times a day, often at home with unreliable connectivity, and a missed glucose reading because the app couldn't save offline defeats the entire premise of continuous monitoring. The design principle: logging always works offline; AI generation does not, and the UI should be honest about that distinction rather than hiding it.

**What works fully offline**

* All structured logging - glucose, BP, weight, medication taken/missed, exercise, diet quick-log. These write to a local on-device database (e.g. SQLite via a local-first framework) immediately, no network required.


* Diary entries (text and voice-to-text) - saved locally; voice transcription can run on-device using the phone's native speech-to-text API rather than a cloud service, so it doesn't depend on connectivity either.


* Dashboard and trend graphs - built entirely from local data. A patient should be able to scroll their last 30 days of glucose trends on a plane with no signal.


* Guideline-grounded alerts, in a reduced form - this is the key unlock. The disease knowledge packs are just structured rule sets (thresholds, frequency checks, pattern definitions), not the LLM itself. Ship the relevant knowledge pack to the device at onboarding (it's small - a few KB of JSON per disease) and run the rule-matching locally. A patient missing three doses in a row, or three glucose readings over threshold, can trigger a "this is worth discussing with your doctor" flag completely offline, because that's deterministic threshold logic, not generation.


* Medication reminders and scheduling - local notifications, no network dependency.



**What requires connectivity**

* AI consultation summaries and plain-language trend explanations - these need the LLM call, which means an API round-trip. No viable on-device LLM today produces clinically-careful, guideline-grounded prose at the quality bar this product needs.


* Food-photo AI - the computer vision step needs either a cloud vision API or a model too large to ship on-device at usable accuracy. The photo itself saves locally immediately; the AI estimate populates in once connectivity returns.


* Doctor dashboard sync - the physician obviously can't see data that hasn't left the patient's device yet.


* Drug interaction checks against the live RxNav/DrugBank API - though a small, curated offline interaction list (the patient's own active medications cross-checked against each other) can ship locally as a fallback, covering the common cases even without connectivity.



**Sync model**

1. Every local write gets a queued sync record (created_at, device_id, sync_status: pending/synced/conflict).


2. When connectivity returns, the queue flushes to the backend in order; each successful sync triggers the relevant AI processing (summary regeneration, food-photo analysis, doctor-side update) server-side.


3. Conflict handling stays simple because most data here is append-only (a glucose reading is a new event, not an edit to a shared record) - conflicts mainly arise if the same entry was edited on two devices before either synced. Last-write-wins by timestamp is acceptable for v1; flag true conflicts (e.g., two different glucose values logged for the same timestamp) for the patient to resolve manually rather than silently picking one.


4. The UI should show sync state honestly: a small indicator (queued/syncing/synced) on each entry, and a clear "AI summary not yet generated - needs connection" state on the doctor-facing summary rather than showing a stale one without saying so.



**Why this doesn't compromise the "AI-grounded" pitch**
The platform's differentiator was never "AI runs everywhere" - it's that Al output is grounded in clinical guidelines rather than free-form reasoning. Offline-first actually reinforces that story: the guideline rules are lightweight enough to live on-device and catch the most time-sensitive patterns (missed meds, dangerous vitals) instantly, without waiting on a network call or an LLM response. The LLM layer adds richer narrative summaries on top once connectivity is back, but it's explicitly the enhancement layer, not the safety layer - which is arguably a stronger clinical design than depending on a network call for anything urgent.

flowchart TD
    %% Top Level
    Launch[App launch] --> Onboard[Smart onboarding]
    
    %% Onboarding Split
    Onboard --> Disease[Select chronic disease]
    Onboard --> Biometrics[Enter age, weight, height]
    Onboard --> Physician[Assign physician]
    Onboard --> Caregiver[Add caregiver optional]
    
    %% The long right-hand pathway connecting onboarding to current medications
    Onboard --> CurrentMeds[Add current medications]
    
    %% Dashboard Configuration
    Disease --> Config[Disease specific dashboard configured]
    Biometrics --> Config
    Physician --> Config
    Caregiver --> Config
    
    Config --> Action{Patient action}
    
    %% Medication loop feeds back into the patient action loop
    CurrentMeds --> Action
    
    %% The 4 Logging Entry Points
    Action --> Vitals[Quick log glucose, BP, weight]
    Action --> FoodAI[Food photo AI]
    Action --> Diary[Diary entry: text or voice]
    Action --> MedLog[Medication log: taken or missed]
    
    %% Food Photo Sub-process
    FoodAI --> Estimate[AI estimates meal type, macros, portion]
    Estimate --> Confirm[Patient confirms or edits estimate]
    
    %% Convergence point
    Vitals --> Saved[Entry saved]
    Confirm --> Saved
    Diary --> Saved
    MedLog --> Saved
    
    %% AI Pipeline
    Saved --> AILayer[AI orchestration layer]
    AILayer --> Retrieve[Retrieves disease knowledge pack + patient history]
    Retrieve --> Output{Output type}
    
    %% 4 Output Types
    Output --> PatTrend[Patient: trend explanation]
    Output --> PatAlert[Patient: guideline alert if pattern detected]
    Output --> DocSumm[Doctor: 90-day consultation summary]
    Output --> Flag[Doctor + patient: medication interaction flag]
    
    %% User Interfaces
    PatTrend --> PatScreen[Dashboard / Diary screen]
    PatAlert --> PatScreen
    
    DocSumm --> DocScreen[Doctor dashboard]
    Flag --> DocScreen
    
    %% Patient Review Path
    PatScreen --> PatReview{Review trends}
    PatReview --> TapCard[Tap card for full trend view]
    
    %% Doctor Review Path & Loop Closure
    DocScreen --> DocReview[Timeline - trends - meds - labs - diary - AI summary]
    DocReview --> Consult[Consultation: discuss flagged topics]
    Consult --> Update[Physician updates medication or care plan]
    
    %% Loop closes back to Add current medications
    Update --> CurrentMeds

*(Referencing the flow diagram)*
Reading this top to bottom: onboarding happens once and determines which dashboard modules appear. After that, the patient's loop is the same regardless of disease - log through one of four entry points, the AI orchestration layer grounds that entry against the disease knowledge pack and history, and the result splits into a patient-facing read (trend explanation, alert) and a doctor-facing read (consultation summary, interaction flag). The loop closes when a physician updates the medication list during a consultation, which feeds back into the patient's medication log - the one place where doctor action visibly changes what the patient sees next.

Two points worth flagging in this flow: the food-photo path has an explicit confirm/edit step before anything reaches the AI layer (per the resolved open question above), and the patient-side alert path is deliberately separate from the doctor-side consultation summary a patient sees a plain-language trend note, while the doctor sees the fuller clinical brief, so the same underlying signal is framed differently for each audience.

## 15. Regulatory classification - is this a medical device?

This is the question that determines how cautiously the AI-output features need to be designed, so it's worth answering directly rather than leaving implicit in the "we don't diagnose" framing.

In the US, the FDA's Clinical Decision Support (CDS) framework - established under Section 3060(a) of the 21st Century Cures Act and clarified in the FDA's most recent CDS guidance - excludes certain software from the medical device definition entirely, avoiding premarket review. To qualify as "Non-Device CDS," software generally needs to meet four criteria: it doesn't acquire, process, or analyze a medical image, signal, or in-vitro diagnostic pattern directly; it displays or analyzes medical information (like clinical practice guidelines) rather than generating a novel diagnostic signal; it's intended to inform rather than direct a clinician's judgment; and it allows the clinician to independently review the basis for any recommendation rather than acting as a black box.

This platform's design already aligns with most of that framing: the AI consultation summary and trend explanation surface patterns in patient-reported and lab data rather than analyzing a raw signal (no ECG waveform interpretation, no image-based diagnosis attempt), the doctor dashboard explicitly surfaces the underlying diary, trends, and lab values alongside the summary so the clinician can independently verify it, and the product copy is explicit that the system "highlights patterns that may warrant medical review" rather than issuing a diagnosis or treatment recommendation. The one feature worth flagging against this framework specifically is AI food-photo recognition, since image analysis is closer to the kind of signal-processing the FDA's first CDS criterion is built around - though here it's classifying food, not a diagnostic image, which is a meaningfully different risk category, but worth a one-line note in any future regulatory review rather than assuming it's automatically exempt.

This guidance is US-specific. The Philippines does not currently have a dedicated SaMD framework as developed as the FDA's, so the more directly applicable Philippine law for this platform is the data privacy framework below - but the "informs, doesn't direct" design principle is good practice regardless of jurisdiction, since it's both lower-risk and more honest about what an LLM-based summary actually is.

## 16. Data privacy - Philippine context (RA 10173)

Since this product is built for a Philippine hackathon and a Filipino user base, the directly governing law is the Data Privacy Act of 2012 (Republic Act No. 10173), enforced by the National Privacy Commission (NPC) - not HIPAA, which is a US-only framework and shouldn't appear in the pitch even by reflex, since using it signals a US-template mental model rather than local awareness.

Why this matters more than usual here. RA 10173 classifies health information as Sensitive Personal Information (SPI) - a defined category that explicitly includes "information about an individual's health, education, genetic, or sexual life" - alongside race, religious affiliation, and government-issued IDs. Processing of SPI is prohibited by default and only permitted under specific exceptions, the most relevant being: the data subject's explicit, purpose-specific consent given prior to processing; necessity to protect the data subject's life and health; or processing by medical professionals/institutions under confidentiality obligations.

**Practical implications for this build:**

* Every consent screen in onboarding needs to be specific to processing of health data, not a single generic "I agree to terms" checkbox - RA 10173 requires consent that is "freely given, specific, and informed," which a bundled terms-of-service checkbox does not satisfy for SPI.


* Patients have enforceable rights under the Act worth designing for early rather than retrofitting: right to be informed before data is processed, right to access their own data, right to correction, and right to erasure/deletion on request.


* If sharing data with a physician or caregiver, that's a separate disclosure event requiring its own consent basis bundling "share with my doctor" into the original signup consent is the kind of vague-scope consent the NPC's guidelines specifically discourage.


* Cross-border data transfer matters if any backend infrastructure (cloud hosting, the LLM API itself) is outside the Philippines - RA 10173 requires the receiving party/country to have adequate protection in place, typically handled via data processing agreements with the cloud or AI vendor.


* Penalties are real, not symbolic: unauthorized processing of sensitive personal information carries three to six years' imprisonment and fines up to P4 million under RA 10173 a strong argument for getting consent flows right from the prototype stage rather than treating them as a later compliance pass.


* At scale (1,000+ individuals' sensitive data, or operating in a high-risk sector like healthcare), the Act requires registration of the data processing system with the NPC not a hackathon-stage concern, but worth knowing for a post-hackathon roadmap.



## 17. Liability and disclaimer framing

Beyond the product copy already noting the system "highlights patterns" rather than diagnosing, the open question is what happens at the moment a physician acts on - or misses something because of an Al-generated summary.

**Two practical decisions worth making explicit:**

* **In-product disclaimer, not just a terms-of-service clause.** AI-generated summaries should carry a visible, persistent label in the doctor and patient UI itself (e.g. "AI- generated summary - review source data before clinical decisions"), not just buried legal language. This is consistent with the FDA's fourth CDS criterion above - letting the clinician independently verify the basis for any AI output - and it's also simply better design: it sets the right expectation at the point of use rather than relying on someone having read a ToS months earlier.


* **Source-data traceability.** Every line in an AI summary should be traceable back to the specific diary entries, vitals, or lab values that generated it (this is already implicit in the doctor dashboard's chronological layout - timeline → trends → meds → labs → diary → AI summary since the underlying data sits one screen away from the summary, not buried behind it).



Neither of these requires legal counsel to implement for a hackathon demo, but the "AI-generated, review before deciding" label on the doctor's consultation summary card is a cheap, visible signal to judges that the team understands the difference between decision support and decision-making.

## 18. LLM cost, latency, and generation cadence

Worth a rough sanity check before assuming every interaction triggers a fresh AI call, since that's the most common way a hackathon prototype's architecture quietly becomes unworkable at any real scale.

The naive approach - regenerate the patient trend explanation and re-run guideline checks on every single logged entry means a patient logging glucose 4x a day plus a diary entry plus a meal photo could trigger 5-6 LLM calls daily, each with its own latency (typically 1-3+ seconds for a grounded generation call) and cost. Multiplied across many patients, this is both slow for the user (a logging action shouldn't visibly wait on an LLM round-trip) and unnecessarily expensive.

**A more sustainable cadence, consistent with the offline-first design in section 12:**

* **Local, instant, free** - guideline threshold checks (the rule-engine alerts described in section 4) run synchronously on-device the moment an entry is logged, since these are deterministic lookups, not generation.


* **Patient trend explanation** - regenerated on a daily batch cadence (e.g. once per day, or on next app open after new data exists) rather than per-entry, since a plain-language "your glucose has trended down this week" doesn't meaningfully change between two log entries an hour apart.


* **Doctor consultation summary** - generated ahead of a scheduled visit (e.g. triggered 24 hours before an upcoming appointment, or on-demand when the doctor opens that patient's chart) rather than continuously, since its entire purpose is pre-visit chart review, not real-time monitoring.


* **Food-photo AI** - necessarily per-photo (it's the core interaction), but this is a single vision-model call per meal logged, not a chain of calls, and the confirm/edit step from section 14 already debounces it from immediately propagating into the AI orchestration layer.



This cadence also means the sync queue described in section 12 isn't just for offline support it's the same mechanism that naturally batches AI generation triggers, so the offline architecture and the cost-control architecture are largely the same design decision viewed from two angles.

## 19. Accessibility for the actual patient population

The four supported conditions skew toward an older patient population, and CKD and COPD patients in particular are more likely to have reduced dexterity, lower vision, or fatigue that makes small-target, text-dense interfaces genuinely harder to use than they would be for a typical consumer app's user base. This isn't a generic "accessibility is good practice" note it's specific to who this product is actually for.

**Concrete implications, several of which are already implicit in the reference screens:**

* **Large touch targets** for the quick-log tiles (Glucose, Pressure, Weight, Medication, Diet, Exercise) - the dashboard's card-based layout already supports this, but tap targets should stay comfortably above standard minimum sizes rather than shrinking to fit more on screen.


* **Voice logging** (already present in the diary shortcuts) should be treated as a primary input method for some users, not a novelty feature - for a COPD patient who's breathless or a CKD patient with limited hand strength, speaking an entry is meaningfully easier than typing one.


* **High contrast and legible type** the current dashboard's heavy reliance on light-gray "No Data" placeholder text and thin sparkline charts is a pattern worth revisiting for this specific population; default to higher-contrast numerals and labels over decorative restraint.


* **Plain-language AI output, deliberately** - the trend explanation example in section 7 ("your blood pressure has gradually increased...") is already written in accessible language rather than clinical jargon; this should be treated as a hard requirement of the knowledge-pack prompt design, not an incidental style choice.


* **Caregiver log-on-behalf-of** (section 14) functions as an accessibility fallback as much as a convenience feature - for patients who genuinely cannot operate the app, it's the difference between data existing and not existing at all.



## 20. Food-photo AI failure handling

The correction-step UX (confirm/edit before the AI layer ingests it, section 14) solves the "AI is plausible but wrong" case. It doesn't solve the case where the model can't produce a usable estimate at all - bad lighting, multiple overlapping dishes, an unfamiliar regional dish not well represented in the vision model's training data, or a blurry photo.

The fallback should be a graceful drop-down to manual entry, not a dead end or a forced retake loop: if confidence is low or the model returns nothing usable, the screen should offer a simple manual-entry form (meal type, rough portion, optional macros) pre-populated with nothing rather than a wrong guess, so the patient isn't stuck staring at a failed scan with no way to log their meal. This also matters specifically for Filipino dishes, which are likely underrepresented in vision models trained primarily on Western food datasets - worth treating manual fallback as a first-class path rather than an edge case, given the target user base.

## 21. Scope for the hackathon demo - build vs. mock

Following the same scope-cutting discipline as the Tuklas PRD (Level 3 fully built, Levels 1-2 stubbed, map rendered to Level 15 as placeholders), this platform's full vision is not what should be built end-to-end in a hackathon timeframe. A suggested split:

**Fully wired, real AI calls:**

* One disease - diabetes is the strongest pick, since glucose has the clearest before/after-meal narrative and the richest demo-friendly visuals already present in the reference screens (BG comparison, meal logging, trend charts).


* The full logging-to-AI-summary loop for that one disease: quick log → AI orchestration → both a patient trend explanation and a doctor consultation summary, generated live during the demo on seeded data.


* The local guideline-alert rule engine (e.g. the TBR <70 mg/dL threshold from section 4.1), since it's cheap to implement and demonstrates the "guideline-grounded, not free-form" pitch concretely.



**Mocked or stubbed for the demo:**

* The other three diseases (hypertension, CKD, COPD) - static dashboard mockups showing the disease-adaptive UI concept, not live AI generation. This proves the architecture is extensible without building four full pipelines.


* The doctor dashboard - seeded with pre-built demo data rather than requiring a live second account and a real patient-physician pairing flow during the pitch.


* Food-photo AI - either a pre-selected demo photo with a working live call, or a recorded fallback if live vision-API latency is a demo-day risk.


* CGM/device sync and offline conflict resolution - describe the architecture (it's already in section 12) rather than building real device integration, which is its own multi-week project.



The pitch narrative this supports: "the AI pipeline is disease-agnostic here's diabetes working end-to-end, and here's what the same architecture looks like extended to three more conditions," which demonstrates the extensibility claim from section 11 without needing four times the build effort.

## 22. Open questions, resolved

* **Knowledge pack licensing (ADA/AHA/KDIGO/GOLD).** None of these bodies offer a licensable API or dataset - their guidelines are published documents, not licensed data. You cannot redistribute their text wholesale inside a knowledge pack. The practical path is a one-time authoring pass: read each guideline and extract it into your own structured rules (thresholds, monitoring frequency, warning signs) written in your own words, with a citation trail back to the guideline version/year. This is standard practice for clinical decision support tools. For an MVP, 5-10 guideline-derived rules per disease in a JSON/YAML pack is enough. Licensing only becomes a real legal question if the product is commercialized.


* **Food-photo AI correction step.** Yes - required, not optional. A misclassified meal can silently produce a wrong trend explanation (e.g., a false "carb intake increased" read for a diabetes patient). Pattern: the AI estimate populates the log as a draft; the patient gets a quick confirm/edit screen (meal type, macros, portion) before it saves. Only the confirmed version feeds the retrieval layer. This also becomes the natural place to collect correction data for improving the vision model later.


* **Caregiver permission model.** Two tiers, default to the simpler one:


* **Read-only (default)** - caregiver sees dashboard, trends, diary, and receives the same alerts as the patient.


* **Log-on-behalf-of** - caregiver can also create diary/vitals/medication entries, important for CKD/COPD patients who are often older or less mobile.


* Every entry should be tagged with who logged it (logged_by: caregiver VS logged_by: patient) both for AI summary accuracy and so the doctor isn't confused about data provenance. Caregiver access requires the patient's explicit invite/approval, not the reverse.




* **Medication interaction checks vs. guideline-grounded alerts.** These are two distinct subsystems and should not share a pipeline:


* Interaction checking is a deterministic lookup against a known drug-interaction database, not an LLM reasoning task. DrugBank's drug-drug interaction dataset feeds directly into the National Library of Medicine's free RxNav/RxNorm Interaction API, which requires no license - the right MVP path, though it draws from the non- commercial DrugBank tier and doesn't carry severity ratings. The full DrugBank Clinical API adds severity levels (mild/moderate/severe) plus management guidance and references, but is a paid commercial product. First Databank - the interaction source actually embedded in Epic and Oracle Health - is enterprise-licensed for large health systems and isn't realistically accessible to a small team; treat it as a "later, if this becomes a real company" decision.


* Guideline-grounded alerts run through the retrieval-plus-LLM pipeline against the disease knowledge packs - probabilistic pattern-matching on logged data over time, not a lookup.


* Both can surface as "alerts" in the UI but should be visually and structurally distinguishable: an interaction flag means "these two drugs are known to conflict"; a guideline alert means "this trend matches a pattern worth a conversation." Conflating them risks the AI orchestrator appearing to make clinical judgments it isn't qualified to make.




* **Data retention and consent for FHIR-style records, especially CGM/device sync.**
* **Consent granularity** - separate consent for (a) the app storing health data at all, (b) sharing with the assigned physician, (c) caregiver access, and (d) device/CGM sync, since CGM is continuous, high-volume, passive data collection patients may not fully register as such.


* **Retention window** - decide explicitly whether data persists indefinitely or has a defined lifecycle (e.g., active while the patient-physician relationship is live, archived or deleted on request after account closure). "Keep until the patient requests deletion" is common but should be a stated policy, not a default by omission.


* **CGM sync visibility** - because this is passive and continuous, the Connect Apps & Devices screen should show a clear "connected since X, syncing every Y minutes, disconnect anytime" state rather than burying it in settings.


* **Model consent into FHIR resources directly** - if data is modeled as FHIR Observation/Consent resources from the start, there's a natural place to attach consent scope and provenance per data point, rather than retrofitting permissions later.





None of this needs to be fully built for a hackathon demo, but one slide stating the consent model signals the team has thought past the happy-path demo - worth a line in the pitch deck even when the build itself stays scoped down.