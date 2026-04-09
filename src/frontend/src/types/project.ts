export type ProjectStatus = "OPEN" | "ONGOING" | "CLOSED" | "REJECT";

export type ProjectStage =
  | "Registration"
  | "Digital Approval"
  | "Material Delivery"
  | "Installation"
  | "JE Inspection"
  | "Net Metering"
  | "Subsidy"
  | "Completed";

export const PROJECT_STAGES: ProjectStage[] = [
  "Registration",
  "Digital Approval",
  "Material Delivery",
  "Installation",
  "JE Inspection",
  "Net Metering",
  "Subsidy",
  "Completed",
];

/** Full project shape used throughout the frontend UI */
export interface SolarProject {
  id: string;
  slNo: number;
  employeeType: string;
  leadSource: string;
  leadSourceName?: string;
  employeeName?: string;
  freelancerName?: string;
  region: string;
  district?: string;
  projectStatus: ProjectStatus;
  currentStage?: ProjectStage;
  customerName: string;
  address?: string;
  phoneNumber?: string;
  consumerAcNo?: string;
  kw?: number;
  salePrice?: number;
  bookingAmount?: number;
  bookingAmountDate?: string;
  bookingAgreementDate?: string;
  signAgreement?: boolean;
  digitalApprovedLetter?: boolean;
  financeAmount1?: number;
  financeDate1?: string;
  financeAmount2?: number;
  financeDate2?: string;
  cashAmount2?: number; // Last Payment Amount
  cashAmount2Date?: string; // Last Payment Date
  materialPurchaseDate?: string;
  deliveryDate?: string;
  ewayBillNo?: string;
  installationDate?: string;
  netMeteringDate?: string;
  pendingAmount?: number;
  subsidyDisbursed?: number;
  invoiceNo?: string;
  gstAmount?: number;
  gstFillingMonth?: string;
  remarks?: string;
}

export type CreateProjectInput = Omit<SolarProject, "id">;

export interface ProjectFilters {
  status?: ProjectStatus | "ALL";
  region?: string;
  search?: string;
  regionFilter?: string;
  employeeFilter?: string;
  currentStage?: ProjectStage;
}
