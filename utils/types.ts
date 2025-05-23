// Grievance data types
export interface GrievanceData {
    title: string;
    description: string;
    category: string;
    user_id: string;
    priority: "low" | "medium" | "high";
    cpgrams_category: string;
    reformed_top_level_category: string;
    reformed_last_level_category: string;
    covid19_category: string;
    reformed_flag: boolean;
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
  