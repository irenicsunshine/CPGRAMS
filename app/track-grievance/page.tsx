import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Mock data - replace with actual database call in production
const MOCK_DATA = {
  status: "success",
  user_id: "rec_d0jieo7jkah57cl384i0",
  grievances: [
    {
      category: "General",
      created_at: "2025-05-23T05:31:40.547Z",
      description:
        "The construction project sanctioned by the Air Force in March 2022 with an estimated cost of ₹48 crore, was scheduled for completion by December 2023. However, as of May 2025, only 60% of the work has been completed. Personnel continue to face housing shortages, and the existing quarters are in a dilapidated condition.",
      grievance_received_date: "2025-05-23T05:31:40.547Z",
      id: "rec_d0o0gf5ed0mvjr6lemt0",
      priority: "medium",
      reformed_flag: false,
      status: "pending",
      updated_at: "2025-05-23T05:31:40.547Z",
    },
    {
      category: "Air Force",
      cpgrams_category: "Air Force",
      created_at: "2025-05-23T10:29:25.78Z",
      description:
        "There was a construction project sanctioned by the Air Force in March 2022, with an estimated cost of ₹48 crore and a scheduled completion date of December 2023. However, as of May 2025, only 60% of the work has been completed. Personnel continue to face housing shortages, and the existing quarters are in a dilapidated condition.",
      grievance_received_date: "2025-05-23T10:29:25.78Z",
      id: "rec_d0o4s19u3hmgfo4h5img",
      priority: "high",
      reformed_flag: false,
      status: "pending",
      title: "Delay in Air Force Construction Project and Housing Shortage",
      updated_at: "2025-05-23T10:29:25.78Z",
    },
  ],
  total: 2,
};

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

export default async function TrackGrievancePage() {
  // In a real app, you would fetch this data from your database
  const { grievances } = MOCK_DATA;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Track Your Grievances</h1>

      {grievances.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No grievances found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {grievances.map((grievance) => (
            <Card key={grievance.id} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg line-clamp-2">
                      {grievance.title ||
                        `Grievance #${grievance.id.slice(-6)}`}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {format(new Date(grievance.created_at), "PPpp")}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      priorityColors[grievance.priority] ||
                      "bg-gray-100 text-gray-800"
                    } capitalize`}
                  >
                    {grievance.priority} priority
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Category:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {grievance.cpgrams_category || grievance.category}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {grievance.description}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <Badge
                  variant={
                    grievance.status === "resolved" ? "default" : "secondary"
                  }
                >
                  {grievance.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  Updated {format(new Date(grievance.updated_at), "PPp")}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
