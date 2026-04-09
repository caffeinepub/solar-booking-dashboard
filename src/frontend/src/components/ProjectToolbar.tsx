import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ProjectFilters,
  ProjectStage,
  ProjectStatus,
} from "@/types/project";
import { PROJECT_STAGES } from "@/types/project";
import { Search } from "lucide-react";

interface StatusFilter {
  label: string;
  value: ProjectStatus | "ALL";
}

interface ProjectToolbarProps {
  filters: ProjectFilters;
  statusFilters: StatusFilter[];
  onStatusChange: (status: ProjectStatus | "ALL") => void;
  onSearchChange: (search: string) => void;
  onRegionFilterChange: (region: string) => void;
  onEmployeeFilterChange: (name: string) => void;
  onStageFilterChange: (stage: ProjectStage | undefined) => void;
  uniqueEmployeeNames: string[];
  totalShown: number;
  totalAll: number;
}

const REGIONS = ["TPCODL", "TPNODL", "TPSODL", "TPWODL"];

export function ProjectToolbar({
  filters,
  statusFilters,
  onStatusChange,
  onSearchChange,
  onRegionFilterChange,
  onEmployeeFilterChange,
  onStageFilterChange,
  uniqueEmployeeNames,
  totalShown,
  totalAll,
}: ProjectToolbarProps) {
  return (
    <div
      className="px-4 py-3 border-b border-border flex flex-col gap-3"
      data-ocid="project-toolbar"
    >
      {/* Row 1: Status filter tabs */}
      <div className="flex gap-1 flex-wrap" data-ocid="status-filter-tabs">
        {statusFilters.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatusChange(value)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-smooth ${
              filters.status === value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            }`}
            data-ocid={`filter-${value.toLowerCase()}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Row 2: Advanced filters + search */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Region Filter */}
        <Select
          value={filters.regionFilter ?? ""}
          onValueChange={(v) => onRegionFilterChange(v === "_all" ? "" : v)}
        >
          <SelectTrigger
            className="h-8 text-xs w-36"
            data-ocid="filter-region-select"
          >
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all" className="text-xs">
              All Regions
            </SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r} className="text-xs">
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Employee / Freelancer Filter */}
        <Select
          value={filters.employeeFilter ?? ""}
          onValueChange={(v) => onEmployeeFilterChange(v === "_all" ? "" : v)}
        >
          <SelectTrigger
            className="h-8 text-xs w-44"
            data-ocid="filter-employee-select"
          >
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all" className="text-xs">
              All Employees
            </SelectItem>
            {uniqueEmployeeNames.map((name) => (
              <SelectItem key={name} value={name} className="text-xs">
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Stage Filter */}
        <Select
          value={filters.currentStage ?? ""}
          onValueChange={(v) =>
            onStageFilterChange(v === "_all" ? undefined : (v as ProjectStage))
          }
        >
          <SelectTrigger
            className="h-8 text-xs w-40"
            data-ocid="filter-stage-select"
          >
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all" className="text-xs">
              All Stages
            </SelectItem>
            {PROJECT_STAGES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {totalShown === totalAll
              ? `${totalAll} projects`
              : `${totalShown} of ${totalAll}`}
          </span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search name, district, AC no…"
              className="pl-8 h-8 text-xs w-48 sm:w-56"
              value={filters.search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              data-ocid="search-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
