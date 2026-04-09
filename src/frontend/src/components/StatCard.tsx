import { cn } from "@/lib/utils";

type StatColor =
  | "foreground"
  | "blue"
  | "amber"
  | "green"
  | "red"
  | "accent"
  | "pending";

interface StatCardProps {
  label: string;
  value: string | number;
  color?: StatColor;
  "data-ocid"?: string;
}

// Use CSS custom property vars that align with badge-open/ongoing/closed/reject utility classes
const colorMap: Record<StatColor, string> = {
  foreground: "text-foreground",
  blue: "[color:var(--stat-open)]",
  amber: "[color:var(--stat-ongoing)]",
  green: "[color:var(--stat-closed)]",
  red: "[color:var(--stat-reject)]",
  accent: "text-accent",
  pending: "[color:var(--stat-pending)]",
};

export function StatCard({
  label,
  value,
  color = "foreground",
  ...props
}: StatCardProps) {
  return (
    <div className="stat-card-bg px-4 py-3" {...props}>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl font-display font-bold tabular-nums",
          colorMap[color],
        )}
      >
        {value}
      </p>
    </div>
  );
}
