import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CreateProjectInput {
    kw?: number;
    region: string;
    customerName: string;
    cashAmount2?: number;
    financeDate1?: string;
    financeDate2?: string;
    gstFillingMonth?: string;
    employeeName?: string;
    employeeType: string;
    nextStage?: string;
    lastPaymentDate?: string;
    slNo: bigint;
    bookingAmount?: number;
    freelancerName?: string;
    invoiceNo?: string;
    deliveryDate?: string;
    ewayBillNo?: string;
    financeAmount1?: number;
    financeAmount2?: number;
    netMeteringDate?: string;
    gstAmount?: number;
    materialPurchaseDate?: string;
    district?: string;
    bookingAgreementDate?: string;
    bookingAmountDate?: string;
    address?: string;
    subsidyDisbursed?: number;
    leadSource: string;
    signAgreement?: boolean;
    projectStatus: ProjectStatus;
    salePrice?: number;
    consumerAcNo?: string;
    phoneNumber?: string;
    currentStage?: string;
    pendingAmount?: number;
    cashAmount2Date?: string;
    remarks?: string;
    installationDate?: string;
    digitalApprovedLetter?: boolean;
}
export interface UpdateProjectInput {
    id: string;
    kw?: number;
    region: string;
    customerName: string;
    cashAmount2?: number;
    financeDate1?: string;
    financeDate2?: string;
    gstFillingMonth?: string;
    employeeName?: string;
    employeeType: string;
    nextStage?: string;
    lastPaymentDate?: string;
    slNo: bigint;
    bookingAmount?: number;
    freelancerName?: string;
    invoiceNo?: string;
    deliveryDate?: string;
    ewayBillNo?: string;
    financeAmount1?: number;
    financeAmount2?: number;
    netMeteringDate?: string;
    gstAmount?: number;
    materialPurchaseDate?: string;
    district?: string;
    bookingAgreementDate?: string;
    bookingAmountDate?: string;
    address?: string;
    subsidyDisbursed?: number;
    leadSource: string;
    signAgreement?: boolean;
    projectStatus: ProjectStatus;
    salePrice?: number;
    consumerAcNo?: string;
    phoneNumber?: string;
    currentStage?: string;
    pendingAmount?: number;
    cashAmount2Date?: string;
    remarks?: string;
    installationDate?: string;
    digitalApprovedLetter?: boolean;
}
export interface UserSession {
    accessLevel: string;
    token: string;
    username: string;
}
export interface UserInfo {
    accessLevel: string;
    username: string;
}
export interface SolarProject {
    id: string;
    kw?: number;
    region: string;
    customerName: string;
    cashAmount2?: number;
    financeDate1?: string;
    financeDate2?: string;
    gstFillingMonth?: string;
    employeeName?: string;
    employeeType: string;
    nextStage?: string;
    lastPaymentDate?: string;
    slNo: bigint;
    bookingAmount?: number;
    freelancerName?: string;
    invoiceNo?: string;
    deliveryDate?: string;
    ewayBillNo?: string;
    financeAmount1?: number;
    financeAmount2?: number;
    netMeteringDate?: string;
    gstAmount?: number;
    materialPurchaseDate?: string;
    district?: string;
    bookingAgreementDate?: string;
    bookingAmountDate?: string;
    address?: string;
    subsidyDisbursed?: number;
    leadSource: string;
    signAgreement?: boolean;
    projectStatus: ProjectStatus;
    salePrice?: number;
    consumerAcNo?: string;
    phoneNumber?: string;
    currentStage?: string;
    pendingAmount?: number;
    cashAmount2Date?: string;
    remarks?: string;
    installationDate?: string;
    digitalApprovedLetter?: boolean;
}
export enum ProjectStatus {
    ONGOING = "ONGOING",
    OPEN = "OPEN",
    REJECT = "REJECT",
    CLOSED = "CLOSED"
}
export interface backendInterface {
    createProject(input: CreateProjectInput): Promise<SolarProject>;
    createUser(callerToken: string, username: string, password: string, accessLevel: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteProject(id: string): Promise<boolean>;
    deleteUser(callerToken: string, username: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAllProjects(): Promise<Array<SolarProject>>;
    getProject(id: string): Promise<SolarProject | null>;
    getProjectsByRegion(region: string): Promise<Array<SolarProject>>;
    getProjectsByStatus(status: ProjectStatus): Promise<Array<SolarProject>>;
    listUsers(callerToken: string): Promise<{
        __kind__: "ok";
        ok: Array<UserInfo>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    login(username: string, password: string): Promise<{
        __kind__: "ok";
        ok: UserSession;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateProject(input: UpdateProjectInput): Promise<SolarProject | null>;
    validateSession(token: string): Promise<{
        __kind__: "ok";
        ok: UserInfo;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
