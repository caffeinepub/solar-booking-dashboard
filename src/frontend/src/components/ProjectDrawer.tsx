import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProjectById } from "@/hooks/useProjects";
import type {
  ProjectStage,
  ProjectStatus,
  SolarProject,
} from "@/types/project";
import { PROJECT_STAGES } from "@/types/project";
import { Pencil, Trash2, X } from "lucide-react";

interface ProjectDrawerProps {
  projectId: string | null;
  onClose: () => void;
  onEdit?: (project: SolarProject) => void;
  onDelete?: (id: string) => Promise<boolean> | Promise<void> | void;
  updateProject?: (
    id: string,
    updates: Partial<SolarProject>,
  ) => Promise<SolarProject | null> | Promise<void> | void;
}

function Field({
  label,
  value,
}: { label: string; value?: string | number | boolean | null }) {
  if (value == null || value === "") return null;
  const display =
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground font-medium">{display}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 p-2 rounded-md bg-muted/30 border border-border">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={`text-sm font-semibold tabular-nums ${highlight ? "text-accent" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function StageProgressBar({ currentStage }: { currentStage?: ProjectStage }) {
  const currentIndex = currentStage ? PROJECT_STAGES.indexOf(currentStage) : -1;

  return (
    <div data-ocid="stage-progress">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground block mb-2">
        Project Stage
      </span>
      <div className="flex items-center gap-0.5 overflow-x-auto pb-1">
        {PROJECT_STAGES.map((stage, idx) => {
          const isDone = currentIndex >= 0 && idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = currentIndex < 0 || idx > currentIndex;

          return (
            <div key={stage} className="flex items-center gap-0.5 min-w-0">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 border-2 transition-colors ${
                    isCurrent
                      ? "bg-primary border-primary text-primary-foreground"
                      : isDone
                        ? "bg-primary/30 border-primary/50 text-primary"
                        : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-[8px] text-center leading-tight max-w-[40px] whitespace-normal ${
                    isCurrent
                      ? "text-primary font-semibold"
                      : isDone
                        ? "text-muted-foreground"
                        : isPending
                          ? "text-muted-foreground/50"
                          : "text-muted-foreground"
                  }`}
                >
                  {stage}
                </span>
              </div>
              {idx < PROJECT_STAGES.length - 1 && (
                <div
                  className={`h-0.5 w-3 flex-shrink-0 mb-4 rounded-full ${
                    isDone ? "bg-primary/40" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {currentStage && (
        <p className="text-xs text-primary font-medium mt-1">
          Current: {currentStage}
        </p>
      )}
    </div>
  );
}

function fmt(n?: number) {
  if (n == null) return undefined;
  return `₹${n.toLocaleString("en-IN")}`;
}

const STATUS_OPTIONS: ProjectStatus[] = ["OPEN", "ONGOING", "CLOSED", "REJECT"];

export function ProjectDrawer({
  projectId,
  onClose,
  onEdit,
  onDelete,
  updateProject,
}: ProjectDrawerProps) {
  const project = useProjectById(projectId);
  const canEdit = !!(onEdit && onDelete && updateProject);

  // Safely sum payment fields, treating undefined/null/NaN as 0
  const safeN = (n?: number | null) => (n != null && !Number.isNaN(n) ? n : 0);
  const totalReceived = project
    ? safeN(project.bookingAmount) +
      safeN(project.financeAmount1) +
      safeN(project.financeAmount2) +
      safeN(project.cashAmount2)
    : 0;
  const computedPending = project
    ? safeN(project.salePrice) - totalReceived
    : 0;

  return (
    <Sheet
      open={!!projectId && !!project}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] lg:w-[520px] p-0 flex flex-col"
        data-ocid="project-drawer"
      >
        {project && (
          <>
            <SheetHeader className="px-5 py-4 border-b border-border bg-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <SheetTitle className="text-base font-display font-semibold leading-snug truncate">
                    {project.customerName}
                  </SheetTitle>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge status={project.projectStatus} />
                    <span className="text-xs text-muted-foreground">
                      #{project.slNo} · {project.region}
                      {project.district ? ` · ${project.district}` : ""}
                    </span>
                  </div>
                </div>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="p-1.5 rounded-md hover:bg-muted transition-smooth mt-0.5"
                    aria-label="Close drawer"
                    data-ocid="drawer-close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </SheetClose>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Quick status + stage change row */}
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border border-border flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">
                  Status:
                </span>
                {canEdit && updateProject ? (
                  <Select
                    value={project.projectStatus}
                    onValueChange={(v) =>
                      updateProject(project.id, {
                        projectStatus: v as ProjectStatus,
                      })
                    }
                  >
                    <SelectTrigger
                      className="h-7 text-xs w-32"
                      data-ocid="status-select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs font-medium text-foreground">
                    {project.projectStatus}
                  </span>
                )}

                <span className="text-xs font-medium text-muted-foreground ml-2">
                  Stage:
                </span>
                {canEdit && updateProject ? (
                  <Select
                    value={project.currentStage ?? ""}
                    onValueChange={(v) =>
                      updateProject(project.id, {
                        currentStage:
                          v === "_none" ? undefined : (v as ProjectStage),
                      })
                    }
                  >
                    <SelectTrigger
                      className="h-7 text-xs w-36"
                      data-ocid="stage-select"
                    >
                      <SelectValue placeholder="Set Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none" className="text-xs">
                        — No Stage —
                      </SelectItem>
                      {PROJECT_STAGES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs font-medium text-foreground">
                    {project.currentStage ?? "—"}
                  </span>
                )}
              </div>

              {/* Stage Progress Indicator */}
              <div className="p-3 bg-muted/20 rounded-lg border border-border">
                <StageProgressBar currentStage={project.currentStage} />
              </div>

              <Section title="Contact & Lead">
                <Field label="Customer" value={project.customerName} />
                <Field label="Phone" value={project.phoneNumber} />
                <Field label="Address" value={project.address} />
                <Field label="Consumer AC No" value={project.consumerAcNo} />
                <Field label="Region" value={project.region} />
                <Field label="District" value={project.district} />
                <Field label="Employee Type" value={project.employeeType} />
                <Field label="Lead Source" value={project.leadSource} />
                {(project.employeeName || project.freelancerName) && (
                  <>
                    {project.employeeName && (
                      <Field
                        label="Employee Name"
                        value={project.employeeName}
                      />
                    )}
                    {project.freelancerName && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Freelancer Name
                        </span>
                        <span className="text-sm text-foreground font-medium">
                          {project.freelancerName}
                          {project.employeeName && (
                            <span className="ml-1 text-xs text-muted-foreground font-normal">
                              (under {project.employeeName})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </Section>

              <Separator />

              <Section title="Project Details">
                <Field label="System Size (kW)" value={project.kw} />
                <Field label="Sale Price" value={fmt(project.salePrice)} />
                <Field label="Agreement Signed" value={project.signAgreement} />
                <Field
                  label="Digital Approval"
                  value={project.digitalApprovedLetter}
                />
                <Field label="Invoice No" value={project.invoiceNo} />
                <Field
                  label="Agreement Date"
                  value={project.bookingAgreementDate}
                />
              </Section>

              <Separator />

              <Section title="Finance">
                {/* Booking Amount */}
                <Field
                  label="Booking Amount"
                  value={fmt(project.bookingAmount)}
                />
                <Field
                  label="Booking Amount Date"
                  value={project.bookingAmountDate}
                />

                {/* Finance 1 */}
                <Field
                  label="Finance Amount 1"
                  value={fmt(project.financeAmount1)}
                />
                <Field label="Finance Date 1" value={project.financeDate1} />

                {/* Finance 2 */}
                <Field
                  label="Finance Amount 2"
                  value={fmt(project.financeAmount2)}
                />
                <Field label="Finance Date 2" value={project.financeDate2} />

                {/* Last Payment (cashAmount2) */}
                <Field
                  label="Last Payment Amount"
                  value={fmt(project.cashAmount2)}
                />
                <Field
                  label="Last Payment Date"
                  value={project.cashAmount2Date}
                />

                {/* GST + Subsidy */}
                <Field label="GST Amount" value={fmt(project.gstAmount)} />
                <Field
                  label="GST Filing Month"
                  value={project.gstFillingMonth}
                />
                <Field
                  label="Subsidy Disbursed"
                  value={fmt(project.subsidyDisbursed)}
                />
              </Section>

              {/* Finance Summary */}
              <div className="grid grid-cols-3 gap-2">
                <StatBox
                  label="Total Received"
                  value={`₹${totalReceived.toLocaleString("en-IN")}`}
                />
                <StatBox
                  label="Pending Amount"
                  value={`₹${computedPending.toLocaleString("en-IN")}`}
                  highlight={computedPending > 0}
                />
                <StatBox
                  label="Sale Price"
                  value={`₹${(project.salePrice ?? 0).toLocaleString("en-IN")}`}
                />
              </div>

              <Separator />

              <Section title="Installation Timeline">
                <Field
                  label="Material Purchase"
                  value={project.materialPurchaseDate}
                />
                <Field label="Delivery Date" value={project.deliveryDate} />
                <Field label="E-Way Bill No" value={project.ewayBillNo} />
                <Field
                  label="Installation Date"
                  value={project.installationDate}
                />
                <Field
                  label="Net Metering Date"
                  value={project.netMeteringDate}
                />
              </Section>

              {project.remarks && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Remarks
                    </h3>
                    <p className="text-sm text-foreground bg-muted/30 rounded-md p-3 border border-border">
                      {project.remarks}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            {canEdit && onEdit && onDelete && (
              <div className="border-t border-border px-5 py-3 flex gap-2 bg-card">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
                  onClick={() => onEdit(project)}
                  data-ocid="drawer-edit-btn"
                >
                  <Pencil className="w-4 h-4" /> Edit Project
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 transition-smooth"
                  onClick={() => {
                    if (window.confirm(`Delete "${project.customerName}"?`)) {
                      onDelete(project.id);
                    }
                  }}
                  data-ocid="drawer-delete-btn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
