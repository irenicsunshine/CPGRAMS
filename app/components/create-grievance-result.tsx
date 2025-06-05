import React, { useRef } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  // const generatePDF = () => {
  //   console.log("generatePDF");
  // };

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
    <Card className="border-slate-100 overflow-hidden">
      <CardHeader className="border-b border-slate-100 flex-row items-center gap-3 pb-4">
        <CardTitle className="text-xl">
          Grievance Created Successfully
        </CardTitle>
      </CardHeader>

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
              <span className="text-gray-800">{cpgrams_category || "N/A"}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium text-gray-600 w-32 mb-1 sm:mb-0">
                Priority:
              </span>
              <Badge variant={getPriorityVariant(priority)}>
                {priority ? priority.toUpperCase() : "N/A"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Footer with Download Button */}
      {/* <CardFooter className="border-t justify-end">
        <Button onClick={generatePDF}>
          <Download size={18} />
          Download PDF
        </Button>
      </CardFooter> */}
    </Card>
  );
};