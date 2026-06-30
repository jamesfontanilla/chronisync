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

export interface BloodPressureChartPoint {
  label: string;
  systolic: number;
  diastolic: number;
}

export interface BloodPressureChartProps {
  data?: BloodPressureChartPoint[];
}

const defaultData: BloodPressureChartPoint[] = [
  { label: "Mon", systolic: 126, diastolic: 82 },
  { label: "Tue", systolic: 130, diastolic: 84 },
  { label: "Wed", systolic: 124, diastolic: 80 },
  { label: "Thu", systolic: 128, diastolic: 81 },
  { label: "Fri", systolic: 122, diastolic: 79 },
  { label: "Sat", systolic: 125, diastolic: 80 },
  { label: "Sun", systolic: 123, diastolic: 78 },
];

export function BloodPressureChart({
  data = defaultData,
}: BloodPressureChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)]">
        <CardTitle>Blood pressure trend</CardTitle>
        <CardDescription>
          Systolic and diastolic readings across the week.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(8, 35, 43, 0.08)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#0b6574"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
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
