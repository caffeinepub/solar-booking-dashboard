import { StatusBadge } from "@/components/StatusBadge";
import type { SolarProject } from "@/types/project";
import { PROJECT_STAGES } from "@/types/project";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";

interface ProjectTableRowProps {
  project: SolarProject;
  isSelected: boolean;
  canEdit?: boolean;
  onSelect: () => void;
  onEdit: (project: SolarProject) => void;
  onDelete: (id: string) => Promise<boolean> | Promise<void> | void;
}

function fmt(n?: number) {
  if (n == null) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Always recompute pending from payment fields so display is correct even if stored value is stale */
export function calcDisplayPending(p: SolarProject): number | undefined {
  // If there's no sale price at all, nothing to compute
  if (p.salePrice == null || Number.isNaN(p.salePrice)) return undefined;
  const booking =
    p.bookingAmount != null && !Number.isNaN(p.bookingAmount)
      ? p.bookingAmount
      : 0;
  const f1 =
    p.financeAmount1 != null && !Number.isNaN(p.financeAmount1)
      ? p.financeAmount1
      : 0;
  const f2 =
    p.financeAmount2 != null && !Number.isNaN(p.financeAmount2)
      ? p.financeAmount2
      : 0;
  const cash =
    p.cashAmount2 != null && !Number.isNaN(p.cashAmount2) ? p.cashAmount2 : 0;
  return p.salePrice - (booking + f1 + f2 + cash);
}

// Stage badge color index based on stage order
const STAGE_COLORS: Record<string, string> = {
  Registration: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Digital Approval": "bg-violet-500/10 text-violet-600 border-violet-500/20",
  "Material Delivery": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Installation: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "JE Inspection": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  "Net Metering": "bg-teal-500/10 text-teal-600 border-teal-500/20",
  Subsidy: "bg-green-500/10 text-green-600 border-green-500/20",
  Completed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
};

/**
 * Returns the next stage after currentStage, or null if none/completed.
 * Returns null (not "—") so callers can check truthiness cleanly.
 */
export function getNextStage(currentStage?: string): string | null {
  if (!currentStage) return null;
  if (currentStage === "Completed") return null; // already done
  const idx = PROJECT_STAGES.indexOf(
    currentStage as (typeof PROJECT_STAGES)[number],
  );
  if (idx === -1) return null; // unknown stage
  if (idx >= PROJECT_STAGES.length - 1) return null; // last stage
  return PROJECT_STAGES[idx + 1];
}

/**
 * Returns the last completed stage (the one before currentStage), or null if at first stage or no stage set.
 */
export function getCompletedStage(currentStage?: string): string | null {
  if (!currentStage) return null;
  const idx = PROJECT_STAGES.indexOf(
    currentStage as (typeof PROJECT_STAGES)[number],
  );
  if (idx <= 0) return null; // first stage or not found — nothing completed yet
  return PROJECT_STAGES[idx - 1];
}

export function ProjectTableRow({
  project,
  isSelected,
  canEdit = true,
  onSelect,
  onEdit,
  onDelete,
}: ProjectTableRowProps) {
  return (
    <tr
      className={`border-b border-border table-row-hover cursor-pointer text-sm ${isSelected ? "bg-accent/10" : ""}`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      tabIndex={0}
      data-ocid={`project-row-${project.id}`}
    >
      <td className="px-3 py-2 text-muted-foreground text-xs tabular-nums">
        {project.slNo}
      </td>
      <td className="px-3 py-2">
        <div className="font-medium text-foreground truncate max-w-[180px]">
          {project.customerName}
        </div>
        {project.phoneNumber && (
          <div className="text-xs text-muted-foreground">
            {project.phoneNumber}
          </div>
        )}
      </td>
      <td className="px-3 py-2 text-muted-foreground text-xs font-medium">
        {project.region}
      </td>
      <td className="px-3 py-2 text-muted-foreground text-xs">
        {project.district ?? "—"}
      </td>
      <td className="px-3 py-2 text-xs">
        {project.employeeName ? (
          <div>
            <div className="text-foreground truncate max-w-[120px]">
              {project.employeeName}
            </div>
            {project.freelancerName && (
              <div className="text-muted-foreground text-[11px] truncate max-w-[120px]">
                ↳ {project.freelancerName}
              </div>
            )}
          </div>
        ) : project.freelancerName ? (
          <div className="text-foreground truncate max-w-[120px]">
            {project.freelancerName}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-3 py-2 text-center tabular-nums">
        {project.kw != null ? (
          <span className="font-medium">{project.kw}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-3 py-2 text-center">
        <StatusBadge status={project.projectStatus} />
      </td>
      <td
        className="px-3 py-2 text-center"
        data-ocid={`completed-stage-cell-${project.id}`}
      >
        {(() => {
          const completed = getCompletedStage(project.currentStage);
          if (!completed)
            return <span className="text-muted-foreground text-xs">—</span>;
          const colorClass =
            STAGE_COLORS[completed] ??
            "bg-muted text-muted-foreground border-border";
          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap ${colorClass}`}
            >
              {completed}
            </span>
          );
        })()}
      </td>
      <td
        className="px-3 py-2 text-center"
        data-ocid={`next-stage-cell-${project.id}`}
      >
        {(() => {
          const next = getNextStage(project.currentStage);
          if (!next)
            return <span className="text-muted-foreground text-xs">—</span>;
          const colorClass =
            STAGE_COLORS[next] ??
            "bg-muted text-muted-foreground border-border";
          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap opacity-50 ${colorClass}`}
            >
              {next}
            </span>
          );
        })()}
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-sm">
        {fmt(project.salePrice)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-sm">
        {(() => {
          const pending = calcDisplayPending(project);
          if (pending == null)
            return <span className="text-muted-foreground">—</span>;
          if (pending > 0)
            return (
              <span className="text-accent font-semibold">{fmt(pending)}</span>
            );
          if (pending === 0)
            return (
              <span className="[color:var(--stat-closed)] text-xs font-medium">
                Cleared
              </span>
            );
          // Negative: overpayment
          return (
            <span className="text-destructive font-semibold">
              {fmt(pending)}
            </span>
          );
        })()}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {project.bookingAgreementDate ?? "—"}
      </td>
      {canEdit && (
        <td className="px-3 py-2">
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-smooth"
              onClick={() => onEdit(project)}
              aria-label="Edit project"
              data-ocid={`edit-btn-${project.id}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-smooth"
              onClick={() => {
                if (window.confirm(`Delete "${project.customerName}"?`)) {
                  onDelete(project.id);
                }
              }}
              aria-label="Delete project"
              data-ocid={`delete-btn-${project.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </td>
      )}
    </tr>
  );
}
