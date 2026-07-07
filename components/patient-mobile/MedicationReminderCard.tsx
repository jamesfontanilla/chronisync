import React from "react";
import { Pill, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Medication } from "@/types/medication";
import type { AdherenceLog } from "@/types/adherence";

export interface MedicationReminderCardProps {
  medication: Medication;
  adherenceLog: AdherenceLog | null;
  scheduledTime: Date;
  onLogTaken?: () => void;
  onLogMissed?: () => void;
}

export function MedicationReminderCard({
  medication,
  adherenceLog,
  scheduledTime,
  onLogTaken,
  onLogMissed,
}: MedicationReminderCardProps) {
  // Determine status
  let status: "taken" | "missed" | "pending" = "pending";
  if (adherenceLog) {
    status = adherenceLog.takenAt ? "taken" : "missed";
  } else if (scheduledTime.getTime() < Date.now()) {
    status = "missed";
  }

  const formattedTime = scheduledTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="overflow-hidden border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-strong)] shadow-[0_10px_30px_rgba(9,30,36,0.08)]">
      <CardContent className="p-4 grid gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-[color:var(--ui-border)] bg-gradient-to-br from-violet-500/20 to-transparent text-[color:var(--ui-accent)]">
              <Pill size={18} />
            </div>
            <div className="grid gap-0.5">
              <h4 className="m-0 text-base font-semibold">{medication.name}</h4>
              <p className="m-0 text-xs text-[color:var(--ui-muted)]">
                {medication.dosage} • {medication.instructions || "No instructions"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[color:var(--ui-muted)]">
            <Clock size={14} />
            <span>{formattedTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[color:var(--ui-border)] pt-3 mt-1">
          <span className="text-xs text-[color:var(--ui-muted)]">Status</span>
          {status === "taken" && (
            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Taken</span>
            </Badge>
          )}
          {status === "missed" && (
            <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20 flex items-center gap-1">
              <XCircle size={12} />
              <span>Missed</span>
            </Badge>
          )}
          {status === "pending" && (
            <Badge variant="outline" className="text-[color:var(--ui-muted)] border-[color:var(--ui-border)] flex items-center gap-1">
              <Clock size={12} />
              <span>Scheduled</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
