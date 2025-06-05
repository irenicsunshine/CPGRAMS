"use client";
import { Grievance } from "@/utils/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface GrievanceDetailsProps {
  grievance: Grievance;
}

export function GrievanceDetails({ grievance }: GrievanceDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with status */}
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Grievance Details</h1>
          <Badge
            className={`px-3 py-1 text-sm ${
              grievance.status === "active"
                ? "bg-green-100 text-green-800"
                : grievance.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : grievance.status === "resolved"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {grievance.status
              ? grievance.status.charAt(0).toUpperCase() +
                grievance.status.slice(1)
              : "Unknown"}
          </Badge>
        </div>
      </div>

      {/* Title and basic info */}
      <div className="px-6 pt-4 pb-2">
        <h2 className="text-lg font-bold mb-2">
          {grievance.title ||
            (grievance.id
              ? `Grievance #${grievance.id.slice(-6)}`
              : "Grievance")}
        </h2>
      </div>

      {/* Grievance details */}
      <div className="px-6 pb-6">
        {/* Meta information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-md border border-gray-100">
          <div className="flex flex-col">
            <p className="text-sm text-gray-500 mb-1">Filed on</p>
            <p className="font-medium">
              {grievance.created_at
                ? format(new Date(grievance.created_at), "d MMMM yyyy")
                : "N/A"}
            </p>
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-gray-500 mb-1">Priority</p>
            <p className="font-medium capitalize">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  grievance.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : grievance.priority === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {grievance.priority || "N/A"}
              </span>
            </p>
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-gray-500 mb-1">Category</p>
            <p className="font-medium">{grievance.category || "N/A"}</p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* CPGRAMS Category */}
        {grievance.cpgrams_category && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3 flex items-center">
              <span className="bg-purple-100 p-1 rounded mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              CPGRAMS Category
            </h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <p className="text-gray-700">{grievance.cpgrams_category}</p>
            </div>
          </div>
        )}

        {/* Description - Parse and format structured content */}
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3 flex items-center">
            <span className="bg-blue-100 p-1 rounded mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-700"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            Grievance Details
          </h2>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
            {grievance.description &&
              grievance.description.split("\n\n").map((section, index) => {
                if (!section) return null;

                const sectionParts = section.split(":\n");
                const sectionTitle = sectionParts[0];
                const sectionContent = sectionParts[1];

                if (!sectionContent) {
                  // If there's no clear title-content split, just render the text
                  return (
                    <p key={index} className="mb-4 whitespace-pre-wrap">
                      {section}
                    </p>
                  );
                }

                return (
                  <div
                    key={index}
                    className="mb-6 last:mb-0 bg-white p-3 rounded-md border border-gray-100"
                  >
                    <h3 className="font-medium text-gray-800 mb-2 pb-2 border-b border-gray-100">
                      {sectionTitle}
                    </h3>
                    <div className="pl-4 border-l-2 border-blue-200 whitespace-pre-wrap text-gray-700">
                      {sectionContent}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Last updated information */}
        <div className="mt-8 p-3 bg-gray-50 rounded-md border border-gray-100 flex items-center">
          <div className="bg-gray-200 p-1.5 rounded-full mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-600">
            Last updated:{" "}
            <span className="font-medium">
              {grievance.updated_at
                ? format(
                    new Date(grievance.updated_at),
                    "d MMMM yyyy 'at' h:mm a"
                  )
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
