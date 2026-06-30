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
import type { DashboardTrendSeries } from "@/features/dashboard/service";

export interface TrendCardProps {
  series: DashboardTrendSeries;
}

export function TrendCard({ series }: TrendCardProps) {
  const stroke = series.color ?? "#0b6574";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-[color:var(--ui-border)]">
        <CardTitle>{series.title}</CardTitle>
        {series.description ? (
          <CardDescription>{series.description}</CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="p-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={series.points}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="rgba(8, 35, 43, 0.08)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke={stroke}
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
