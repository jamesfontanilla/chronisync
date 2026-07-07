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

export interface HeartRateChartPoint {
  label: string;
  bpm: number;
}

export interface HeartRateChartProps {
  data?: HeartRateChartPoint[];
}

const defaultData: HeartRateChartPoint[] = [
  { label: "Mon", bpm: 72 },
  { label: "Tue", bpm: 76 },
  { label: "Wed", bpm: 70 },
  { label: "Thu", bpm: 74 },
  { label: "Fri", bpm: 71 },
  { label: "Sat", bpm: 73 },
  { label: "Sun", bpm: 69 },
];

export function HeartRateChart({
  data = defaultData,
}: HeartRateChartProps) {
  const hasData = (data?.length ?? 0) > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)]">
        <CardTitle>Heart rate trend</CardTitle>
        <CardDescription>
          Resting pulse readings across recent days.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex h-64 w-full items-center justify-center">
          {!hasData ? (
            <div className="text-center text-sm text-[color:var(--ui-muted)]">
              <p className="font-medium text-[color:var(--ui-text)]">
                No heart rate data yet
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
                    dataKey="bpm"
                    stroke="#19a39a"
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
