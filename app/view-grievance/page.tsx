"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Grievance } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Activity, FileText } from "lucide-react";
import Link from "next/link";
import { GrievanceDetails } from "@/components/GrievanceDetails";
import { GrievanceTracking } from "@/components/GrievanceTracking";

function GrievancePageContent() {
  const searchParams = useSearchParams();
  const grievanceId = searchParams.get("id");

  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tracking");

  useEffect(() => {
    const fetchGrievanceDetails = async () => {
      if (!grievanceId) {
        setError("No grievance ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/getGrievance/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: grievanceId }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log(data.grievance.grievance);

        setGrievance(data.grievance.grievance);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch grievance details:", error);
        setError("Failed to load grievance details. Please try again later.");
        setGrievance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGrievanceDetails();
  }, [grievanceId]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/track-grievance">
          <Button variant="ghost" className="pl-0 flex items-center gap-2 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
            Back to Grievances
          </Button>
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {/* Grievance details with tabs */}
      {grievance && !loading && !error && (
        <div>
          {/* Header with title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {grievance.title ||
                (grievance.id
                  ? `Grievance #${grievance.id.slice(-6)}`
                  : "Grievance Details")}
            </h1>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="tracking"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="rounded-lg bg-gray-50 p-1 mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="tracking"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">Track Grievance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Grievance Details</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="tracking" className="mt-0">
              <GrievanceTracking grievance={grievance} />
            </TabsContent>

            <TabsContent value="details" className="mt-0">
              <GrievanceDetails grievance={grievance} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

export default function ViewGrievancePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>}>
      <GrievancePageContent />
    </Suspense>
  );
}
