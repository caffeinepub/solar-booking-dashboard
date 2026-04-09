import { createActor } from "@/lib/actor";
import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect } from "react";
import { toast } from "sonner";
import { create } from "zustand";
import type {
  CreateProjectInput as BackendCreateInput,
  SolarProject as BackendProject,
  UpdateProjectInput as BackendUpdateInput,
} from "../backend";
import { ProjectStatus as BackendProjectStatus } from "../backend";
import type {
  CreateProjectInput,
  ProjectFilters,
  ProjectStage,
  ProjectStatus,
  SolarProject,
} from "../types/project";

export const DEFAULT_EMPLOYEE_NAMES = [
  "Saumya Kanta Swain",
  "Bismay Swain",
  "Smurit Barik",
  "Mahendra Tandi",
  "Pritesh Tandi",
  "Ayush Kasyap",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Safely convert a value that may be number | undefined | null | NaN to a clean number */
function safeNum(v: number | undefined | null): number | undefined {
  if (v == null) return undefined;
  if (Number.isNaN(v)) return undefined;
  return v;
}

/** Safely convert a value to number, defaulting to 0 for undefined/null/NaN (for calculations) */
function safeNumCalc(v: number | undefined | null): number {
  if (v == null || Number.isNaN(v)) return 0;
  return v;
}

/** Safely convert a string that may be undefined/null/"" to string | undefined */
function safeStr(v: string | undefined | null): string | undefined {
  if (v == null || v === "") return undefined;
  return v;
}

// ─── Type mappers ──────────────────────────────────────────────────────────────

function mapBackendStatus(status: BackendProjectStatus): ProjectStatus {
  const map: Record<BackendProjectStatus, ProjectStatus> = {
    [BackendProjectStatus.OPEN]: "OPEN",
    [BackendProjectStatus.ONGOING]: "ONGOING",
    [BackendProjectStatus.CLOSED]: "CLOSED",
    [BackendProjectStatus.REJECT]: "REJECT",
  };
  return map[status] ?? "OPEN";
}

function mapFrontendStatus(status: ProjectStatus): BackendProjectStatus {
  const map: Record<ProjectStatus, BackendProjectStatus> = {
    OPEN: BackendProjectStatus.OPEN,
    ONGOING: BackendProjectStatus.ONGOING,
    CLOSED: BackendProjectStatus.CLOSED,
    REJECT: BackendProjectStatus.REJECT,
  };
  return map[status];
}

export function backendToFrontend(bp: BackendProject): SolarProject {
  return {
    id: bp.id,
    slNo: Number(bp.slNo),
    employeeType: bp.employeeType ?? "Direct",
    leadSource: bp.leadSource ?? "Referral Partner",
    region: bp.region ?? "",
    customerName: bp.customerName ?? "",
    projectStatus: mapBackendStatus(bp.projectStatus),
    // Optional string fields
    address: safeStr(bp.address),
    phoneNumber: safeStr(bp.phoneNumber),
    consumerAcNo: safeStr(bp.consumerAcNo),
    district: safeStr(bp.district),
    employeeName: safeStr(bp.employeeName),
    freelancerName: safeStr(bp.freelancerName),
    invoiceNo: safeStr(bp.invoiceNo),
    remarks: safeStr(bp.remarks),
    gstFillingMonth: safeStr(bp.gstFillingMonth),
    ewayBillNo: safeStr(bp.ewayBillNo),
    currentStage: safeStr(bp.currentStage) as ProjectStage | undefined,
    // Optional date fields
    bookingAmountDate: safeStr(bp.bookingAmountDate),
    bookingAgreementDate: safeStr(bp.bookingAgreementDate),
    financeDate1: safeStr(bp.financeDate1),
    financeDate2: safeStr(bp.financeDate2),
    cashAmount2Date: safeStr(bp.cashAmount2Date),
    materialPurchaseDate: safeStr(bp.materialPurchaseDate),
    deliveryDate: safeStr(bp.deliveryDate),
    installationDate: safeStr(bp.installationDate),
    netMeteringDate: safeStr(bp.netMeteringDate),
    // Optional boolean fields
    signAgreement: bp.signAgreement ?? false,
    digitalApprovedLetter: bp.digitalApprovedLetter ?? false,
    // Optional numeric fields — sanitize NaN/null
    kw: safeNum(bp.kw),
    salePrice: safeNum(bp.salePrice),
    bookingAmount: safeNum(bp.bookingAmount),
    financeAmount1: safeNum(bp.financeAmount1),
    financeAmount2: safeNum(bp.financeAmount2),
    cashAmount2: safeNum(bp.cashAmount2),
    pendingAmount: safeNum(bp.pendingAmount),
    gstAmount: safeNum(bp.gstAmount),
    subsidyDisbursed: safeNum(bp.subsidyDisbursed),
  };
}

export function frontendToBackendCreate(
  input: CreateProjectInput,
): BackendCreateInput {
  return {
    slNo: BigInt(input.slNo),
    employeeType: input.employeeType,
    leadSource: input.leadSource,
    region: input.region,
    customerName: input.customerName,
    projectStatus: mapFrontendStatus(input.projectStatus),
    address: input.address,
    phoneNumber: input.phoneNumber,
    consumerAcNo: input.consumerAcNo,
    district: input.district,
    employeeName: input.employeeName,
    freelancerName: input.freelancerName,
    invoiceNo: input.invoiceNo,
    remarks: input.remarks,
    gstFillingMonth: input.gstFillingMonth,
    ewayBillNo: input.ewayBillNo,
    currentStage: input.currentStage,
    bookingAmountDate: input.bookingAmountDate,
    bookingAgreementDate: input.bookingAgreementDate,
    financeDate1: input.financeDate1,
    financeDate2: input.financeDate2,
    cashAmount2Date: input.cashAmount2Date,
    materialPurchaseDate: input.materialPurchaseDate,
    deliveryDate: input.deliveryDate,
    installationDate: input.installationDate,
    netMeteringDate: input.netMeteringDate,
    signAgreement: input.signAgreement,
    digitalApprovedLetter: input.digitalApprovedLetter,
    kw: input.kw,
    salePrice: input.salePrice,
    bookingAmount: input.bookingAmount,
    financeAmount1: input.financeAmount1,
    financeAmount2: input.financeAmount2,
    cashAmount2: input.cashAmount2,
    pendingAmount: input.pendingAmount,
    gstAmount: input.gstAmount,
    subsidyDisbursed: input.subsidyDisbursed,
    nextStage: undefined,
    lastPaymentDate: undefined,
  };
}

export function frontendToBackendUpdate(
  id: string,
  p: SolarProject,
): BackendUpdateInput {
  return {
    id,
    slNo: BigInt(p.slNo),
    employeeType: p.employeeType,
    leadSource: p.leadSource,
    region: p.region,
    customerName: p.customerName,
    projectStatus: mapFrontendStatus(p.projectStatus),
    address: p.address,
    phoneNumber: p.phoneNumber,
    consumerAcNo: p.consumerAcNo,
    district: p.district,
    employeeName: p.employeeName,
    freelancerName: p.freelancerName,
    invoiceNo: p.invoiceNo,
    remarks: p.remarks,
    gstFillingMonth: p.gstFillingMonth,
    ewayBillNo: p.ewayBillNo,
    currentStage: p.currentStage,
    bookingAmountDate: p.bookingAmountDate,
    bookingAgreementDate: p.bookingAgreementDate,
    financeDate1: p.financeDate1,
    financeDate2: p.financeDate2,
    cashAmount2Date: p.cashAmount2Date,
    materialPurchaseDate: p.materialPurchaseDate,
    deliveryDate: p.deliveryDate,
    installationDate: p.installationDate,
    netMeteringDate: p.netMeteringDate,
    signAgreement: p.signAgreement,
    digitalApprovedLetter: p.digitalApprovedLetter,
    kw: p.kw,
    salePrice: p.salePrice,
    bookingAmount: p.bookingAmount,
    financeAmount1: p.financeAmount1,
    financeAmount2: p.financeAmount2,
    cashAmount2: p.cashAmount2,
    pendingAmount: p.pendingAmount,
    gstAmount: p.gstAmount,
    subsidyDisbursed: p.subsidyDisbursed,
    nextStage: undefined,
    lastPaymentDate: undefined,
  };
}

/**
 * Calculate pending amount: salePrice - (bookingAmount + financeAmount1 + financeAmount2 + cashAmount2)
 * Treats undefined/null/NaN as 0. Never returns NaN.
 */
export function calcPending(p: Partial<SolarProject>): number {
  const sale = safeNumCalc(p.salePrice);
  const booking = safeNumCalc(p.bookingAmount);
  const f1 = safeNumCalc(p.financeAmount1);
  const f2 = safeNumCalc(p.financeAmount2);
  const cash = safeNumCalc(p.cashAmount2);
  return sale - (booking + f1 + f2 + cash);
}

// ─── Zustand store ─────────────────────────────────────────────────────────────

interface ProjectStore {
  projects: SolarProject[];
  isLoading: boolean;
  error: string | null;
  employeeNameOptions: string[];
  freelancerNameOptions: string[];
  setProjects: (projects: SolarProject[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addProjectLocal: (project: SolarProject) => void;
  updateProjectLocal: (id: string, project: SolarProject) => void;
  removeProjectLocal: (id: string) => void;
  addEmployeeNameOption: (name: string) => void;
  addFreelancerNameOption: (name: string) => void;
}

const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  isLoading: true,
  error: null,
  employeeNameOptions: [...DEFAULT_EMPLOYEE_NAMES],
  freelancerNameOptions: [],

  setProjects: (projects) => set({ projects }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addProjectLocal: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProjectLocal: (id, project) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? project : p)),
    })),

  removeProjectLocal: (id) =>
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),

  addEmployeeNameOption: (name: string) => {
    set((state) => {
      const trimmed = name.trim();
      if (!trimmed || state.employeeNameOptions.includes(trimmed)) return state;
      return { employeeNameOptions: [...state.employeeNameOptions, trimmed] };
    });
  },

  addFreelancerNameOption: (name: string) => {
    set((state) => {
      const trimmed = name.trim();
      if (!trimmed || state.freelancerNameOptions.includes(trimmed))
        return state;
      return {
        freelancerNameOptions: [...state.freelancerNameOptions, trimmed],
      };
    });
  },
}));

// ─── Public hook ───────────────────────────────────────────────────────────────

export function useProjects(filters?: ProjectFilters) {
  const {
    projects,
    isLoading,
    error,
    employeeNameOptions,
    freelancerNameOptions,
    addEmployeeNameOption,
    addFreelancerNameOption,
    setProjects,
    setLoading,
    setError,
    addProjectLocal,
    updateProjectLocal,
    removeProjectLocal,
  } = useProjectStore();

  const { actor, isFetching } = useActor(createActor);

  // Fetch projects from backend on mount (when actor becomes ready)
  useEffect(() => {
    if (!actor || isFetching) return;
    const store = useProjectStore.getState();
    // Only fetch if we haven't loaded yet
    if (store.isLoading && store.projects.length === 0) {
      setLoading(true);
      setError(null);
      actor
        .getAllProjects()
        .then((backendProjects) => {
          setProjects(backendProjects.map(backendToFrontend));
        })
        .catch((e: unknown) => {
          const msg =
            e instanceof Error ? e.message : "Failed to load projects";
          setError(msg);
          toast.error(`Failed to load projects: ${msg}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [actor, isFetching, setProjects, setLoading, setError]);

  const addProject = async (
    input: CreateProjectInput,
  ): Promise<SolarProject | null> => {
    if (!actor) {
      toast.error("Not connected to backend");
      return null;
    }
    const pending = calcPending(input);
    const backendInput = frontendToBackendCreate({
      ...input,
      pendingAmount: pending,
    });
    try {
      const created = await actor.createProject(backendInput);
      const fullProject = backendToFrontend(created);
      addProjectLocal(fullProject);
      return fullProject;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create project";
      toast.error(`Failed to save project: ${msg}`);
      return null;
    }
  };

  const updateProject = async (
    id: string,
    updates: Partial<SolarProject>,
  ): Promise<SolarProject | null> => {
    if (!actor) {
      toast.error("Not connected to backend");
      return null;
    }
    const existing = useProjectStore
      .getState()
      .projects.find((p) => p.id === id);
    if (!existing) return null;

    const merged: SolarProject = { ...existing, ...updates };
    merged.pendingAmount = calcPending(merged);

    const backendInput = frontendToBackendUpdate(id, merged);
    try {
      const updated = await actor.updateProject(backendInput);
      if (!updated) {
        toast.error("Project not found on backend");
        return null;
      }
      const fullProject = backendToFrontend(updated);
      updateProjectLocal(id, fullProject);
      return fullProject;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update project";
      toast.error(`Failed to update project: ${msg}`);
      return null;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    if (!actor) {
      toast.error("Not connected to backend");
      return false;
    }
    try {
      const ok = await actor.deleteProject(id);
      if (ok) {
        removeProjectLocal(id);
      } else {
        toast.error("Failed to delete project: project not found");
      }
      return ok;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to delete project";
      toast.error(`Failed to delete project: ${msg}`);
      return false;
    }
  };

  let filtered = projects;

  if (filters?.status && filters.status !== "ALL") {
    filtered = filtered.filter((p) => p.projectStatus === filters.status);
  }

  if (filters?.regionFilter) {
    filtered = filtered.filter((p) => p.region === filters.regionFilter);
  } else if (filters?.region) {
    filtered = filtered.filter((p) =>
      p.region.toLowerCase().includes(filters.region!.toLowerCase()),
    );
  }

  if (filters?.employeeFilter) {
    filtered = filtered.filter(
      (p) => p.employeeName === filters.employeeFilter,
    );
  }

  if (filters?.currentStage) {
    filtered = filtered.filter((p) => p.currentStage === filters.currentStage);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.customerName.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.consumerAcNo?.toLowerCase().includes(q) ||
        p.phoneNumber?.includes(q) ||
        p.employeeName?.toLowerCase().includes(q) ||
        p.freelancerName?.toLowerCase().includes(q),
    );
  }

  const stats = {
    total: filtered.length,
    open: filtered.filter((p) => p.projectStatus === "OPEN").length,
    ongoing: filtered.filter((p) => p.projectStatus === "ONGOING").length,
    closed: filtered.filter((p) => p.projectStatus === "CLOSED").length,
    reject: filtered.filter((p) => p.projectStatus === "REJECT").length,
    totalKw: filtered.reduce((sum, p) => sum + safeNumCalc(p.kw), 0),
    // Always recalculate from payment fields so stats are accurate even if
    // the stored pendingAmount field is stale (e.g. from an old import)
    pendingAmount: filtered.reduce((sum, p) => sum + calcPending(p), 0),
  };

  return {
    projects: filtered,
    allProjects: projects,
    stats,
    isLoading,
    error,
    createProject: addProject,
    updateProject,
    deleteProject,
    uniqueEmployeeNames: employeeNameOptions,
    employeeNameOptions,
    freelancerNameOptions,
    addEmployeeNameOption,
    addFreelancerNameOption,
    refetch: () => {
      if (actor) {
        setLoading(true);
        actor
          .getAllProjects()
          .then((bp) => setProjects(bp.map(backendToFrontend)))
          .catch((e: unknown) => {
            const msg = e instanceof Error ? e.message : "Failed to refresh";
            toast.error(msg);
          })
          .finally(() => setLoading(false));
      }
    },
  };
}

export function useProjectById(id: string | null): SolarProject | undefined {
  const { projects } = useProjectStore();
  return id ? projects.find((p) => p.id === id) : undefined;
}

export type { ProjectStage, ProjectStatus };
