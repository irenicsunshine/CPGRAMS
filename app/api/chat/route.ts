import { streamText, UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic("claude-3-haiku-20240307"),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}
