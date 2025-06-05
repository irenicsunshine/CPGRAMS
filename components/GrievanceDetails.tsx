"use client";
import { Grievance } from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Download } from "lucide-react";

interface GrievanceDetailsProps {
  grievance: Grievance;
}

export function GrievanceDetails({ grievance }: GrievanceDetailsProps) {
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .grievance-details-container,
          .grievance-details-container * {
            visibility: visible;
          }

          .grievance-details-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          .print-header {
            margin-bottom: 2rem;
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 1rem;
          }

          .print-footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
            text-align: center;
          }

          /* Ensure colors print correctly */
          .status-active {
            background-color: #dcfce7 !important;
            color: #166534 !important;
          }

          .status-pending {
            background-color: #fef3c7 !important;
            color: #92400e !important;
          }

          .status-resolved {
            background-color: #dbeafe !important;
            color: #1e40af !important;
          }

          .priority-high {
            background-color: #fee2e2 !important;
            color: #991b1b !important;
          }

          .priority-medium {
            background-color: #fef3c7 !important;
            color: #92400e !important;
          }

          .priority-low {
            background-color: #dcfce7 !important;
            color: #166534 !important;
          }
        }
      `}</style>

      <div className="grievance-details-container bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with status and download button */}
        <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Grievance Details</h1>
            <div className="flex items-center gap-3">
              <Badge
                className={`px-3 py-1 text-sm ${
                  grievance.status === "active"
                    ? "bg-green-100 text-green-800 status-active"
                    : grievance.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 status-pending"
                    : grievance.status === "resolved"
                    ? "bg-blue-100 text-blue-800 status-resolved"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {grievance.status
                  ? grievance.status.charAt(0).toUpperCase() +
                    grievance.status.slice(1)
                  : "Unknown"}
              </Badge>
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 no-print hover:bg-gray-100"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* PDF Header - only shows when printing */}
          <div className="hidden print-only print-header">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Grievance Filing Proof
            </h1>
            <p className="text-sm text-gray-600 mb-2">
              This document serves as proof of grievance filing
            </p>
            <p className="text-xs text-gray-500">
              Generated on: {format(new Date(), "d MMMM yyyy 'at' h:mm a")}
            </p>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-lg font-bold">
              {grievance.title ||
                (grievance.id
                  ? `Grievance #${grievance.id.slice(-6)}`
                  : "Grievance")}
            </h2>
          </div>

          {/* Meta information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Filed on</p>
              <p className="font-medium">
                {grievance.created_at
                  ? format(new Date(grievance.created_at), "d MMMM yyyy")
                  : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Priority</p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  grievance.priority === "high"
                    ? "bg-red-100 text-red-800 priority-high"
                    : grievance.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800 priority-medium"
                    : "bg-green-100 text-green-800 priority-low"
                }`}
              >
                {grievance.priority || "N/A"}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Category</p>
              <p className="font-medium">{grievance.category || "N/A"}</p>
            </div>
          </div>

          <Separator />

          {/* CPGRAMS Category */}
          {grievance.cpgrams_category && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                CPGRAMS Category
              </h3>
              <p className="text-gray-700 pl-4 border-l-4 border-purple-200">
                {grievance.cpgrams_category}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3">
              Grievance Details
            </h3>
            <div className="space-y-4">
              {grievance.description &&
                grievance.description.split("\n\n").map((section, index) => {
                  if (!section) return null;

                  const sectionParts = section.split(":\n");
                  const sectionTitle = sectionParts[0];
                  const sectionContent = sectionParts[1];

                  if (!sectionContent) {
                    return (
                      <p
                        key={index}
                        className="text-gray-700 whitespace-pre-wrap"
                      >
                        {section}
                      </p>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className="border-l-4 border-blue-200 pl-4"
                    >
                      <h4 className="font-medium text-gray-800 mb-2">
                        {sectionTitle}
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {sectionContent}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Last updated */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Last updated:{" "}
              <span className="font-medium text-gray-900">
                {grievance.updated_at
                  ? format(
                      new Date(grievance.updated_at),
                      "d MMMM yyyy 'at' h:mm a"
                    )
                  : "N/A"}
              </span>
            </p>
          </div>

          {/* PDF Footer - only shows when printing */}
          <div className="hidden print-only print-footer">
            <p className="text-xs text-gray-500 mb-1">
              This is an automatically generated document from the Grievance
              Portal
            </p>
            <p className="text-xs text-gray-400">
              Document ID: {grievance.id || "N/A"}
            </p>
            <p className="text-xs text-gray-400">
              Portal: Grievance Management System
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
