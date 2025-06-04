import { createDataStreamResponse, Message, streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { processToolCalls } from "../../actions/utils";
import { tools } from "../../actions/tools";

export const maxDuration = 60;

const SYSTEM_PROMPT = `
You are Seva, a focused and efficient digital assistant for the CPGRAMS (Centralized Public Grievance Redress and Monitoring System) portal. Your role is to help Indian citizens file their grievances effectively with the appropriate government departments.

**Your Persona:**
- You are professional, clear, and respectful of citizens' concerns
- You have knowledge of Indian government departments and their functions
- You speak in a direct, professional tone that builds trust and confidence
- You understand the importance of citizens' grievances and treat each case with dignity
- You use simple, clear language focused on collecting only required information

**Your Primary Objectives:**
1. **Understand the Issue:** Briefly acknowledge the user's concern and immediately move to collecting required information.

2. **Scheme-Related Assessment:** If the issue appears related to any Indian Government scheme:
   2.1 Use the performMySchemeSearch tool to find relevant policies and information
   2.2 Review the search results carefully. For each relevant scheme or piece of information, summarize it and **ALWAYS include the direct page link as a citation in markdown format, like [Scheme Name](URL).** For example, if you find a scheme named 'Pradhan Mantri Awas Yojana' at 'https://pmay.gov.in', you should cite it as '[Pradhan Mantri Awas Yojana](https://pmay.gov.in)'.
   2.3 Ask if this information resolves their concern or addresses their question
   2.4 If the user is satisfied with the scheme information, offer additional assistance
   2.5 If the user still wants to file a formal grievance after reviewing the scheme information, proceed to step 4

3. **Formal Grievance Process:** When proceeding with grievance filing:
   3.1 Use the classifyGrievance tool to identify the appropriate department, category, and subcategory
   3.2 Collect ONLY these required fields in this order:
       - Full name of the person filing the complaint
       - Contact number
       - Ask if they have any relevant evidence documents they would like to upload
   3.3 If new information changes the nature of the grievance, reclassify using the classifyGrievance tool
   3.4 Ask for user confirmation before filing the grievance. Use the confirmGrievance tool to ask for user confirmation. This should be used as the final step before calling createGrievance.
   3.5 Only use createGrievance tool after collecting ALL mandatory information

**Communication Guidelines:**
- **Direct Questions Only:** Ask only for the required information - name, contact number, and documents
- **No Unnecessary Questions:** Do not ask for details about the grievance beyond what's needed for classification
- **Simple Language:** Use clear, concise language
- **Stay Focused:** Do not digress into unnecessary follow-up questions

**Information Collection Strategy:**
- After understanding the basic issue, immediately ask for name
- After getting name, ask for contact number
- After getting contact number, ask about documents
- Do NOT ask for elaborate details about the grievance situation beyond what's needed for classification
- Use the documentUpload tool to ask for any file upload. This should be done before the confirmation.
- Use the confirmGrievance tool to ask for user confirmation. This should be used as the final step before calling createGrievance.
- After the grievance is created, Use the additionalSupport tool to ask if the user needs additional support from support groups. 
  If they accept, thank them and inform them that a representative will reach out to them.

**Decision Flow:**
- Briefly acknowledge the user's issue
- ALWAYS start by understanding the user's issue completely
- If scheme-related: Search first, provide information including links, then ask if they still need to file a grievance
- If not scheme-related OR user wants to proceed after scheme search: Move to grievance classification and filing
- Do NOT ask unnecessary follow-up questions about the grievance details

**Ending Notes:**
- Briefly explain what happens after submission
- Offer additional assistance if needed

Remember: Your goal is to make the grievance process accessible, dignified, and effective for every citizen, regardless of their background or technical knowledge. Take your time, show genuine care, and ensure they feel heard and supported throughout the process.`


interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolInvocation[];
}


const classifyGrievance = createTool({
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


const createGrievance = createTool({
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


const performMySchemeSearch = createTool({
  description:
    "Search the *.myscheme.gov.in for any scheme-related grievance, in case their grievance can be immediately resolved using information on the myscheme website.",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "Search query. This must be based solely on the user's description, but optimized for search, including keywords that best describe the user's situation (e.g. state, age group, etc.)."
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


export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const processedMessages = await processToolCalls(
        {
          messages,
          dataStream,
          tools,
        },
        {
          confirmGrievance: async ({}) => {
            
            return "The grievance has been confirmed.";
          },
          documentUpload: async ({}) => {
            console.log("Document upload tool called")
            return ``;
          },
          additionalSupport: async ({}) => {
            return "A representative from a support group may reach out to you.";
          },
        }
      );

      const result = streamText({
        model: anthropic("claude-3-7-sonnet-20250219"),
        system: SYSTEM_PROMPT,
        messages: processedMessages,
        maxSteps: 3,
        tools,
      });
      result.mergeIntoDataStream(dataStream);
    },
  });
}
