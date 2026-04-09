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

function backendToFrontend(bp: BackendProject): SolarProject {
  return {
    id: bp.id,
    slNo: Number(bp.slNo),
    employeeType: bp.employeeType,
    leadSource: bp.leadSource,
    region: bp.region,
    customerName: bp.customerName,
    projectStatus: mapBackendStatus(bp.projectStatus),
    address: bp.address,
    phoneNumber: bp.phoneNumber,
    consumerAcNo: bp.consumerAcNo,
    kw: bp.kw,
    salePrice: bp.salePrice,
    bookingAmount: bp.bookingAmount,
    bookingAmountDate: bp.bookingAmountDate,
    bookingAgreementDate: bp.bookingAgreementDate,
    signAgreement: bp.signAgreement,
    digitalApprovedLetter: bp.digitalApprovedLetter,
    financeAmount1: bp.financeAmount1,
    financeDate1: bp.financeDate1,
    financeAmount2: bp.financeAmount2,
    financeDate2: bp.financeDate2,
    cashAmount2: bp.cashAmount2,
    cashAmount2Date: bp.cashAmount2Date,
    materialPurchaseDate: bp.materialPurchaseDate,
    deliveryDate: bp.deliveryDate,
    ewayBillNo: bp.ewayBillNo,
    installationDate: bp.installationDate,
    netMeteringDate: bp.netMeteringDate,
    pendingAmount: bp.pendingAmount,
    subsidyDisbursed: bp.subsidyDisbursed,
    invoiceNo: bp.invoiceNo,
    gstAmount: bp.gstAmount,
    gstFillingMonth: bp.gstFillingMonth,
    remarks: bp.remarks,
    currentStage: bp.currentStage as ProjectStage | undefined,
    district: bp.district,
    employeeName: bp.employeeName,
    freelancerName: bp.freelancerName,
  };
}

function frontendToBackendCreate(
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
    kw: input.kw,
    salePrice: input.salePrice,
    bookingAmount: input.bookingAmount,
    bookingAmountDate: input.bookingAmountDate,
    bookingAgreementDate: input.bookingAgreementDate,
    signAgreement: input.signAgreement,
    digitalApprovedLetter: input.digitalApprovedLetter,
    financeAmount1: input.financeAmount1,
    financeDate1: input.financeDate1,
    financeAmount2: input.financeAmount2,
    financeDate2: input.financeDate2,
    cashAmount2: input.cashAmount2,
    cashAmount2Date: input.cashAmount2Date,
    materialPurchaseDate: input.materialPurchaseDate,
    deliveryDate: input.deliveryDate,
    ewayBillNo: input.ewayBillNo,
    installationDate: input.installationDate,
    netMeteringDate: input.netMeteringDate,
    pendingAmount: input.pendingAmount,
    subsidyDisbursed: input.subsidyDisbursed,
    invoiceNo: input.invoiceNo,
    gstAmount: input.gstAmount,
    gstFillingMonth: input.gstFillingMonth,
    remarks: input.remarks,
    currentStage: input.currentStage,
    district: input.district,
    employeeName: input.employeeName,
    freelancerName: input.freelancerName,
    nextStage: undefined,
    lastPaymentDate: undefined,
  };
}

function frontendToBackendUpdate(
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
    kw: p.kw,
    salePrice: p.salePrice,
    bookingAmount: p.bookingAmount,
    bookingAmountDate: p.bookingAmountDate,
    bookingAgreementDate: p.bookingAgreementDate,
    signAgreement: p.signAgreement,
    digitalApprovedLetter: p.digitalApprovedLetter,
    financeAmount1: p.financeAmount1,
    financeDate1: p.financeDate1,
    financeAmount2: p.financeAmount2,
    financeDate2: p.financeDate2,
    cashAmount2: p.cashAmount2,
    cashAmount2Date: p.cashAmount2Date,
    materialPurchaseDate: p.materialPurchaseDate,
    deliveryDate: p.deliveryDate,
    ewayBillNo: p.ewayBillNo,
    installationDate: p.installationDate,
    netMeteringDate: p.netMeteringDate,
    pendingAmount: p.pendingAmount,
    subsidyDisbursed: p.subsidyDisbursed,
    invoiceNo: p.invoiceNo,
    gstAmount: p.gstAmount,
    gstFillingMonth: p.gstFillingMonth,
    remarks: p.remarks,
    currentStage: p.currentStage,
    district: p.district,
    employeeName: p.employeeName,
    freelancerName: p.freelancerName,
    nextStage: undefined,
    lastPaymentDate: undefined,
  };
}

function calcPending(p: Partial<SolarProject>): number {
  const sale = p.salePrice ?? 0;
  const booking = p.bookingAmount ?? 0;
  const f1 = p.financeAmount1 ?? 0;
  const f2 = p.financeAmount2 ?? 0;
  const cash = p.cashAmount2 ?? 0;
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
    totalKw: filtered.reduce((sum, p) => sum + (p.kw ?? 0), 0),
    pendingAmount: filtered.reduce((sum, p) => sum + (p.pendingAmount ?? 0), 0),
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
