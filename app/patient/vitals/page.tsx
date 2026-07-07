"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/common/PageHeader";
import { BloodPressureChart } from "@/components/charts/BloodPressureChart";
import { GlucoseChart } from "@/components/charts/GlucoseChart";
import { HeartRateChart } from "@/components/charts/HeartRateChart";
import { WeightChart } from "@/components/charts/WeightChart";
import { VitalForm } from "@/components/forms/VitalForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVitalRecordsQuery } from "@/features/vitals/hooks";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { BloodPressureVital, NumericVital, Vital } from "@/types/vital";

function toDateValue(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "object" && "toDate" in value) {
    const maybeDate = value.toDate;
    if (typeof maybeDate === "function") {
      const converted = maybeDate.call(value);
      return converted instanceof Date ? converted : null;
    }
  }

  return null;
}

function formatChartLabel(value: unknown): string {
  const date = toDateValue(value);
  return date ? formatDateTime(date) : "Recent";
}

function formatVitalSummary(record: Vital): string {
  if (record.type === "blood_pressure") {
    return `${record.systolic}/${record.diastolic} ${record.unit ?? "mmHg"}`;
  }

  return `${record.value} ${record.unit ?? ""}`.trim();
}

function formatVitalTypeLabel(type: Vital["type"]): string {
  switch (type) {
    case "blood_pressure":
      return "Blood pressure";
    case "blood_glucose":
      return "Glucose";
    case "heart_rate":
      return "Heart rate";
    case "weight":
      return "Weight";
    case "temperature":
      return "Temperature";
    case "oxygen_saturation":
      return "Oxygen saturation";
    default:
      return "Vital";
  }
}

export default function VitalsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[color:var(--ui-muted)]">Loading vitals...</div>}>
      <VitalsPageContent />
    </Suspense>
  );
}

function VitalsPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const defaultValues = useMemo(() => {
    const values: any = {
      patientId: user?.uid ?? "",
    };
    if (typeParam) {
      values.type = typeParam;
    }
    return values;
  }, [user?.uid, typeParam]);

  const { data: records = [] } = useVitalRecordsQuery(user?.uid);

  const recentRecords = useMemo(() => {
    return [...records]
      .sort((left, right) => {
        const leftTime = toDateValue(left.recordedAt)?.getTime() ?? 0;
        const rightTime = toDateValue(right.recordedAt)?.getTime() ?? 0;
        return rightTime - leftTime;
      })
      .slice(0, 8);
  }, [records]);

  const bloodPressureData = useMemo(
    () =>
      recentRecords
        .filter(
          (record): record is BloodPressureVital =>
            record.type === "blood_pressure"
        )
        .map((record) => ({
          label: formatChartLabel(record.recordedAt),
          systolic: record.systolic,
          diastolic: record.diastolic,
        })),
    [recentRecords]
  );

  const glucoseData = useMemo(
    () =>
      recentRecords
        .filter((record): record is NumericVital => record.type === "blood_glucose")
        .map((record) => ({
          label: formatChartLabel(record.recordedAt),
          glucose: record.value,
        })),
    [recentRecords]
  );

  const heartRateData = useMemo(
    () =>
      recentRecords
        .filter((record): record is NumericVital => record.type === "heart_rate")
        .map((record) => ({
          label: formatChartLabel(record.recordedAt),
          bpm: record.value,
        })),
    [recentRecords]
  );

  const weightData = useMemo(
    () =>
      recentRecords
        .filter((record): record is NumericVital => record.type === "weight")
        .map((record) => ({
          label: formatChartLabel(record.recordedAt),
          weight: record.value,
        })),
    [recentRecords]
  );

  return (
    <main className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Patient record"
        title="Vitals"
        description="Log vital signs and watch the trends that matter most for long-term care."
        level={1}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <VitalForm defaultValues={defaultValues} />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Reading guidance</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-7 text-[color:var(--ui-muted)]">
              <p>Record the reading as close to the measurement time as possible.</p>
              <p>The chart will infer the correct unit from the selected vital type.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent readings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Reading</TableHead>
                      <TableHead>Recorded</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRecords.length > 0 ? (
                      recentRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatVitalTypeLabel(record.type)}</TableCell>
                          <TableCell>{formatVitalSummary(record)}</TableCell>
                          <TableCell>{formatChartLabel(record.recordedAt)}</TableCell>
                          <TableCell>{record.source ?? "manual"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-[color:var(--ui-muted)]">
                          No readings logged yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <BloodPressureChart data={bloodPressureData} />
            <GlucoseChart data={glucoseData} />
            <HeartRateChart data={heartRateData} />
            <WeightChart data={weightData} />
          </div>
        </div>
      </section>
    </main>
  );
}
