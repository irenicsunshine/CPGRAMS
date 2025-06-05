import { tool } from "ai";
import { z } from "zod";
import { performMySchemeSearch as mySchemeSearchAction } from "./myscheme-search";

const API_BASE_URL = process.env.GRM_API_URL;
const API_TOKEN = process.env.GRM_API_TOKEN;
const USER_ID = process.env.USER_ID;

const classifyGrievance = tool({
  description:
    "Classify the given user category to the right department, category and subcategory.",
  parameters: z.object({
    query: z.string().describe("User grievance text"),
  }),
  execute: async function ({ query }) {
    const response = await fetch(`${API_BASE_URL}/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        grievance_text: query,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to classify grievance");
    }
    return await response.json();
  },
});

const createGrievance = tool({
  description:
    "Create a new grievance in the system. IMPORTANT: DO NOT call this function until you have collected ALL mandatory information from the user. The description field MUST include all personal details and category-specific required information in a structured format.",
  parameters: z.object({
    title: z
      .string()
      .describe("A short, clear title summarizing the grievance issue"),
    description: z
      .string()
      .describe(
        "MUST include ALL of the following in a structured format: 1) Personal details (full name, contact info, complete address with PIN code), 2) Detailed description of the issue with dates and specifics, 3) Category-specific required information, 4) Timeline of incidents and previous follow-ups, 5) Expected resolution. DO NOT call this function if any mandatory information is missing."
      ),
    category: z
      .string()
      .describe(
        "Main category of the grievance. If unsure or not a grievance, use 'Other' or 'None'"
      ),
    cpgrams_category: z
      .string()
      .describe(
        "Full category name along with subcategories extracted from the CPGRAMS classification"
      ),
    priority: z
      .enum(["low", "medium", "high"])
      .describe(
        "Priority level based on the urgency and impact of the grievance"
      ),
  }),
  execute: async function ({
    title,
    description,
    category,
    cpgrams_category,
    priority,
  }) {
    const payload = {
      title: title,
      description: description,
      user_id: USER_ID,
      category: category,
      priority: priority,
      cpgrams_category: cpgrams_category,
    };

    const response = await fetch(`${API_BASE_URL}/grievances`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to submit grievance");
    }
    return await response.json();
  },
});

const performMySchemeSearch = tool({
  description:
    "Search the *.myscheme.gov.in for any scheme-related grievance, in case their grievance can be immediately resolved using information on the myscheme website.",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "Search query. This must be based solely on the user query, but optimized for search, and must not contain any information not provided by the user."
      ),
  }),
  execute: async function ({ query }) {
    try {
      const results = await mySchemeSearchAction(query);
      return results;
    } catch (error) {
      console.error("Error performing MyScheme search:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unknown error occurred during MyScheme search.",
      };
    }
  },
});

const confirmGrievance = tool({
  description:
    "Ask for user confirmation before filing the grievance. This should be used as the final step before calling createGrievance.",
  parameters: z.object({}),
});

const documentUpload = tool({
  description:
    "Upload documents for the grievance. This tool should be used to upload documents for the grievance.",
  parameters: z.object({
    message: z.string().describe("Relevant documents for the grievance"),
  }),
});

const additionalSupport = tool({
  description:
    "Provide additional support to the user. This tool should be used to provide additional support to the user.",
  parameters: z.object({
    message: z.string().describe("Additional support for the grievance"),
  }),
});

export const tools = {
  classifyGrievance,
  createGrievance,
  performMySchemeSearch,
  confirmGrievance,
  documentUpload,
  additionalSupport,
};
