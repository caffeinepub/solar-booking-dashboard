import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  CreateProjectInput,
  ProjectStage,
  ProjectStatus,
  SolarProject,
} from "@/types/project";
import { AlertCircle, CheckCircle2, Download, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (
    projects: CreateProjectInput[],
  ) => Promise<{ added: number; skipped: number }>;
  nextSlNo: number;
  existingProjects?: SolarProject[];
}

interface ParseResult {
  valid: CreateProjectInput[];
  errors: { row: number; message: string }[];
}

interface ImportSummary {
  added: number;
  skipped: number;
}

const TEMPLATE_HEADERS = [
  "SL No",
  "Customer Name",
  "Phone",
  "Address",
  "Region",
  "District",
  "Lead Source",
  "Employee Name",
  "Freelancer Name",
  "Status",
  "KW",
  "Sale Price",
  "Booking Amount",
  "Booking Amount Date",
  "Finance Amount 1",
  "Finance Amount 1 Date",
  "Finance Amount 2",
  "Finance Amount 2 Date",
  "Last Payment Amount",
  "Last Payment Date",
  "Current Stage",
  "GST Number",
  "Invoice Number",
  "AC No",
  "Application No",
  "Discom No",
  "Net Meter No",
  "Remarks",
  "Notes",
  "Installation Date",
  "JE Inspection Date",
  "Net Metering Date",
  "Subsidy Date",
];

const TEMPLATE_EXAMPLE = [
  "1",
  "Ramesh Kumar",
  "9876543210",
  "12 Main Road, Bhubaneswar",
  "TPCODL",
  "Khurda",
  "Referral Partner",
  "Saumya Kanta Swain",
  "Raju Sharma",
  "OPEN",
  "5",
  "285000",
  "50000",
  "2024-01-10",
  "180000",
  "2024-01-20",
  "0",
  "",
  "0",
  "",
  "Registration",
  "GST12345",
  "INV-2024-001",
  "TPCODL-2024-001",
  "APP-001",
  "DISCOM-001",
  "NM-001",
  "Site survey done",
  "Finance pending",
  "2024-02-15",
  "2024-03-01",
  "2024-03-15",
  "2024-04-01",
];

function downloadTemplate() {
  const rows = [
    TEMPLATE_HEADERS.join(","),
    TEMPLATE_EXAMPLE.map((v) => `"${v}"`).join(","),
  ];
  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "solar_projects_template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function parseNumber(val: string | undefined): number {
  if (!val || val.trim() === "") return 0;
  const n = Number.parseFloat(val.replace(/[^\d.-]/g, ""));
  return Number.isNaN(n) ? 0 : n;
}

function parseDate(val: string | undefined): string | undefined {
  if (!val || val.trim() === "") return undefined;
  const d = new Date(val.trim());
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
}

function parseCSV(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => {
    const cells: string[] = [];
    let inQuotes = false;
    let cell = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cells.push(cell.trim());
        cell = "";
      } else {
        cell += ch;
      }
    }
    cells.push(cell.trim());
    return cells;
  });
}

function buildProject(
  row: string[],
  headers: string[],
  slNo: number,
): CreateProjectInput {
  const get = (name: string) => {
    const idx = headers.findIndex(
      (h) => h.toLowerCase().trim() === name.toLowerCase(),
    );
    return idx >= 0 ? row[idx]?.trim() : undefined;
  };

  const salePrice = parseNumber(get("sale price"));
  const bookingAmount = parseNumber(get("booking amount"));
  const financeAmount1 = parseNumber(get("finance amount 1"));
  const financeAmount2 = parseNumber(get("finance amount 2"));
  const cashAmount2 = parseNumber(get("last payment amount"));
  const pendingAmount =
    salePrice - (bookingAmount + financeAmount1 + financeAmount2 + cashAmount2);

  const rawStatus = (get("status") ?? "OPEN").toUpperCase();
  const validStatuses: ProjectStatus[] = [
    "OPEN",
    "ONGOING",
    "CLOSED",
    "REJECT",
  ];
  const projectStatus: ProjectStatus = validStatuses.includes(
    rawStatus as ProjectStatus,
  )
    ? (rawStatus as ProjectStatus)
    : "OPEN";

  const rawStage = get("current stage");
  const validStages: ProjectStage[] = [
    "Registration",
    "Digital Approval",
    "Material Delivery",
    "Installation",
    "JE Inspection",
    "Net Metering",
    "Subsidy",
    "Completed",
  ];
  const currentStage: ProjectStage | undefined =
    rawStage && validStages.includes(rawStage as ProjectStage)
      ? (rawStage as ProjectStage)
      : undefined;

  const rawLeadSource = get("lead source") ?? "Referral Partner";
  const leadSource =
    rawLeadSource === "Freelancer" ? "Freelancer" : "Referral Partner";

  return {
    slNo,
    customerName: get("customer name") ?? "",
    phoneNumber: get("phone"),
    address: get("address"),
    region: get("region") ?? "",
    district: get("district"),
    leadSource,
    employeeName: get("employee name"),
    freelancerName: get("freelancer name"),
    employeeType: "Direct",
    projectStatus,
    currentStage,
    kw: parseNumber(get("kw")) || undefined,
    salePrice: salePrice || undefined,
    bookingAmount: bookingAmount || undefined,
    bookingAmountDate: parseDate(get("booking amount date")),
    financeAmount1: financeAmount1 || undefined,
    financeDate1: parseDate(get("finance amount 1 date")),
    financeAmount2: financeAmount2 || undefined,
    financeDate2: parseDate(get("finance amount 2 date")),
    cashAmount2: cashAmount2 || undefined,
    cashAmount2Date: parseDate(get("last payment date")),
    installationDate: parseDate(get("installation date")),
    netMeteringDate: parseDate(get("net metering date")),
    invoiceNo: get("invoice number"),
    consumerAcNo: get("ac no"),
    remarks: get("remarks"),
    pendingAmount,
  };
}

function parseCsvToProjects(text: string, startSlNo: number): ParseResult {
  const rows = parseCSV(text);
  if (rows.length < 2)
    return {
      valid: [],
      errors: [{ row: 0, message: "File is empty or has no data rows." }],
    };

  const headers = rows[0];
  const dataRows = rows.slice(1).filter((r) => r.some((c) => c !== ""));

  const valid: CreateProjectInput[] = [];
  const errors: { row: number; message: string }[] = [];

  dataRows.forEach((row, i) => {
    const rowNum = i + 2;
    const nameIdx = headers.findIndex(
      (h) => h.toLowerCase().trim() === "customer name",
    );
    const salePriceIdx = headers.findIndex(
      (h) => h.toLowerCase().trim() === "sale price",
    );

    const customerName = nameIdx >= 0 ? row[nameIdx]?.trim() : "";
    const salePriceRaw = salePriceIdx >= 0 ? row[salePriceIdx]?.trim() : "";

    if (!customerName) {
      errors.push({
        row: rowNum,
        message: `Row ${rowNum}: Missing required field "Customer Name"`,
      });
      return;
    }
    if (!salePriceRaw) {
      errors.push({
        row: rowNum,
        message: `Row ${rowNum}: Missing required field "Sale Price"`,
      });
      return;
    }

    try {
      const project = buildProject(row, headers, startSlNo + valid.length);
      valid.push(project);
    } catch {
      errors.push({
        row: rowNum,
        message: `Row ${rowNum}: Failed to parse row data`,
      });
    }
  });

  return { valid, errors };
}

export function BulkImportModal({
  open,
  onClose,
  onImport,
  nextSlNo,
  existingProjects = [],
}: BulkImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  // Preview dedup count based on existing projects
  const previewDuplicateCount =
    parseResult?.valid.filter((p) =>
      existingProjects.some(
        (ex) =>
          ex.customerName.toLowerCase().trim() ===
          p.customerName.toLowerCase().trim(),
      ),
    ).length ?? 0;
  const previewAddCount =
    (parseResult?.valid.length ?? 0) - previewDuplicateCount;

  const reset = () => {
    setFileName(null);
    setParseResult(null);
    setImporting(false);
    setDone(false);
    setSummary(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setDone(false);
    setParseResult(null);
    setSummary(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCsvToProjects(text, nextSlNo);
      setParseResult(result);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.valid.length === 0) return;
    setImporting(true);
    try {
      const result = await onImport(parseResult.valid);
      setSummary(result);
      setDone(true);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-lg w-full bg-card border border-border shadow-lg"
        data-ocid="bulk-import-modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-display font-semibold">
            <Upload className="w-4 h-4 text-primary" />
            Bulk Import Projects
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground">How to import:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Download the CSV template below</li>
              <li>
                Fill in your project data (Customer Name and Sale Price are
                required)
              </li>
              <li>Upload the completed file and click Import</li>
            </ol>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              ⚠ Duplicate entries (same Customer Name) will be automatically
              skipped.
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-1.5 mt-1 text-primary hover:text-primary/80 font-medium transition-colors duration-150"
              data-ocid="modal-download-template"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template CSV
            </button>
          </div>

          {/* File input */}
          {!done && (
            <div>
              <label
                htmlFor="csv-file-input"
                className="block text-xs font-medium text-foreground mb-1.5"
              >
                Select CSV File
              </label>
              <button
                type="button"
                className="relative w-full flex items-center gap-3 border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-4 cursor-pointer transition-colors duration-150 bg-background text-left"
                onClick={() => fileRef.current?.click()}
                aria-label="Click to select CSV file"
              >
                <Upload className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  {fileName ? (
                    <span className="text-sm text-foreground font-medium truncate block">
                      {fileName}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Click to select a .csv file
                    </span>
                  )}
                </div>
                {fileName && (
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                    aria-label="Clear file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </button>
              <input
                ref={fileRef}
                id="csv-file-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
                data-ocid="csv-file-input"
              />
            </div>
          )}

          {/* Parse result preview */}
          {parseResult && !done && (
            <div className="space-y-2">
              {parseResult.valid.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                      <span className="font-semibold text-primary">
                        {parseResult.valid.length}
                      </span>{" "}
                      row{parseResult.valid.length !== 1 ? "s" : ""} parsed
                    </span>
                  </div>
                  {previewDuplicateCount > 0 && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 pl-5">
                      {previewAddCount} will be added · {previewDuplicateCount}{" "}
                      duplicate{previewDuplicateCount !== 1 ? "s" : ""} will be
                      skipped
                    </div>
                  )}
                  {previewDuplicateCount === 0 && (
                    <div className="text-xs text-muted-foreground pl-5">
                      All {previewAddCount} project
                      {previewAddCount !== 1 ? "s" : ""} are new and will be
                      added
                    </div>
                  )}
                </div>
              )}
              {parseResult.errors.length > 0 && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {parseResult.errors.length} row
                    {parseResult.errors.length !== 1 ? "s" : ""} with errors
                    (will be skipped)
                  </div>
                  <ul className="space-y-0.5 max-h-24 overflow-y-auto">
                    {parseResult.errors.map((err) => (
                      <li key={err.row} className="text-xs text-destructive/80">
                        {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {parseResult.valid.length === 0 &&
                parseResult.errors.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No valid rows found in the file.
                  </p>
                )}
            </div>
          )}

          {/* Success state */}
          {done && summary && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-foreground">Import complete</p>
                <div className="flex flex-col gap-0.5 text-sm">
                  <span className="text-primary font-medium">
                    ✓ {summary.added} project{summary.added !== 1 ? "s" : ""}{" "}
                    added successfully
                  </span>
                  {summary.skipped > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                      ⟳ {summary.skipped} duplicate
                      {summary.skipped !== 1 ? "s" : ""} skipped (already exist)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-xs"
              data-ocid="bulk-import-cancel"
            >
              {done ? "Close" : "Cancel"}
            </Button>
            {!done && (
              <Button
                size="sm"
                onClick={handleImport}
                disabled={
                  !parseResult || parseResult.valid.length === 0 || importing
                }
                className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="bulk-import-submit"
              >
                <Upload className="w-3.5 h-3.5" />
                {importing
                  ? "Saving to backend…"
                  : `Import${previewAddCount > 0 ? ` ${previewAddCount} Project${previewAddCount !== 1 ? "s" : ""}` : ""}`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
