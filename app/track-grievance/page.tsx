"use server";
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
import { Grievance, GrievanceResponse } from "@/utils/types";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

export default async function TrackGrievancePage() {
  const userId = process.env.USER_ID;
  const url = process.env.GRM_API_URL;
  let grievances: Grievance[] = [];

  try {
    const response = await fetch(`${url}/grievances/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.GRM_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data: GrievanceResponse = await response.json();
    grievances = data.grievances || [];
  } catch (err) {
    console.error("Failed to fetch grievances:", err);
  }

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
