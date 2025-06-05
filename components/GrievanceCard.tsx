import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Grievance } from "@/utils/types";
import { PackageCheck } from "lucide-react";
import Link from "next/link";

interface GrievanceCardProps {
  grievance: Grievance;
}

export function GrievanceCard({ grievance }: GrievanceCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header Section */}
      <div className="grid grid-cols-3 border-b p-4 text-sm">
        <div>
          <div className="text-gray-500 font-medium">GRIEVANCE FILED</div>
          <div>{format(new Date(grievance.created_at), "d MMM yyyy")}</div>
        </div>

        <div>
          <div className="text-gray-500 font-medium">PRIORITY</div>
          <div className="capitalize">{grievance.priority}</div>
        </div>

        <div>
          <PackageCheck className="h-5 w-5 text-green-600" />
          <span className="font-medium text-lg">{grievance.status}</span>
        </div>
      </div>

      {/* Grievance Details Section */}
      <div className="p-4 flex">
        {/* Left side (90%) */}
        <div className="w-[90%] pr-2">
          <h3 className="font-medium text-lg mb-1">
            {grievance.title || `Grievance #${grievance.id.slice(-6)}`}
          </h3>

          <div className="mb-2">
            <Badge variant="outline" className="mr-2 bg-gray-100">
              {
                (grievance.cpgrams_category || grievance.category).split(
                  " > "
                )[0]
              }
            </Badge>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {grievance.description}
          </p>
        </div>

        {/* Right side (10%) with View more button */}
        <div className="w-[10%] flex items-center justify-center">
          <Link
            href={`/view-grievance?id=${grievance.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex flex-col items-center justify-center"
          >
            <span>View</span>
            <span>more</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
