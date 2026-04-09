import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types/project";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  OPEN: {
    label: "OPEN",
    className: "badge-open",
  },
  ONGOING: {
    label: "ONGOING",
    className: "badge-ongoing",
  },
  CLOSED: {
    label: "CLOSED",
    className: "badge-closed",
  },
  REJECT: {
    label: "REJECT",
    className: "badge-reject",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(config.className, className)}
      data-ocid={`status-badge-${status.toLowerCase()}`}
    >
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
