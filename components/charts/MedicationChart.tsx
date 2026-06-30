"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface MedicationChartPoint {
  label: string;
  adherence: number;
  refills: number;
}

export interface MedicationChartProps {
  data?: ReadonlyArray<MedicationChartPoint>;
}

const defaultData: MedicationChartPoint[] = [
  { label: "Mon", adherence: 92, refills: 4 },
  { label: "Tue", adherence: 88, refills: 4 },
  { label: "Wed", adherence: 94, refills: 3 },
  { label: "Thu", adherence: 90, refills: 3 },
  { label: "Fri", adherence: 96, refills: 2 },
  { label: "Sat", adherence: 91, refills: 2 },
  { label: "Sun", adherence: 97, refills: 1 },
];

export function MedicationChart({
  data = defaultData,
}: MedicationChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)]">
        <CardTitle>Medication trend</CardTitle>
        <CardDescription>
          A quick look at adherence and refill movement across the week.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(8, 35, 43, 0.08)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="adherence"
                stroke="#0b6574"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="refills"
                stroke="#19a39a"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
