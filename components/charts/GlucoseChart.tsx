"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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

export interface GlucoseChartPoint {
  label: string;
  glucose: number;
}

export interface GlucoseChartProps {
  data?: GlucoseChartPoint[];
}

const defaultData: GlucoseChartPoint[] = [
  { label: "Mon", glucose: 104 },
  { label: "Tue", glucose: 112 },
  { label: "Wed", glucose: 108 },
  { label: "Thu", glucose: 116 },
  { label: "Fri", glucose: 109 },
  { label: "Sat", glucose: 111 },
  { label: "Sun", glucose: 105 },
];

export function GlucoseChart({ data = defaultData }: GlucoseChartProps) {
  const hasData = (data?.length ?? 0) > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)]">
        <CardTitle>Glucose trend</CardTitle>
        <CardDescription>
          A compact look at glucose movement over time.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex h-64 w-full items-center justify-center">
          {!hasData ? (
            <div className="text-center text-sm text-[color:var(--ui-muted)]">
              <p className="font-medium text-[color:var(--ui-text)]">
                No glucose data yet
              </p>
              <p className="mt-1">Add a reading to start building this trend.</p>
            </div>
          ) : (
            <div className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glucoseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0b6574" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#0b6574" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(8, 35, 43, 0.08)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="glucose"
                    stroke="#0b6574"
                    fill="url(#glucoseFill)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
