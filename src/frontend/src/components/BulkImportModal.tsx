import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TEMPLATE_CSV_HEADERS,
  downloadCSVTemplate,
} from "@/constants/csvTemplate";
import type {
  CreateProjectInput,
  ProjectStage,
  ProjectStatus,
  SolarProject,
} from "@/types/project";
import { AlertCircle, CheckCircle2, Upload, X } from "lucide-react";
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

/**
 * Parse a numeric cell value — trims whitespace, strips currency symbols/commas.
 * Returns the parsed number, or 0 if empty/invalid.
 */
function parseNumber(val: string | undefined): number {
  if (!val || val.trim() === "") return 0;
  // Remove currency symbols, spaces, and commas; keep digits, dots, and leading minus
  const cleaned = val
    .trim()
    .replace(/[₹$€£,\s]/g, "")
    .replace(/[^\d.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return 0;
  const n = Number.parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Parse a date cell value — handles YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY.
 * Returns ISO date string (YYYY-MM-DD) or undefined for blank/invalid.
 */
function parseDate(val: string | undefined): string | undefined {
  if (!val || val.trim() === "") return undefined;
  const raw = val.trim();

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(`${raw}T00:00:00`);
    return Number.isNaN(d.getTime()) ? undefined : raw;
  }

  // DD/MM/YYYY format
  const ddmmyyyy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    const isoStr = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    const d = new Date(`${isoStr}T00:00:00`);
    return Number.isNaN(d.getTime()) ? undefined : isoStr;
  }

  // MM/DD/YYYY format
  const mmddyyyy = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (mmddyyyy) {
    const [, mm, dd, yyyy] = mmddyyyy;
    const isoStr = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    const d = new Date(`${isoStr}T00:00:00`);
    return Number.isNaN(d.getTime()) ? undefined : isoStr;
  }

  // Fallback: try native Date parsing (handles many formats)
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) {
    // Format as YYYY-MM-DD
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return undefined;
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
        // Handle doubled quotes inside quoted field
        if (inQuotes && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
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

export function buildProject(
  row: string[],
  headers: string[],
  slNo: number,
): CreateProjectInput {
  /** Case-insensitive, trimmed header lookup */
  const get = (name: string): string | undefined => {
    const idx = headers.findIndex(
      (h) => h.toLowerCase().trim() === name.toLowerCase().trim(),
    );
    return idx >= 0 ? row[idx]?.trim() : undefined;
  };

  // ── Finance fields ──────────────────────────────────────────────────────────
  const salePrice = parseNumber(get("sale price"));
  const bookingAmount = parseNumber(get("booking amount"));
  const financeAmount1 = parseNumber(get("finance amount 1"));
  const financeAmount2 = parseNumber(get("finance amount 2"));
  // "Last Payment Amount" → cashAmount2 in the data model
  const cashAmount2 = parseNumber(get("last payment amount"));

  // Always compute pending from the four received amounts
  const pendingAmount =
    salePrice - (bookingAmount + financeAmount1 + financeAmount2 + cashAmount2);

  // ── Status & Stage ──────────────────────────────────────────────────────────
  const rawStatus = (get("status") ?? "OPEN").toUpperCase().trim();
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

  const rawStage = (get("current stage") ?? "").trim();
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

  const rawLeadSource = (get("lead source") ?? "Referral Partner").trim();
  const leadSource: string =
    rawLeadSource === "Freelancer" ? "Freelancer" : "Referral Partner";

  // ── Build the project ───────────────────────────────────────────────────────
  return {
    slNo,
    customerName: get("customer name") ?? "",
    phoneNumber: get("phone") || undefined,
    address: get("address") || undefined,
    region: get("region") ?? "TPCODL",
    district: get("district") || undefined,
    leadSource,
    employeeName: get("employee name") || undefined,
    freelancerName: get("freelancer name") || undefined,
    employeeType: "Direct",
    projectStatus,
    currentStage,
    kw: parseNumber(get("kw")) || undefined,
    salePrice: salePrice || undefined,

    // Finance amounts — only set when > 0 to avoid saving 0 as a real entry
    bookingAmount: bookingAmount > 0 ? bookingAmount : undefined,
    bookingAmountDate: parseDate(get("booking amount date")),
    financeAmount1: financeAmount1 > 0 ? financeAmount1 : undefined,
    // Template header is "Finance Amount 1 Date"
    financeDate1: parseDate(get("finance amount 1 date")),
    financeAmount2: financeAmount2 > 0 ? financeAmount2 : undefined,
    // Template header is "Finance Amount 2 Date"
    financeDate2: parseDate(get("finance amount 2 date")),
    cashAmount2: cashAmount2 > 0 ? cashAmount2 : undefined,
    // Template header is "Last Payment Date"
    cashAmount2Date: parseDate(get("last payment date")),

    // Misc dates and IDs
    installationDate: parseDate(get("installation date")),
    netMeteringDate: parseDate(get("net metering date")),
    invoiceNo: get("invoice number") || undefined,
    consumerAcNo: get("ac no") || undefined,
    remarks: get("remarks") || undefined,

    // Pending is always recomputed here AND in useProjects.addProject
    pendingAmount,
  };
}

export function parseCsvToProjects(
  text: string,
  startSlNo: number,
): ParseResult {
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

  // Validate that the CSV has the expected headers (warn only — don't reject)
  const missingHeaders = TEMPLATE_CSV_HEADERS.filter(
    (expected) =>
      !headers.some(
        (h) => h.toLowerCase().trim() === expected.toLowerCase().trim(),
      ),
  );
  if (missingHeaders.length > 0) {
    errors.push({
      row: 0,
      message: `Missing columns: ${missingHeaders.join(", ")}. Check your template.`,
    });
  }

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
              onClick={downloadCSVTemplate}
              className="inline-flex items-center gap-1.5 mt-1 text-primary hover:text-primary/80 font-medium transition-colors duration-150"
              data-ocid="modal-download-template"
            >
              <Upload className="w-3.5 h-3.5 rotate-180" />
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
