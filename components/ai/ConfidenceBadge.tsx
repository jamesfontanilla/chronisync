import { Badge } from "@/components/ui/badge";
import { formatAiConfidence, getAiConfidenceLevel } from "@/features/ai/validation";
import { cn } from "@/lib/utils";

export interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
  showPercent?: boolean;
}

export function ConfidenceBadge({
  confidence,
  className,
  showPercent = true,
}: ConfidenceBadgeProps) {
  const level = getAiConfidenceLevel(confidence);
  const label =
    level === "high"
      ? "High confidence"
      : level === "medium"
        ? "Moderate confidence"
        : "Low confidence";

  const variant =
    level === "high"
      ? "default"
      : level === "medium"
        ? "glass"
        : "destructive";

  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
      {showPercent ? ` - ${formatAiConfidence(confidence)}` : ""}
    </Badge>
  );
}

