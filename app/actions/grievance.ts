"use server";
import type {
  GrievanceData,
  CategoryPrediction,
  ApiResponse,
} from "@/utils/types";

const API_BASE_URL = process.env.GRM_API_URL;
const API_TOKEN = process.env.GRM_API_TOKEN;

if (!API_TOKEN || !API_BASE_URL) {
  throw new Error("API token or API base URL is not configured on the server");
}

export async function classifyGrievance(
  grievanceText: string
): Promise<ApiResponse<CategoryPrediction>> {
  try {
    const response = await fetch(`${API_BASE_URL}/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        grievance_text: grievanceText,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to classify grievance");
    }

    return await response.json();
  } catch (error) {
    console.error("Error classifying grievance:", error);
    return {
      data: {
        category: "General",
        confidence: 0,
      },
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to classify grievance",
    };
  }
}

export async function createGrievance(
  title: string,
  description: string,
  category: string,
  priority: "low" | "medium" | "high" = "medium",
  cpgrams_category: string,
  userId: string = "rec_d0jieo7jkah57cl384i0"
): Promise<ApiResponse<GrievanceData>> {
  const grievanceData: GrievanceData = {
    title: title,
    description,
    category,
    user_id: userId,
    priority,
    cpgrams_category: cpgrams_category,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/grievances`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(grievanceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to submit grievance");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting grievance:", error);
    throw error;
  }
}