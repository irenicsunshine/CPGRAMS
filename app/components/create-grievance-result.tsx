import React from "react";

interface CreateGrievanceResultProps {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  cpgrams_category?: string;
  priority?: string;
  status?: string;
  created_at?: string;
  [key: string]: any; // For any additional properties
}

export const CreateGrievanceResult: React.FC<CreateGrievanceResultProps> = ({
  id,
  title,
  description,
  category,
  cpgrams_category,
  priority,
  status,
  created_at,
  ...rest
}) => {

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-2">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        Grievance Created Successfully
      </h3>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex">
          <span className="font-medium text-green-700 w-32">ID:</span>
          <span className="text-gray-800">{id || "N/A"}</span>
        </div>
        <div className="flex">
          <span className="font-medium text-green-700 w-32">Title:</span>
          <span className="text-gray-800">{title || "N/A"}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-green-700 mb-1">Description:</span>
          <p className="text-gray-800 bg-white p-2 rounded border border-green-100 text-sm">
            {description || "N/A"}
          </p>
        </div>
        <div className="flex">
          <span className="font-medium text-green-700 w-32">
            CPGRAMS Category:
          </span>
          <span className="text-gray-800">{cpgrams_category || "N/A"}</span>
        </div>
        <div className="flex">
          <span className="font-medium text-green-700 w-32">Priority:</span>
          <span
            className={`font-medium ${
              priority === "high"
                ? "text-red-600"
                : priority === "medium"
                ? "text-yellow-600"
                : "text-blue-600"
            }`}
          >
            {priority ? priority.toUpperCase() : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};
