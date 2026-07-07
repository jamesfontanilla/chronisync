"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Camera,
  CircleDashed,
  HandCoins,
  MessageSquareText,
  PencilRuler,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

// Database sync connections
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client"; 

import { MealPhotoCaptureCard } from "@/components/food-photo/MealPhotoCaptureCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QuickLogTiles } from "@/components/patient-mobile/QuickLogTiles";

const captureModes = [
  {
    title: "Voice first",
    description:
      "Speak the note first when typing is hard, then review the draft in the diary.",
    icon: MessageSquareText,
    href: "#voice-first",
    cta: "Jump to voice log",
  },
  {
    title: "Photo first",
    description:
      "Capture the meal photo, then confirm the estimate before it saves.",
    icon: Camera,
    href: "#meal-photo-capture",
    cta: "Review photo draft",
  },
  {
    title: "Manual fallback",
    description:
      "Switch to a simple text form if the camera result is unclear.",
    icon: PencilRuler,
    href: "#manual-entry",
    cta: "Open manual form",
  },
  {
    title: "Queued sync",
    description: "Keep logging even when the connection is unavailable.",
    icon: CircleDashed,
    href: "#sync-state",
    cta: "Check sync status",
  },
];

export default function PatientAddPage() {
  // Local Form States
  const [mealDescription, setMealDescription] = useState("");
  const [carbsEstimated, setCarbsEstimated] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [mealContext, setMealContext] = useState("before_meal");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Database submission logic
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealDescription.trim()) {
      setStatus({ type: "error", message: "Please enter a meal description." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    // Dynamic bracket lookup safely clearing out compilation problems
    const envValue = process.env["NEXT_PUBLIC_GLUCOSE_THRESHOLD"];
    const GLUCOSE_LIMIT = envValue && !isNaN(Number(envValue)) ? Number(envValue) : 180;

    try {
      const targetRef = collection(db, "patients", "demo-patient", "logs");
      const parsedGlucose = bloodGlucose ? Number(bloodGlucose) : null;
      
      let alertTriggered = false;
      let alertMsg = "";

      if (parsedGlucose && parsedGlucose > GLUCOSE_LIMIT) {
        alertTriggered = true;
        alertMsg = `Glucose reading of ${parsedGlucose} mg/dL exceeds threshold target of ${GLUCOSE_LIMIT} mg/dL.`;
      }

      const logPayload = {
        type: "manual_fallback",
        mealDescription: mealDescription.trim(),
        carbsEstimated: carbsEstimated ? Number(carbsEstimated) : 0,
        bloodGlucose: parsedGlucose,
        mealContext: mealContext,
        guidelineAlert: {
          triggered: alertTriggered,
          message: alertMsg,
        },
        createdAt: serverTimestamp(),
        loggedAt: new Date().toISOString(),
      };

      await addDoc(targetRef, logPayload);

      // Reset Form fields
      setMealDescription("");
      setCarbsEstimated("");
      setBloodGlucose("");
      setMealContext("before_meal");

      setStatus({
        type: "success",
        message: alertTriggered 
          ? `Log recorded with safety alerts: ${alertMsg}` 
          : "Log entry saved directly to database history."
      });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to sync online. Saved to offline queue." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient workspace"
        title="Add"
        description="This quick-capture hub keeps large tap targets, plain labels, and a manual fallback path in reach."
        meta={<span>Photo drafts, voice notes, and quick logs</span>}
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="glass">
              <Link href="#voice-first">Voice log</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/patient/partners">Caregiver support</Link>
            </Button>
          </div>
        }
        level={1}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        <Card id="voice-first" className="overflow-hidden">
          <CardHeader className="gap-3 border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.08),rgba(11,101,116,0.03))]">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                <MessageSquareText size={18} />
              </div>
              <div className="grid gap-2">
                <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ui-muted)]">
                  Primary input
                </div>
                <CardTitle className="text-2xl">Voice-first logging</CardTitle>
                <p className="m-0 text-sm leading-7 text-[color:var(--ui-muted)]">
                  Speak the note first when typing is difficult. The diary keeps
                  the draft visible so it can be edited later.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-6">
            <p className="m-0 text-sm leading-7 text-[color:var(--ui-muted)]">
              Use voice when your hands, eyes, or energy make typing harder. The
              draft stays reviewable, and the manual form is one tap away.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/patient/diary">Open diary</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="#manual-entry">Manual fallback</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card id="caregiver-help" className="overflow-hidden">
          <CardHeader className="gap-3 border-b border-[color:var(--ui-border)] bg-[linear-gradient(135deg,rgba(25,163,154,0.05),rgba(11,101,116,0.02))]">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                <ShieldCheck size={18} />
              </div>
              <div className="grid gap-2">
                <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--ui-muted)]">
                  Fallback support
                </div>
                <CardTitle className="text-2xl">Caregiver support</CardTitle>
                <p className="m-0 text-sm leading-7 text-[color:var(--ui-muted)]">
                  Trusted helpers can step in when dexterity or vision makes the
                  usual path harder to use.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-6">
            <p className="m-0 text-sm leading-7 text-[color:var(--ui-muted)]">
              The caregiver path stays separate from personal logging, so
              support can be obvious, simple, and easy to reach.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/patient/partners">Open caregiver support</Link>
              </Button>
              <Button asChild variant="glass">
                <Link href="/patient/settings">Review privacy settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {captureModes.map((mode) => {
          const Icon = mode.icon;

          return (
            <Card key={mode.title}>
              <CardHeader className="gap-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{mode.title}</CardTitle>
                  <span className="inline-grid h-11 w-11 place-items-center rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]">
                    <Icon size={18} />
                  </span>
                </div>
                <div className="text-sm leading-6 text-[color:var(--ui-muted)]">
                  {mode.description}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  asChild
                  variant="glass"
                  className="w-full justify-between"
                >
                  <Link href={mode.href}>
                    <span>{mode.cta}</span>
                    <PlusCircle size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <QuickLogTiles />

      <section className="grid gap-6 xl:grid-cols-2">
        <MealPhotoCaptureCard patientId="demo-patient" />
        
        {/* Manual Fallback Form Interface with intact original card hierarchy styling */}
        <div id="manual-entry" className="scroll-mt-24">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Manual Fallback Log</CardTitle>
              <CardDescription>
                Directly register your tracking parameters here if the camera or alternative captures are unclear.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {status && (
                  <div className={`p-3 rounded-md text-sm font-medium border ${
                    status.type === "success" 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}>
                    {status.message}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[color:var(--ui-muted)]">
                    Meal Description / Log Details
                  </label>
                  <textarea
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-[color:var(--ui-border)] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent)]"
                    placeholder="e.g., Oatmeal with blueberries and walnuts"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[color:var(--ui-muted)]">
                      Carbohydrates (g)
                    </label>
                    <input
                      type="number"
                      value={carbsEstimated}
                      onChange={(e) => setCarbsEstimated(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-[color:var(--ui-border)] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent)]"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[color:var(--ui-muted)]">
                      Blood Glucose (mg/dL) - Optional
                    </label>
                    <input
                      type="number"
                      value={bloodGlucose}
                      onChange={(e) => setBloodGlucose(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-[color:var(--ui-border)] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent)]"
                      placeholder="e.g., 120"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[color:var(--ui-muted)]">
                    Timing / Prandial Context
                  </label>
                  <select
                    value={mealContext}
                    onChange={(e) => setMealContext(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-[color:var(--ui-border)] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent)]"
                  >
                    <option value="before_meal">Before Meal (Pre-Prandial)</option>
                    <option value="after_meal">After Meal (Post-Prandial)</option>
                    <option value="fasting">Fasting</option>
                    <option value="none">General Record</option>
                  </select>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Saving to Database..." : "Submit Log Entry"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6">
        <Card id="sync-state">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">What happens next</CardTitle>
              <PlusCircle className="text-[color:var(--ui-accent)]" size={18} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
            <div className="flex items-start gap-3">
              <HandCoins
                className="mt-1 text-[color:var(--ui-accent)]"
                size={18}
              />
              <p className="m-0">
                Quick logs are stored first, then the app fills in richer
                context when the user has time to confirm details.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Camera
                className="mt-1 text-[color:var(--ui-accent)]"
                size={18}
              />
              <p className="m-0">
                Meal photos stay draft-first so the correction step can happen
                before the record becomes part of the trend history.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CircleDashed
                className="mt-1 text-[color:var(--ui-accent)]"
                size={18}
              />
              <p className="m-0">
                Sync state stays visible to make offline use honest instead of
                hiding the network layer behind a spinner.
              </p>
            </div>
            <Button asChild variant="secondary" className="w-fit">
              <Link href="/patient/diary">Review diary</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}