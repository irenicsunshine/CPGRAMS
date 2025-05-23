// Grievance data types
export interface GrievanceData {
  title: string;
  description: string;
  category: string;
  user_id: string;
  priority: "low" | "medium" | "high";
  cpgrams_category: string;
}

export interface CategoryPrediction {
  category: string;
  confidence: number;
}

// Grievance submission parameters
export interface SubmitGrievanceParams {
  description: string;
  category?: string;
  userId?: string;
  priority?: "low" | "medium" | "high";
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Error response type
export interface ErrorResponse {
  message: string;
  code?: string | number;
}
