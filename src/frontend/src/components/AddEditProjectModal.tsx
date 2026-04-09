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

// FormData uses string for numeric inputs to avoid NaN from valueAsNumber on empty fields
type FormData = {
  customerName: string;
  phoneNumber?: string;
  address?: string;
  consumerAcNo?: string;
  projectStatus: ProjectStatus;
  currentStage?: ProjectStage;
  region: string;
  district?: string;
  employeeType: string;
  leadSource: string;
  employeeName?: string;
  freelancerName?: string;
  // Financials stored as strings to avoid NaN
  kw: string;
  salePrice: string;
  invoiceNo?: string;
  bookingAgreementDate?: string;
  signAgreement?: boolean;
  digitalApprovedLetter?: boolean;
  // Finance Details
  bookingAmount: string;
  bookingAmountDate?: string;
  financeAmount1: string;
  financeDate1?: string;
  financeAmount2: string;
  financeDate2?: string;
  cashAmount2: string;
  cashAmount2Date?: string;
  // GST + Subsidy
  gstAmount: string;
  gstFillingMonth?: string;
  subsidyDisbursed: string;
  // Timeline
  materialPurchaseDate?: string;
  deliveryDate?: string;
  ewayBillNo?: string;
  installationDate?: string;
  netMeteringDate?: string;
  remarks?: string;
};

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

/** Convert a SolarProject numeric field to a form string, empty string for undefined/null/NaN */
function numToStr(n?: number): string {
  if (n == null || Number.isNaN(n)) return "";
  return String(n);
}

/** Parse a form string to a number. Returns undefined if blank, actual number otherwise. */
function strToNum(s: string): number | undefined {
  if (s === "" || s == null) return undefined;
  const n = Number(s);
  return Number.isNaN(n) ? undefined : n;
}

/** Parse a form string to a number, returning 0 for blank/invalid (for calculations). */
function strToNumCalc(s: string): number {
  if (s === "" || s == null) return 0;
  const n = Number(s);
  return Number.isNaN(n) ? 0 : n;
}

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
export function Combobox({
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

  // Sync query when value changes externally (e.g. form reset)
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
          const v = e.target.value;
          setQuery(v);
          onChange(v);
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

/** Build a clean blank FormData for "add" mode */
function blankFormData(): FormData {
  return {
    customerName: "",
    phoneNumber: "",
    address: "",
    consumerAcNo: "",
    projectStatus: "OPEN",
    currentStage: undefined,
    region: "TPCODL",
    district: undefined,
    employeeType: "Direct",
    leadSource: "Referral Partner",
    employeeName: "",
    freelancerName: "",
    kw: "",
    salePrice: "",
    invoiceNo: "",
    bookingAgreementDate: "",
    signAgreement: false,
    digitalApprovedLetter: false,
    bookingAmount: "",
    bookingAmountDate: "",
    financeAmount1: "",
    financeDate1: "",
    financeAmount2: "",
    financeDate2: "",
    cashAmount2: "",
    cashAmount2Date: "",
    gstAmount: "",
    gstFillingMonth: "",
    subsidyDisbursed: "",
    materialPurchaseDate: "",
    deliveryDate: "",
    ewayBillNo: "",
    installationDate: "",
    netMeteringDate: "",
    remarks: "",
  };
}

/** Convert a SolarProject to FormData, safely converting all numeric fields to strings */
function projectToFormData(p: SolarProject): FormData {
  return {
    customerName: p.customerName ?? "",
    phoneNumber: p.phoneNumber ?? "",
    address: p.address ?? "",
    consumerAcNo: p.consumerAcNo ?? "",
    projectStatus: p.projectStatus ?? "OPEN",
    currentStage: p.currentStage ?? undefined,
    region: p.region ?? "TPCODL",
    district: p.district ?? undefined,
    employeeType: p.employeeType ?? "Direct",
    leadSource: p.leadSource ?? "Referral Partner",
    employeeName: p.employeeName ?? "",
    freelancerName: p.freelancerName ?? "",
    kw: numToStr(p.kw),
    salePrice: numToStr(p.salePrice),
    invoiceNo: p.invoiceNo ?? "",
    bookingAgreementDate: p.bookingAgreementDate ?? "",
    signAgreement: p.signAgreement ?? false,
    digitalApprovedLetter: p.digitalApprovedLetter ?? false,
    bookingAmount: numToStr(p.bookingAmount),
    bookingAmountDate: p.bookingAmountDate ?? "",
    financeAmount1: numToStr(p.financeAmount1),
    financeDate1: p.financeDate1 ?? "",
    financeAmount2: numToStr(p.financeAmount2),
    financeDate2: p.financeDate2 ?? "",
    cashAmount2: numToStr(p.cashAmount2),
    cashAmount2Date: p.cashAmount2Date ?? "",
    gstAmount: numToStr(p.gstAmount),
    gstFillingMonth: p.gstFillingMonth ?? "",
    subsidyDisbursed: numToStr(p.subsidyDisbursed),
    materialPurchaseDate: p.materialPurchaseDate ?? "",
    deliveryDate: p.deliveryDate ?? "",
    ewayBillNo: p.ewayBillNo ?? "",
    installationDate: p.installationDate ?? "",
    netMeteringDate: p.netMeteringDate ?? "",
    remarks: p.remarks ?? "",
  };
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

  const { register, handleSubmit, reset, control } = useForm<FormData>({
    defaultValues: blankFormData(),
  });

  // Watch finance fields as strings — no NaN risk
  const salePriceStr = useWatch({ control, name: "salePrice" });
  const bookingAmountStr = useWatch({ control, name: "bookingAmount" });
  const financeAmount1Str = useWatch({ control, name: "financeAmount1" });
  const financeAmount2Str = useWatch({ control, name: "financeAmount2" });
  const cashAmount2Str = useWatch({ control, name: "cashAmount2" });

  const totalReceived =
    strToNumCalc(bookingAmountStr) +
    strToNumCalc(financeAmount1Str) +
    strToNumCalc(financeAmount2Str) +
    strToNumCalc(cashAmount2Str);
  const computedPending = strToNumCalc(salePriceStr) - totalReceived;

  // Reset form whenever the modal opens/closes or project changes
  useEffect(() => {
    if (open) {
      if (project) {
        reset(projectToFormData(project));
      } else {
        reset(blankFormData());
      }
    }
  }, [open, project, reset]);

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

    // Convert string fields back to numbers, using undefined for blank
    const payload: Omit<SolarProject, "id" | "slNo"> = {
      customerName: data.customerName,
      phoneNumber: data.phoneNumber || undefined,
      address: data.address || undefined,
      consumerAcNo: data.consumerAcNo || undefined,
      projectStatus: data.projectStatus,
      currentStage: data.currentStage || undefined,
      region: data.region,
      district: data.district || undefined,
      employeeType: data.employeeType,
      leadSource: data.leadSource,
      employeeName: empName || undefined,
      freelancerName: freeName || undefined,
      kw: strToNum(data.kw),
      salePrice: strToNum(data.salePrice),
      invoiceNo: data.invoiceNo || undefined,
      bookingAgreementDate: data.bookingAgreementDate || undefined,
      signAgreement: data.signAgreement ?? false,
      digitalApprovedLetter: data.digitalApprovedLetter ?? false,
      bookingAmount: strToNum(data.bookingAmount),
      bookingAmountDate: data.bookingAmountDate || undefined,
      financeAmount1: strToNum(data.financeAmount1),
      financeDate1: data.financeDate1 || undefined,
      financeAmount2: strToNum(data.financeAmount2),
      financeDate2: data.financeDate2 || undefined,
      cashAmount2: strToNum(data.cashAmount2),
      cashAmount2Date: data.cashAmount2Date || undefined,
      gstAmount: strToNum(data.gstAmount),
      gstFillingMonth: data.gstFillingMonth || undefined,
      subsidyDisbursed: strToNum(data.subsidyDisbursed),
      materialPurchaseDate: data.materialPurchaseDate || undefined,
      deliveryDate: data.deliveryDate || undefined,
      ewayBillNo: data.ewayBillNo || undefined,
      installationDate: data.installationDate || undefined,
      netMeteringDate: data.netMeteringDate || undefined,
      remarks: data.remarks || undefined,
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
                    value={field.value ?? "_none"}
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
                    value={field.value ?? "_none"}
                    onValueChange={(v) =>
                      field.onChange(v === "_none" ? undefined : v)
                    }
                  >
                    <SelectTrigger
                      className="h-8 text-sm"
                      data-ocid="select-district"
                    >
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">— Select district —</SelectItem>
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
                    onChange={field.onChange}
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
                    onChange={field.onChange}
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
                {...register("kw")}
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g. 5"
                className="h-8 text-sm"
                data-ocid="input-kw"
              />
            </FormField>
            <FormField label="Sale Price (₹)">
              <Input
                {...register("salePrice")}
                type="number"
                min="0"
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
                {...register("bookingAmount")}
                type="number"
                min="0"
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
                {...register("financeAmount1")}
                type="number"
                min="0"
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
                {...register("financeAmount2")}
                type="number"
                min="0"
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
                {...register("cashAmount2")}
                type="number"
                min="0"
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
                {...register("gstAmount")}
                type="number"
                min="0"
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
                {...register("subsidyDisbursed")}
                type="number"
                min="0"
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
