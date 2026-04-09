/** Single source of truth for CSV import/export template headers and example row */

export const TEMPLATE_CSV_HEADERS = [
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

export const TEMPLATE_CSV_EXAMPLE = [
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

export function buildTemplateCSV(): string {
  const rows = [
    TEMPLATE_CSV_HEADERS.join(","),
    TEMPLATE_CSV_EXAMPLE.map((v) => `"${v}"`).join(","),
  ];
  return rows.join("\n");
}

export function downloadCSVTemplate(): void {
  const csv = buildTemplateCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "solar_projects_template.csv";
  link.click();
  URL.revokeObjectURL(url);
}
