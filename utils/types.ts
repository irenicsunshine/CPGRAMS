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


// Type for the grievance data
export interface Grievance {
  id: string;
  title?: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  grievance_received_date: string;
  reformed_flag: boolean;
  cpgrams_category?: string;
}

export interface GrievanceResponse {
  status: string;
  user_id: string;
  grievances: Grievance[];
  total: number;
}

export interface WebSearchResultItem {
  title: string;
  link: string;
  snippet: string;
  pageContent?: string;
}

export interface WebSearchResults {
  success: boolean;
  data?: WebSearchResultItem[];
  error?: string;
}
