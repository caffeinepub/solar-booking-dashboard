import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateProjectInput,
  ProjectStage,
  ProjectStatus,
  SolarProject,
} from "@/types/project";
import { PROJECT_STAGES } from "@/types/project";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

interface AddEditProjectModalProps {
  open: boolean;
  project: SolarProject | null;
  onClose: () => void;
  onCreate: (input: CreateProjectInput) => Promise<SolarProject | null>;
  onUpdate: (
    id: string,
    updates: Partial<SolarProject>,
  ) => Promise<SolarProject | null>;
  employeeNameOptions: string[];
  freelancerNameOptions: string[];
  onAddEmployeeName: (name: string) => void;
  onAddFreelancerName: (name: string) => void;
}

type FormData = Omit<SolarProject, "id" | "slNo">;

const STATUS_OPTIONS: ProjectStatus[] = ["OPEN", "ONGOING", "CLOSED", "REJECT"];
const EMPLOYEE_TYPES = ["Direct", "Channel Partner", "Franchise"];
const LEAD_SOURCES = ["Referral Partner", "Freelancer"];
const REGIONS = ["TPCODL", "TPNODL", "TPSODL", "TPWODL"];
const ODISHA_DISTRICTS = [
  "Angul",
  "Balangir",
  "Balasore",
  "Bargarh",
  "Bhadrak",
  "Boudh",
  "Cuttack",
  "Deogarh",
  "Dhenkanal",
  "Gajapati",
  "Ganjam",
  "Jagatsinghpur",
  "Jajpur",
  "Jharsuguda",
  "Kalahandi",
  "Kandhamal",
  "Kendrapara",
  "Kendujhar",
  "Khurda",
  "Koraput",
  "Malkangiri",
  "Mayurbhanj",
  "Nabarangpur",
  "Nayagarh",
  "Nuapada",
  "Puri",
  "Rayagada",
  "Sambalpur",
  "Sonepur",
  "Sundargarh",
];

function FormField({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="col-span-2">
      <Separator className="mb-3" />
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {title}
      </h3>
    </div>
  );
}

// Combobox: shows filtered dropdown, free text entry allowed
function Combobox({
  value,
  onChange,
  options,
  placeholder,
  dataOcid,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  dataOcid?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ?? "");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="h-8 text-sm"
        autoComplete="off"
        data-ocid={dataOcid}
      />
      {open && (filtered.length > 0 || query.trim() !== "") && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-smooth"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(opt);
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Press Enter to use "{query}" as a new name
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AddEditProjectModal({
  open,
  project,
  onClose,
  onCreate,
  onUpdate,
  employeeNameOptions,
  freelancerNameOptions,
  onAddEmployeeName,
  onAddFreelancerName,
}: AddEditProjectModalProps) {
  const isEdit = !!project;

  const { register, handleSubmit, reset, control, setValue } =
    useForm<FormData>({
      defaultValues: {
        projectStatus: "OPEN",
        employeeType: "Direct",
        leadSource: "Referral Partner",
        region: "TPCODL",
        signAgreement: false,
        digitalApprovedLetter: false,
        employeeName: "",
        freelancerName: "",
      },
    });

  const [
    salePrice,
    bookingAmount,
    financeAmount1,
    financeAmount2,
    cashAmount2,
  ] = [
    useWatch({ control, name: "salePrice" }),
    useWatch({ control, name: "bookingAmount" }),
    useWatch({ control, name: "financeAmount1" }),
    useWatch({ control, name: "financeAmount2" }),
    useWatch({ control, name: "cashAmount2" }),
  ];

  const totalReceived =
    (Number(bookingAmount) || 0) +
    (Number(financeAmount1) || 0) +
    (Number(financeAmount2) || 0) +
    (Number(cashAmount2) || 0);
  const computedPending = (Number(salePrice) || 0) - totalReceived;

  useEffect(() => {
    if (project) {
      const { id: _id, slNo: _slNo, ...rest } = project;
      reset({
        ...rest,
        employeeName: rest.employeeName ?? "",
        freelancerName: rest.freelancerName ?? "",
      });
    } else {
      reset({
        projectStatus: "OPEN",
        employeeType: "Direct",
        leadSource: "Referral Partner",
        region: "TPCODL",
        signAgreement: false,
        digitalApprovedLetter: false,
        customerName: "",
        employeeName: "",
        freelancerName: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, reset]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    const empName = data.employeeName?.trim() ?? "";
    const freeName = data.freelancerName?.trim() ?? "";

    if (empName && !employeeNameOptions.includes(empName)) {
      onAddEmployeeName(empName);
    }
    if (freeName && !freelancerNameOptions.includes(freeName)) {
      onAddFreelancerName(freeName);
    }

    const payload: FormData = {
      ...data,
      employeeName: empName || undefined,
      freelancerName: freeName || undefined,
      pendingAmount: computedPending,
    };

    setIsSubmitting(true);
    try {
      if (isEdit && project) {
        await onUpdate(project.id, payload);
      } else {
        await onCreate({ ...payload, slNo: 0 });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="project-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Project" : "Add New Project"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-2"
          data-ocid="project-form"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* Core Info */}
            <div className="col-span-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Project Info
              </h3>
            </div>

            <FormField label="Customer Name *">
              <Input
                {...register("customerName", { required: true })}
                placeholder="Full name"
                className="h-8 text-sm"
                data-ocid="input-customerName"
              />
            </FormField>
            <FormField label="Phone Number">
              <Input
                {...register("phoneNumber")}
                placeholder="10-digit number"
                className="h-8 text-sm"
                data-ocid="input-phone"
              />
            </FormField>
            <div className="col-span-2">
              <FormField label="Address">
                <Input
                  {...register("address")}
                  placeholder="Full address"
                  className="h-8 text-sm"
                  data-ocid="input-address"
                />
              </FormField>
            </div>
            <FormField label="Consumer AC No">
              <Input
                {...register("consumerAcNo")}
                placeholder="e.g. TPCODL-2024-001"
                className="h-8 text-sm"
                data-ocid="input-acno"
              />
            </FormField>
            <FormField label="Status *">
              <Controller
                name="projectStatus"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="h-8 text-sm"
                      data-ocid="select-status"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Current Stage">
              <Controller
                name="currentStage"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) =>
                      field.onChange(
                        v === "_none" ? undefined : (v as ProjectStage),
                      )
                    }
                  >
                    <SelectTrigger
                      className="h-8 text-sm"
                      data-ocid="select-stage"
                    >
                      <SelectValue placeholder="Select Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">— Select Stage —</SelectItem>
                      {PROJECT_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Region *">
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="h-8 text-sm"
                      data-ocid="select-region"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="District">
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className="h-8 text-sm"
                      data-ocid="select-district"
                    >
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {ODISHA_DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Employee Type">
              <Controller
                name="employeeType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="h-8 text-sm"
                      data-ocid="select-emptype"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_TYPES.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Lead Source">
              <Controller
                name="leadSource"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="h-8 text-sm"
                      data-ocid="select-leadsource"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {/* Employee Name combobox */}
            <FormField label="Employee Name">
              <Controller
                name="employeeName"
                control={control}
                render={({ field }) => (
                  <Combobox
                    value={field.value ?? ""}
                    onChange={(v) => setValue("employeeName", v)}
                    options={employeeNameOptions}
                    placeholder="Select or type employee name"
                    dataOcid="input-employeename"
                  />
                )}
              />
            </FormField>

            {/* Freelancer Name combobox */}
            <FormField label="Freelancer Name">
              <Controller
                name="freelancerName"
                control={control}
                render={({ field }) => (
                  <Combobox
                    value={field.value ?? ""}
                    onChange={(v) => setValue("freelancerName", v)}
                    options={freelancerNameOptions}
                    placeholder="Select or type freelancer name"
                    dataOcid="input-freelancername"
                  />
                )}
              />
            </FormField>

            {/* ── Project Financials ── */}
            <SectionHeader title="Project Financials" />

            <FormField label="System Size (kW)">
              <Input
                {...register("kw", { valueAsNumber: true })}
                type="number"
                step="0.5"
                placeholder="e.g. 5"
                className="h-8 text-sm"
                data-ocid="input-kw"
              />
            </FormField>
            <FormField label="Sale Price (₹)">
              <Input
                {...register("salePrice", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 285000"
                className="h-8 text-sm"
                data-ocid="input-saleprice"
              />
            </FormField>
            <FormField label="Invoice No">
              <Input
                {...register("invoiceNo")}
                placeholder="INV-2024-001"
                className="h-8 text-sm"
                data-ocid="input-invoice"
              />
            </FormField>
            <FormField label="Booking Agreement Date">
              <Input
                {...register("bookingAgreementDate")}
                type="date"
                className="h-8 text-sm"
                data-ocid="input-bookingagreementdate"
              />
            </FormField>
            <div className="flex items-center gap-3">
              <Controller
                name="signAgreement"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      data-ocid="switch-signagreement"
                    />
                    <Label className="text-xs">Agreement Signed</Label>
                  </div>
                )}
              />
            </div>
            <div className="flex items-center gap-3">
              <Controller
                name="digitalApprovedLetter"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      data-ocid="switch-digitalapproval"
                    />
                    <Label className="text-xs">Digital Approval</Label>
                  </div>
                )}
              />
            </div>

            {/* ── Finance Details ── */}
            <SectionHeader title="Finance Details" />

            {/* Booking Amount + Date */}
            <FormField label="Booking Amount (₹)">
              <Input
                {...register("bookingAmount", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 50000"
                className="h-8 text-sm"
                data-ocid="input-bookingamount"
              />
            </FormField>
            <FormField label="Booking Amount Date">
              <Input
                {...register("bookingAmountDate")}
                type="date"
                className="h-8 text-sm"
                data-ocid="input-bookingamountdate"
              />
            </FormField>

            {/* Finance 1 */}
            <FormField label="Finance Amount 1 (₹)">
              <Input
                {...register("financeAmount1", { valueAsNumber: true })}
                type="number"
                className="h-8 text-sm"
                data-ocid="input-finance1"
              />
            </FormField>
            <FormField label="Finance Date 1">
              <Input
                {...register("financeDate1")}
                type="date"
                className="h-8 text-sm"
                data-ocid="input-financedate1"
              />
            </FormField>

            {/* Finance 2 */}
            <FormField label="Finance Amount 2 (₹)">
              <Input
                {...register("financeAmount2", { valueAsNumber: true })}
                type="number"
                className="h-8 text-sm"
                data-ocid="input-finance2"
              />
            </FormField>
            <FormField label="Finance Date 2">
              <Input
                {...register("financeDate2")}
                type="date"
                className="h-8 text-sm"
                data-ocid="input-financedate2"
              />
            </FormField>

            {/* Last Payment (cashAmount2) + Date */}
            <FormField label="Last Payment Amount (₹)">
              <Input
                {...register("cashAmount2", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 50000"
                className="h-8 text-sm"
                data-ocid="input-cash2"
              />
            </FormField>
            <FormField label="Last Payment Date">
              <Input
                {...register("cashAmount2Date")}
                type="date"
                className="h-8 text-sm"
                data-ocid="input-cash2date"
              />
            </FormField>

            {/* Total Received — read-only calculated */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Total Received (₹)
              </Label>
              <div
                className="h-8 flex items-center px-3 rounded-md bg-muted/60 border border-border text-sm font-semibold tabular-nums text-foreground"
                data-ocid="display-totalreceived"
              >
                ₹{totalReceived.toLocaleString("en-IN")}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (auto)
                </span>
              </div>
            </div>

            {/* Pending Amount — read-only calculated */}
            <FormField label="Pending Amount (₹) — Auto">
              <div
                className="h-8 flex items-center px-3 rounded-md bg-muted/60 border border-border text-sm font-semibold tabular-nums"
                data-ocid="display-pendingamount"
              >
                <span
                  className={
                    computedPending > 0 ? "text-accent" : "text-foreground"
                  }
                >
                  ₹{computedPending.toLocaleString("en-IN")}
                </span>
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (auto)
                </span>
              </div>
            </FormField>

            {/* GST + Subsidy */}
            <FormField label="GST Amount (₹)">
              <Input
                {...register("gstAmount", { valueAsNumber: true })}
                type="number"
                className="h-8 text-sm"
                data-ocid="input-gst"
              />
            </FormField>
            <FormField label="GST Filing Month">
              <Input
                {...register("gstFillingMonth")}
                placeholder="e.g. Mar-2024"
                className="h-8 text-sm"
                data-ocid="input-gstmonth"
              />
            </FormField>
            <FormField label="Subsidy Disbursed (₹)">
              <Input
                {...register("subsidyDisbursed", { valueAsNumber: true })}
                type="number"
                className="h-8 text-sm"
                data-ocid="input-subsidy"
              />
            </FormField>

            {/* ── Installation Timeline ── */}
            <SectionHeader title="Installation Timeline" />

            <FormField label="Material Purchase Date">
              <Input
                {...register("materialPurchaseDate")}
                type="date"
                className="h-8 text-sm"
                data-ocid="input-materialdate"
              />
            </FormField>
            <FormField label="Delivery Date">
              <Input
                {...register("deliveryDate")}
                type="date"
                className="h-8 text-sm"
                data-ocid="input-deliverydate"
              />
            </FormField>
            <FormField label="E-Way Bill No">
              <Input
                {...register("ewayBillNo")}
                placeholder="EW-24-001"
                className="h-8 text-sm"
                data-ocid="input-ewaybill"
              />
            </FormField>
            <FormField label="Installation Date">
              <Input
                {...register("installationDate")}
                type="date"
                className="h-8 text-sm"
                data-ocid="input-installdate"
              />
            </FormField>
            <FormField label="Net Metering Date">
              <Input
                {...register("netMeteringDate")}
                type="date"
                className="h-8 text-sm"
                data-ocid="input-netmetering"
              />
            </FormField>

            <div className="col-span-2">
              <Separator className="mb-3" />
              <FormField label="Remarks">
                <Textarea
                  {...register("remarks")}
                  placeholder="Additional notes…"
                  rows={3}
                  className="text-sm resize-none"
                  data-ocid="input-remarks"
                />
              </FormField>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-border">
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-smooth"
              onClick={onClose}
              data-ocid="modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth disabled:opacity-60"
              data-ocid="modal-submit"
            >
              {isSubmitting
                ? "Saving…"
                : isEdit
                  ? "Save Changes"
                  : "Add Project"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
