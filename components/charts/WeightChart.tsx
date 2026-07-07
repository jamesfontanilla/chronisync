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

export interface WeightChartPoint {
  label: string;
  weight: number;
}

export interface WeightChartProps {
  data?: WeightChartPoint[];
}

const defaultData: WeightChartPoint[] = [
  { label: "Mon", weight: 71.2 },
  { label: "Tue", weight: 71.1 },
  { label: "Wed", weight: 70.9 },
  { label: "Thu", weight: 70.8 },
  { label: "Fri", weight: 70.7 },
  { label: "Sat", weight: 70.6 },
  { label: "Sun", weight: 70.5 },
];

export function WeightChart({ data = defaultData }: WeightChartProps) {
  const hasData = (data?.length ?? 0) > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)]">
        <CardTitle>Weight trend</CardTitle>
        <CardDescription>
          Recorded weight changes over time.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex h-64 w-full items-center justify-center">
          {!hasData ? (
            <div className="text-center text-sm text-[color:var(--ui-muted)]">
              <p className="font-medium text-[color:var(--ui-text)]">
                No weight data yet
              </p>
              <p className="mt-1">Add a reading to start building this trend.</p>
            </div>
          ) : (
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(8, 35, 43, 0.08)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#0b6574"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
