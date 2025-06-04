import React from "react";

interface ClassifyGrievanceResultProps {
  categories?: Array<{
    category: string;
    concat_grievance_category: string;
    content: string;
    department_code: string;
    department_name: string;
    description_of_grievance_category: string;
    gpt_form_field_generation: string;
    id: string;
    rank: number;
    rerank_score: number;
    score: number | null;
    sub_category_1: string;
    sub_category_2: string;
    sub_category_3: string;
    sub_category_4: string;
    sub_category_5: string;
    sub_category_6: string;
  }>;
  [key: string]: unknown; // For any additional properties
}

export const ClassifyGrievanceResult: React.FC<
  ClassifyGrievanceResultProps
> = ({ categories = [] }) => {
  // If no categories or empty array, show a message
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-2">
        <p className="text-gray-800">No classification results available</p>
      </div>
    );
  }

  // Sort categories by rank or rerank_score
  const sortedCategories = [...categories].sort(
    (a, b) => a.rank - b.rank || b.rerank_score - a.rerank_score
  );
  const topCategory = sortedCategories[0];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-2">
      <div className="grid grid-cols-1 gap-3">
        {/* Show CPGRAMS category if available */}
        {topCategory.concat_grievance_category && (
          <div className="flex flex-col">
            <span className="font-medium text-blue-700 mb-1">
              CPGRAMS Category:
            </span>
            <p className="text-gray-800 bg-white p-2 rounded border border-blue-100 text-sm">
              {topCategory.concat_grievance_category}
            </p>
          </div>
        )}

        {/* Show form fields if available */}
        {/* {topCategory.gpt_form_field_generation && (
          <div className="flex flex-col mt-2">
            <span className="font-medium text-blue-700 mb-1">
              Required Information:
            </span>
            <div className="bg-white p-3 rounded border border-blue-100">
              {(() => {
                try {
                  const formFields = JSON.parse(
                    `[${topCategory.gpt_form_field_generation}]`
                  );
                  return (
                    <div className="grid grid-cols-1 gap-2">
                      {formFields.map((field: { field_name: string; mandatory?: boolean; description?: string }, index: number) => (
                        <div
                          key={index}
                          className="border-b border-blue-50 pb-2 last:border-0 last:pb-0"
                        >
                          <p className="font-medium text-blue-600">
                            {field.field_name} {field.mandatory ? "*" : ""}
                          </p>
                          <p className="text-sm text-gray-600">
                            {field.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                } catch {
                  return (
                    <p className="text-sm text-gray-600">
                      Form field information available but could not be parsed.
                    </p>
                  );
                }
              })()}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};
