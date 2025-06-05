"use client";
import { useState, useEffect } from "react";
import { Grievance } from "@/utils/types";
import { GrievanceCard } from "@/components/GrievanceCard";
import { Pagination } from "@/components/Pagination";
import { Loader2, Filter, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TrackGrievancePage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Fetch grievances from our API route
  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
          status: statusFilter,
          priority: priorityFilter
        });
        
        const response = await fetch(`/api/grievances?${queryParams}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setGrievances(data.grievances);
        setPagination(data.pagination);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch grievances:", error);
        setError("Failed to load grievances. Please try again later.");
        setGrievances([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, [currentPage, statusFilter, priorityFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePriorityFilterChange = (priority: string) => {
    setPriorityFilter(priority);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Track Your Grievances</h1>

      {/* Grievance count and filters */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-600">
          {pagination && (
            <>
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} grievances
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 px-3 py-2 h-10 hover:bg-gray-100">
                <span className="font-medium">Status: {statusFilter === "all" ? "All" : statusFilter}</span>
                <Filter className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("all")}>
                  <Check className={`mr-2 h-4 w-4 ${statusFilter === "all" ? "opacity-100" : "opacity-0"}`} />
                  All statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("Active")}>
                  <Check className={`mr-2 h-4 w-4 ${statusFilter === "Active" ? "opacity-100" : "opacity-0"}`} />
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("Pending")}>
                  <Check className={`mr-2 h-4 w-4 ${statusFilter === "Pending" ? "opacity-100" : "opacity-0"}`} />
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("Closed with resolution")}>
                  <Check className={`mr-2 h-4 w-4 ${statusFilter === "Closed with resolution" ? "opacity-100" : "opacity-0"}`} />
                  Resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("Closed without resolution")}>
                  <Check className={`mr-2 h-4 w-4 ${statusFilter === "Closed without resolution" ? "opacity-100" : "opacity-0"}`} />
                  Unresolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("Tender Issued")}>
                  <Check className={`mr-2 h-4 w-4 ${statusFilter === "Tender Issued" ? "opacity-100" : "opacity-0"}`} />
                  Others
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 px-3 py-2 h-10 hover:bg-gray-100">
                <span className="font-medium">Priority: {priorityFilter === "all" ? "All" : priorityFilter}</span>
                <Filter className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handlePriorityFilterChange("all")}>
                  <Check className={`mr-2 h-4 w-4 ${priorityFilter === "all" ? "opacity-100" : "opacity-0"}`} />
                  All priorities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityFilterChange("high")}>
                  <Check className={`mr-2 h-4 w-4 ${priorityFilter === "high" ? "opacity-100" : "opacity-0"}`} />
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityFilterChange("medium")}>
                  <Check className={`mr-2 h-4 w-4 ${priorityFilter === "medium" ? "opacity-100" : "opacity-0"}`} />
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityFilterChange("low")}>
                  <Check className={`mr-2 h-4 w-4 ${priorityFilter === "low" ? "opacity-100" : "opacity-0"}`} />
                  Low
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading grievances...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : grievances.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No grievances found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {grievances.map((grievance: Grievance) => (
              <GrievanceCard key={grievance.id} grievance={grievance} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
