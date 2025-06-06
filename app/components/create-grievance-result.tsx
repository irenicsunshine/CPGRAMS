"use client";
import React, { useRef } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CreateGrievanceResultProps {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  cpgrams_category?: string;
  priority?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown; // For any additional properties
}

export const CreateGrievanceResult: React.FC<CreateGrievanceResultProps> = ({
  id,
  title,
  description,
  cpgrams_category,
  priority,
}) => {
  const grievanceRef = useRef<HTMLDivElement>(null);

  const generatePDF = () => {
    window.print();
  };

  const getPriorityVariant = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .grievance-result-container,
          .grievance-result-container * {
            visibility: visible;
          }

          .grievance-result-container {
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

          /* Priority badge colors */
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

      <Card className="border-slate-100 overflow-hidden grievance-result-container">
        <CardHeader className="border-b border-slate-100 flex-row items-center gap-3 pb-4">
          <CardTitle className="text-xl">
            Grievance Created Successfully
          </CardTitle>
        </CardHeader>

        {/* PDF Header - only shows when printing */}
        <div className="hidden print-only print-header">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Grievance Filing Confirmation
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            This document serves as proof of grievance filing
          </p>
          <p className="text-xs text-gray-500">
            Generated on:{" "}
            {new Date().toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Content */}
        <div ref={grievanceRef}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-gray-600 w-32 mb-1 sm:mb-0">
                  ID:
                </span>
                <code className="font-mono bg-gray-50 px-3 py-1 rounded border border-purple-100">
                  {id || "N/A"}
                </code>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-gray-600 w-32 mb-1 sm:mb-0">
                  Title:
                </span>
                <span className="text-gray-800">{title || "N/A"}</span>
              </div>

              <div className="flex flex-col">
                <span className="font-medium text-gray-600 mb-2">
                  Description:
                </span>
                <div className="text-gray-800 bg-gray-50 p-4 rounded border border-purple-100 text-sm whitespace-pre-wrap">
                  {description || "N/A"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-gray-600 w-32 mb-1 sm:mb-0">
                  Category:
                </span>
                <span className="text-gray-800">
                  {cpgrams_category || "N/A"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-gray-600 w-32 mb-1 sm:mb-0">
                  Priority:
                </span>
                <Badge
                  variant={getPriorityVariant(priority)}
                  className={`${
                    priority?.toLowerCase() === "high"
                      ? "priority-high"
                      : priority?.toLowerCase() === "medium"
                      ? "priority-medium"
                      : "priority-low"
                  }`}
                >
                  {priority ? priority.toUpperCase() : "N/A"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Print footer - only shows when printing */}
        <div className="hidden print-only print-footer">
          <p className="text-sm text-gray-600">
            This is an automatically generated document.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            For any queries, please contact support with reference ID: {id}
          </p>
        </div>

        {/* Footer with Download Button */}
        <CardFooter className="border-t justify-end">
          <Button onClick={generatePDF} className="no-print">
            <Download size={18} />
            Download PDF
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};
