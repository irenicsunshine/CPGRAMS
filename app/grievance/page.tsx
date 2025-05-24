"use client";
import { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Input } from "@/components/ui/input";
import { classifyGrievance, createGrievance } from "@/app/actions/grievance";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: {
    query?: string; // For fetchContext tool
    [key: string]: unknown;
  };
  state: "partial-call" | "call" | "result";
  result?: string | Record<string, unknown>;
}

interface MessagePart {
  type:
    | "text"
    | "tool-invocation"
    | "reasoning"
    | "source"
    | "file"
    | "step-start";
  text?: string;
  toolInvocation?: ToolInvocation;
  // Additional fields for other part types can be added as needed
}

interface Message {
  id: string;
  role: "user" | "assistant" | "data" | "system";
  content: string;
  parts?: MessagePart[];
}

export default function GrievancePage() {
  const {
    messages: chatMessages = [],
    input,
    setInput,
    append,
    addToolResult,
    status,
  } = useChat({
    maxSteps: 3,
    onToolCall: (() => {
      const processedToolCallIds = new Set<string>();
      return async ({
        toolCall,
      }: {
        toolCall: { toolName: string; args: unknown; toolCallId: string };
      }) => {
        if (toolCall.toolName === "classifyGrievance") {
          let query = "";
          if (
            typeof toolCall.args === "object" &&
            toolCall.args !== null &&
            "query" in toolCall.args
          ) {
            query = (toolCall.args as { query: string }).query;
          }
          const toolCallId = toolCall.toolCallId;
          if (processedToolCallIds.has(toolCallId)) {
            return;
          }
          processedToolCallIds.add(toolCallId);

          const result = await classifyGrievance(query);
          addToolResult({
            toolCallId,
            result: result,
          });
        } else if (toolCall.toolName === "createGrievance") {
          let query = "";
          if (
            typeof toolCall.args === "object" &&
            toolCall.args !== null &&
            "query" in toolCall.args
          ) {
            query = (toolCall.args as { query: string }).query;
          }
          const toolCallId = toolCall.toolCallId;
          if (processedToolCallIds.has(toolCallId)) {
            return;
          }
          processedToolCallIds.add(toolCallId);
          type GrievanceArgs = {
            title: string;
            description: string;
            category: string;
            priority: "low" | "medium" | "high";
            cpgrams_category: string;
          };
          const grievanceArgs = toolCall.args as GrievanceArgs;

          const result = await createGrievance(
            grievanceArgs.title,
            grievanceArgs.description,
            grievanceArgs.category,
            grievanceArgs.priority,
            grievanceArgs.cpgrams_category
          );
          addToolResult({
            toolCallId,
            result: result,
          });
        }
      };
    })(),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isResponding = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  return (
    <div className="flex flex-col bg-gray-50 min-h-[calc(85vh)]">
      {/* Chat messages area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {chatMessages.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">
                Submit your grievance using the input box below
              </p>
            </div>
          )}
          {chatMessages.map((message: Message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-auto max-w-[80%] text-right"
                  : "bg-gray-100 mr-auto max-w-[80%] break-words"
              }`}
            >
              <p className="text-gray-800 whitespace-pre-wrap">
                {message.content}
              </p>
              <span className="text-xs text-gray-500 mt-1 block">
                {message.role === "user" ? "You" : "Assistant"}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 transition-all hover:shadow-xl p-1">
            <Input
              type="text"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
              }}
              onKeyDown={async (event) => {
                if (event.key === "Enter" && input.trim() && !isResponding) {
                  append({ content: input, role: "user" });
                  setInput("");
                }
              }}
              placeholder="Provide your grievance here..."
              className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:border-transparent px-5 py-3"
              disabled={isResponding}
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
}
