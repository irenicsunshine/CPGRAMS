"use client";
import { useState, useEffect } from "react";
import { Grievance } from "@/utils/types";
import { GrievanceCard } from "@/components/GrievanceCard";
import { Pagination } from "@/components/Pagination";
import { Loader2 } from "lucide-react";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TrackGrievancePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch grievances from our API route
  useEffect(() => {
    const fetchGrievances = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/grievances?page=${currentPage}&limit=10&status=${statusFilter}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setGrievances(data.grievances);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch grievances:", err);
        setError("Failed to load grievances. Please try again later.");
        setGrievances([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievances();
  }, [currentPage, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filter by:</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Closed with resolution">Resolved</option>
            <option value="Closed without resolution">Unresolved</option>
            <option value="Tender Issued">Others</option>
          </select>
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
