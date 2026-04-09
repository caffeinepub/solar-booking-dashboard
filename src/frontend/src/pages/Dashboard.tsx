import { AddEditProjectModal } from "@/components/AddEditProjectModal";
import { BulkImportModal } from "@/components/BulkImportModal";
import { ProjectDrawer } from "@/components/ProjectDrawer";
import { ProjectTableRow } from "@/components/ProjectTableRow";
import { ProjectToolbar } from "@/components/ProjectToolbar";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { UserManagementModal } from "@/components/UserManagementModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import type {
  CreateProjectInput,
  ProjectFilters,
  ProjectStage,
  ProjectStatus,
  SolarProject,
} from "@/types/project";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  LogOut,
  Settings,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_FILTERS: { label: string; value: ProjectStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Closed", value: "CLOSED" },
  { label: "Reject", value: "REJECT" },
];

type SortKey =
  | "slNo"
  | "customerName"
  | "region"
  | "district"
  | "kw"
  | "salePrice"
  | "pendingAmount"
  | "bookingAgreementDate";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 15;

function SortIcon({
  col,
  sortKey,
  sortDir,
}: { col: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
  if (sortKey !== col)
    return <ChevronsUpDown className="inline w-3 h-3 ml-0.5 opacity-40" />;
  return sortDir === "asc" ? (
    <ChevronUp className="inline w-3 h-3 ml-0.5" />
  ) : (
    <ChevronDown className="inline w-3 h-3 ml-0.5" />
  );
}

function sortProjects(
  projects: SolarProject[],
  key: SortKey | null,
  dir: SortDir,
): SolarProject[] {
  if (!key) return projects;
  return [...projects].sort((a, b) => {
    const av = a[key] ?? "";
    const bv = b[key] ?? "";
    let cmp = 0;
    if (typeof av === "number" && typeof bv === "number") {
      cmp = av - bv;
    } else {
      cmp = String(av).localeCompare(String(bv));
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

function fmtINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  "full-edit": "bg-accent/10 text-accent border-accent/20",
  "view-only": "bg-muted text-muted-foreground border-border",
};

const TEMPLATE_CSV_HEADERS = [
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
const TEMPLATE_CSV_EXAMPLE = [
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
    TEMPLATE_CSV_HEADERS.join(","),
    TEMPLATE_CSV_EXAMPLE.map((v) => `"${v}"`).join(","),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "solar_projects_template.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { session, logout } = useAuth();
  const canEdit =
    session?.accessLevel === "admin" || session?.accessLevel === "full-edit";
  const isAdmin = session?.accessLevel === "admin";

  const [filters, setFilters] = useState<ProjectFilters>({
    status: "ALL",
    search: "",
    regionFilter: "",
    employeeFilter: "",
    currentStage: undefined,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editProject, setEditProject] = useState<SolarProject | null>(null);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [manageUsersOpen, setManageUsersOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const {
    projects,
    stats,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    uniqueEmployeeNames,
    employeeNameOptions,
    freelancerNameOptions,
    addEmployeeNameOption,
    addFreelancerNameOption,
    allProjects,
  } = useProjects(filters);

  const nextSlNo = (allProjects?.length ?? 0) + 1;

  const handleSort = (col: SortKey) => {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = useMemo(
    () => sortProjects(projects, sortKey, sortDir),
    [projects, sortKey, sortDir],
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page],
  );

  const handleStatusFilter = (status: ProjectStatus | "ALL") => {
    setFilters((f) => ({ ...f, status }));
    setPage(1);
  };

  const handleSearch = (search: string) => {
    setFilters((f) => ({ ...f, search }));
    setPage(1);
  };

  const handleRegionFilter = (regionFilter: string) => {
    setFilters((f) => ({ ...f, regionFilter }));
    setPage(1);
  };

  const handleEmployeeFilter = (employeeFilter: string) => {
    setFilters((f) => ({ ...f, employeeFilter }));
    setPage(1);
  };

  const handleStageFilter = (stage: ProjectStage | undefined) => {
    setFilters((f) => ({ ...f, currentStage: stage }));
    setPage(1);
  };

  const thClass =
    "px-3 py-2 cursor-pointer select-none hover:bg-muted/80 transition-colors duration-150";

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      data-ocid="dashboard-root"
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 bg-card border-b border-border shadow-sm"
        data-ocid="nav"
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-accent-foreground fill-current"
                aria-label="Solar"
              >
                <title>Solar</title>
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" opacity=".3" />
                <path d="M12 2L3 7l9 5 9-5-9-5z" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <div>
              <span className="font-display font-semibold text-foreground text-sm leading-none block">
                Shree Adishakti Solar
              </span>
              <span className="text-muted-foreground text-xs leading-none">
                Booking Dashboard
              </span>
            </div>
          </div>

          {/* Right side: user info + actions */}
          <div className="flex items-center gap-2">
            {/* User info */}
            {session && (
              <div className="flex items-center gap-2 mr-1">
                <span className="text-xs text-foreground font-medium hidden sm:block">
                  {session.username}
                </span>
                <span
                  className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_BADGE[session.accessLevel] ?? ROLE_BADGE["view-only"]}`}
                >
                  {session.accessLevel}
                </span>
              </div>
            )}

            {/* Admin: Manage Users */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => setManageUsersOpen(true)}
                data-ocid="manage-users-btn"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Manage Users</span>
              </Button>
            )}

            {/* Edit users: Download Template + Import + Add Project */}
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={downloadTemplate}
                  data-ocid="download-template-btn"
                  title="Download CSV Template"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Template</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => setImportOpen(true)}
                  data-ocid="bulk-import-btn"
                  title="Bulk Import Projects"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Import</span>
                </Button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-md border border-border hover:bg-muted/80 transition-smooth"
                  onClick={() => setAddOpen(true)}
                  data-ocid="add-project-btn"
                >
                  + New Project
                </button>
              </>
            )}

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => logout()}
              data-ocid="logout-btn"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
          <StatCard
            label="Total Projects"
            value={stats.total}
            color="foreground"
            data-ocid="stat-total"
          />
          <StatCard
            label="Open"
            value={stats.open}
            color="blue"
            data-ocid="stat-open"
          />
          <StatCard
            label="Ongoing"
            value={stats.ongoing}
            color="amber"
            data-ocid="stat-ongoing"
          />
          <StatCard
            label="Closed"
            value={stats.closed}
            color="green"
            data-ocid="stat-closed"
          />
          <StatCard
            label="Rejected"
            value={stats.reject}
            color="red"
            data-ocid="stat-reject"
          />
          <StatCard
            label="Total kW"
            value={`${stats.totalKw.toFixed(1)}`}
            color="accent"
            data-ocid="stat-kw"
          />
          <StatCard
            label="Pending Amount"
            value={fmtINR(stats.pendingAmount)}
            color="pending"
            data-ocid="stat-pending-amount"
          />
        </div>

        {/* Active filter chips */}
        {(filters.regionFilter ||
          filters.employeeFilter ||
          filters.currentStage) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {filters.regionFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                Region: {filters.regionFilter}
                <button
                  type="button"
                  className="ml-0.5 hover:text-primary/70"
                  onClick={() => handleRegionFilter("")}
                  aria-label="Clear region filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.employeeFilter && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
                Employee: {filters.employeeFilter}
                <button
                  type="button"
                  className="ml-0.5 hover:text-accent/70"
                  onClick={() => handleEmployeeFilter("")}
                  aria-label="Clear employee filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.currentStage && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-secondary/60 text-foreground border border-border">
                Stage: {filters.currentStage}
                <button
                  type="button"
                  className="ml-0.5 hover:text-muted-foreground"
                  onClick={() => handleStageFilter(undefined)}
                  aria-label="Clear stage filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Table Card */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <ProjectToolbar
            filters={filters}
            statusFilters={STATUS_FILTERS}
            onStatusChange={handleStatusFilter}
            onSearchChange={handleSearch}
            onRegionFilterChange={handleRegionFilter}
            onEmployeeFilterChange={handleEmployeeFilter}
            onStageFilterChange={handleStageFilter}
            uniqueEmployeeNames={uniqueEmployeeNames}
            totalShown={projects.length}
            totalAll={stats.total}
          />

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-ocid="projects-table">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
                  <th
                    scope="col"
                    className={`${thClass} text-left w-8`}
                    onClick={() => handleSort("slNo")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && handleSort("slNo")
                    }
                    data-ocid="sort-slno"
                  >
                    #<SortIcon col="slNo" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th
                    scope="col"
                    className={`${thClass} text-left min-w-[160px]`}
                    onClick={() => handleSort("customerName")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      handleSort("customerName")
                    }
                    data-ocid="sort-customer"
                  >
                    Customer
                    <SortIcon
                      col="customerName"
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </th>
                  <th
                    scope="col"
                    className={`${thClass} text-left min-w-[100px]`}
                    onClick={() => handleSort("region")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      handleSort("region")
                    }
                    data-ocid="sort-region"
                  >
                    Region
                    <SortIcon
                      col="region"
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </th>
                  <th
                    scope="col"
                    className={`${thClass} text-left min-w-[110px]`}
                    onClick={() => handleSort("district")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      handleSort("district")
                    }
                    data-ocid="sort-district"
                  >
                    District
                    <SortIcon
                      col="district"
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </th>
                  <th scope="col" className="px-3 py-2 text-left min-w-[130px]">
                    Lead Source
                  </th>
                  <th
                    scope="col"
                    className={`${thClass} text-center min-w-[80px]`}
                    onClick={() => handleSort("kw")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") && handleSort("kw")
                    }
                    data-ocid="sort-kw"
                  >
                    kW
                    <SortIcon col="kw" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center min-w-[100px]"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center min-w-[130px]"
                    data-ocid="col-completed-stage"
                  >
                    Completed Stage
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-center min-w-[120px]"
                    data-ocid="col-next-stage"
                  >
                    Next Stage
                  </th>
                  <th
                    scope="col"
                    className={`${thClass} text-right min-w-[110px]`}
                    onClick={() => handleSort("salePrice")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      handleSort("salePrice")
                    }
                    data-ocid="sort-saleprice"
                  >
                    Sale Price
                    <SortIcon
                      col="salePrice"
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </th>
                  <th
                    scope="col"
                    className={`${thClass} text-right min-w-[110px]`}
                    onClick={() => handleSort("pendingAmount")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      handleSort("pendingAmount")
                    }
                    data-ocid="sort-pending"
                  >
                    Pending
                    <SortIcon
                      col="pendingAmount"
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </th>
                  <th
                    scope="col"
                    className={`${thClass} text-left min-w-[110px]`}
                    onClick={() => handleSort("bookingAgreementDate")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      handleSort("bookingAgreementDate")
                    }
                    data-ocid="sort-date"
                  >
                    Booking Date
                    <SortIcon
                      col="bookingAgreementDate"
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  </th>
                  {canEdit && (
                    <th
                      scope="col"
                      className="px-3 py-2 text-left min-w-[80px]"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no identity
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: canEdit ? 13 : 12 }).map((_, j) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells have no identity
                        <td key={j} className="px-3 py-2">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canEdit ? 13 : 12}
                      className="px-4 py-12 text-center text-muted-foreground"
                      data-ocid="empty-state"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="w-8 h-8 opacity-30"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <title>No results</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="text-sm font-medium">No projects found</p>
                        <p className="text-xs">
                          Try adjusting your filters
                          {canEdit ? " or add a new project" : ""}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((project) => (
                    <ProjectTableRow
                      key={project.id}
                      project={project}
                      isSelected={selectedId === project.id}
                      canEdit={canEdit}
                      onSelect={() =>
                        setSelectedId(
                          project.id === selectedId ? null : project.id,
                        )
                      }
                      onEdit={(p) => {
                        setEditProject(p);
                      }}
                      onDelete={async (id) => {
                        await deleteProject(id);
                        if (selectedId === id) setSelectedId(null);
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
              <span>
                {sorted.length} results · Page {page} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-40 transition-smooth"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-ocid="pagination-prev"
                >
                  ‹ Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      type="button"
                      className={`px-2 py-1 rounded border transition-smooth ${page === pg ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                      onClick={() => setPage(pg)}
                      data-ocid={`pagination-page-${pg}`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="px-2 py-1 rounded border border-border hover:bg-muted disabled:opacity-40 transition-smooth"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-ocid="pagination-next"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-muted-foreground py-3 border-t border-border bg-muted/20">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </main>

      {/* Detail Drawer */}
      <ProjectDrawer
        projectId={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={canEdit ? (p) => setEditProject(p) : undefined}
        onDelete={
          canEdit
            ? async (id) => {
                await deleteProject(id);
                setSelectedId(null);
              }
            : undefined
        }
        updateProject={canEdit ? updateProject : undefined}
      />

      {/* Add/Edit Project Modal (edit only) */}
      {canEdit && (
        <AddEditProjectModal
          open={addOpen || !!editProject}
          project={editProject}
          onClose={() => {
            setAddOpen(false);
            setEditProject(null);
          }}
          onCreate={createProject}
          onUpdate={updateProject}
          employeeNameOptions={employeeNameOptions}
          freelancerNameOptions={freelancerNameOptions}
          onAddEmployeeName={addEmployeeNameOption}
          onAddFreelancerName={addFreelancerNameOption}
        />
      )}

      {/* User Management Modal (admin only) */}
      {isAdmin && session && (
        <UserManagementModal
          open={manageUsersOpen}
          onClose={() => setManageUsersOpen(false)}
          token={session.token}
          currentUsername={session.username}
        />
      )}

      {/* Bulk Import Modal */}
      {canEdit && (
        <BulkImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onImport={async (
            importList: CreateProjectInput[],
          ): Promise<{ added: number; skipped: number }> => {
            let added = 0;
            let skipped = 0;
            for (const p of importList) {
              const isDuplicate = allProjects.some(
                (existing) =>
                  existing.customerName.toLowerCase().trim() ===
                  p.customerName.toLowerCase().trim(),
              );
              if (isDuplicate) {
                skipped++;
              } else {
                const result = await createProject(p);
                if (result) added++;
              }
            }
            return { added, skipped };
          }}
          nextSlNo={nextSlNo}
          existingProjects={allProjects}
        />
      )}
    </div>
  );
}

export { StatusBadge };
