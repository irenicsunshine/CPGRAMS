"use client";
import { Grievance } from "@/utils/types";
import { format, addDays } from "date-fns";
import {
  CheckCircle2,
  Clock,
  User,
  Search,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface GrievanceTrackingProps {
  grievance: Grievance;
}

type StepStatus = "complete" | "current" | "upcoming" | "pending";

interface TrackingStep {
  id: number;
  name: string;
  description: string;
  date: string;
  status: StepStatus;
  icon: LucideIcon;
}

// Helper function to determine the estimated resolution date based on priority
const getEstimatedResolutionDate = (grievance: Grievance) => {
  const createdDate = new Date(grievance.created_at || new Date());

  // Different resolution times based on priority
  switch (grievance.priority) {
    case "high":
      return addDays(createdDate, 7); // 7 days for high priority
    case "medium":
      return addDays(createdDate, 14); // 14 days for medium priority
    case "low":
      return addDays(createdDate, 21); // 21 days for low priority
    default:
      return addDays(createdDate, 14); // Default to 14 days
  }
};

// Helper to determine the current step based on status
const getCurrentStep = (status: string | undefined): number => {
  switch (status?.toLowerCase()) {
    case "resolved":
      return 7;
    case "in_progress":
    case "in progress":
      return 6;
    case "assigned":
      return 3;
    case "pending":
    case "new":
    default:
      return 1;
  }
};

export function GrievanceTracking({ grievance }: GrievanceTrackingProps) {
  const estimatedResolutionDate = getEstimatedResolutionDate(grievance);
  const currentStep = getCurrentStep(grievance.status);

  // Debug logs
  console.log("Current step:", currentStep);
  console.log("Grievance status:", grievance.status);

  // Define tracking steps with the specified stages
  const steps: TrackingStep[] = [
    {
      id: 1,
      name: "Grievance Registered",
      description:
        "Your grievance has been successfully registered in our system.",
      date: format(new Date(grievance.created_at || new Date()), "d MMM yyyy"),
      status: "complete",
      icon: CheckCircle2,
    },
    {
      id: 2,
      name: "Under Processing - Routing to Department",
      description:
        "Your grievance is being processed and routed to the appropriate department.",
      date: format(
        addDays(new Date(grievance.created_at || new Date()), 1),
        "d MMM yyyy"
      ),
      status: "complete",
      icon: FileText,
    },
    {
      id: 3,
      name: "Assigned to Officer",
      description:
        "Your grievance has been assigned to a concerned officer for further action.",
      date: format(
        addDays(new Date(grievance.created_at || new Date()), 3),
        "d MMM yyyy"
      ),
      status: currentStep >= 3 ? "complete" : "current", // Current by default if not completed
      icon: User,
    },
    {
      id: 4,
      name: "Under Examination",
      description:
        "Your grievance is being thoroughly examined by the assigned officer.",
      date:
        currentStep >= 4
          ? format(
              addDays(new Date(grievance.created_at || new Date()), 5),
              "d MMM yyyy"
            )
          : "Pending",
      status:
        currentStep >= 4
          ? "complete"
          : currentStep == 3
          ? "current"
          : "upcoming",
      icon: Search,
    },
    {
      id: 5,
      name: "Action Initiated",
      description:
        "Appropriate action has been initiated based on your grievance details.",
      date:
        currentStep >= 5
          ? format(
              addDays(new Date(grievance.created_at || new Date()), 7),
              "d MMM yyyy"
            )
          : "Pending",
      status:
        currentStep >= 5
          ? "complete"
          : currentStep == 4
          ? "current"
          : "upcoming",
      icon: AlertTriangle,
    },
    {
      id: 6,
      name: "Response Under Preparation",
      description: "A formal response to your grievance is being prepared.",
      date:
        currentStep >= 6
          ? format(
              addDays(new Date(grievance.created_at || new Date()), 10),
              "d MMM yyyy"
            )
          : "Pending",
      status:
        currentStep >= 6
          ? "complete"
          : currentStep == 5
          ? "current"
          : "upcoming",
      icon: MessageSquare,
    },
    {
      id: 7,
      name: "Resolved/Closed",
      description:
        "Your grievance has been resolved and the case is now closed.",
      date:
        currentStep >= 7
          ? format(
              new Date(grievance.updated_at || estimatedResolutionDate),
              "d MMM yyyy"
            )
          : "Expected by " + format(estimatedResolutionDate, "d MMM yyyy"),
      status:
        currentStep >= 7
          ? "complete"
          : currentStep == 6
          ? "current"
          : "upcoming",
      icon: CheckSquare,
    },
    {
      id: 8,
      name: "Awaiting Feedback",
      description:
        "Please provide your feedback on the resolution of your grievance.",
      date: "Pending",
      status: "pending",
      icon: MessageSquare,
    },
  ];

  // Debug log for steps
  console.log(
    "Steps with statuses:",
    steps.map((step) => ({ id: step.id, name: step.name, status: step.status }))
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Grievance Status Tracking</h2>
      </div>

      <div className="p-6">
        {/* Expected resolution date */}
        <div className="mb-8 p-5 bg-blue-50 rounded-md border border-blue-100 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Clock className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <p className="text-blue-800 font-medium">
              Expected Resolution Date:{" "}
              {format(estimatedResolutionDate, "d MMMM yyyy")}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Based on {grievance.priority || "standard"} priority level
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex mb-8 last:mb-0 p-4 rounded-lg ${
                step.status === "complete"
                  ? "bg-green-400 border-2 border-green-300 shadow-sm"
                  : step.status === "current"
                  ? "bg-blue-50 border border-blue-100"
                  : ""
              }`}
            >
              {/* Status indicator */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                    step.status === "complete"
                      ? "bg-green-100 text-green-600 ring-2 ring-green-500 ring-offset-2"
                      : step.status === "current"
                      ? "bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-2 animate-pulse"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute top-12 left-1/2 w-1 h-full -translate-x-1/2 ${
                      step.status === "complete"
                        ? "bg-green-400 border-l border-r border-green-500"
                        : step.status === "current"
                        ? "bg-blue-200 border-l border-r border-blue-400"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              {/* Step details */}
              <div className="ml-4 flex-1">
                <div className="flex items-center mb-1">
                  <h3
                    className={`font-medium ${
                      step.status === "complete"
                        ? "text-green-700"
                        : step.status === "current"
                        ? "text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </h3>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      step.status === "complete"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : step.status === "current"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {step.status === "complete"
                      ? "Completed"
                      : step.status === "current"
                      ? "In Progress"
                      : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                <p
                  className={`text-sm mt-2 flex items-center ${
                    step.status === "complete"
                      ? "text-green-600"
                      : step.status === "current"
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {step.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
