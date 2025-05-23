import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-3-haiku-20240307"),
    system:
      "You are a helpful grievance handling assistant. Your role is to listen to user complaints, show empathy, and provide clear guidance on how their issue might be resolved. When appropriate, explain your reasoning process to help users understand how you arrived at your suggestions. Be professional but warm in your tone.",
    messages,
    tools: {
      classifyGrievance: {
        name: "classifyGrievance",
        description:
          "Classify the given user category to the right department, category and subcategory.",
        parameters: z.object({
          query: z
            .string()
            .describe("User grievance text"),
        }),
      },
    },
  });

  return result.toDataStreamResponse();
}