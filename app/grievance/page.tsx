"use client";
import { useRef, useEffect, useState } from "react";
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

// Function to parse message content into parts
const parseMessageContent = (content: string): MessagePart[] => {
  const parts: MessagePart[] = [];

  // Regular expressions to match different content types
  // Claude 3 Haiku specific patterns
  const toolCallRegex = /I'll use the (\w+) tool to (.*?)\./g;
  const toolResultRegex = /\[Tool Result\](.*?)\[\/Tool Result\]/g;
  const reasoningRegex = /\[Reasoning\](.*?)\[\/Reasoning\]/g;

  // Also look for function call blocks that Claude might use
  const functionCallRegex = /<function_call>(.*?)<\/function_call>/g;
  const functionResultRegex = /<function_result>(.*?)<\/function_result>/g;

  let lastIndex = 0;
  let match;

  // Helper function to process matches
  const processMatches = (regex: RegExp, type: string, state?: string) => {
    regex.lastIndex = 0; // Reset the regex
    lastIndex = 0;

    while ((match = regex.exec(content)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index).trim();
        if (textBefore) {
          parts.push({
            type: "text",
            text: textBefore,
          });
        }
      }

      // Add the matched part
      if (type === "tool-invocation") {
        parts.push({
          type: "tool-invocation",
          text: match[0].trim(),
          toolInvocation: {
            toolCallId: "unknown",
            toolName: match[1] || "unknown",
            args: {},
            state: state as "call" | "result" | "partial-call",
            result: state === "result" ? match[1].trim() : undefined,
          },
        });
      } else if (type === "reasoning") {
        parts.push({
          type: "reasoning",
          text: match[1].trim(),
        });
      }

      lastIndex = match.index + match[0].length;
    }
  };

  // Process all types of content
  processMatches(toolCallRegex, "tool-invocation", "call");
  processMatches(functionCallRegex, "tool-invocation", "call");
  processMatches(toolResultRegex, "tool-invocation", "result");
  processMatches(functionResultRegex, "tool-invocation", "result");
  processMatches(reasoningRegex, "reasoning");

  // Add remaining text
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex).trim();
    if (remainingText) {
      parts.push({
        type: "text",
        text: remainingText,
      });
    }
  }

  // If no parts were found, treat the entire content as text
  if (parts.length === 0) {
    parts.push({
      type: "text",
      text: content,
    });
  }

  return parts;
};

export default function GrievancePage() {
  // State to track active tool calls
  const [activeToolCalls, setActiveToolCalls] = useState<
    Record<string, boolean>
  >({});

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
        // Mark this tool call as active
        setActiveToolCalls((prev) => ({
          ...prev,
          [toolCall.toolCallId]: true,
        }));
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

          // Mark this tool call as completed
          setActiveToolCalls((prev) => {
            const updated = { ...prev };
            delete updated[toolCallId];
            return updated;
          });

          addToolResult({
            toolCallId,
            result: result,
          });
        } else if (toolCall.toolName === "createGrievance") {
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

          // Mark this tool call as completed
          setActiveToolCalls((prev) => {
            const updated = { ...prev };
            delete updated[toolCallId];
            return updated;
          });

          addToolResult({
            toolCallId,
            result: result,
          });
        }
      };
    })(),
  });

  // Parse message content into parts for each message
  const parsedMessages = chatMessages.map((message: Message) => ({
    ...message,
    parts: parseMessageContent(message.content),
  }));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isResponding = status === "submitted" || status === "streaming";
  const hasActiveToolCalls = Object.keys(activeToolCalls).length > 0;

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
          {parsedMessages.map((message: Message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-auto max-w-[80%] text-right"
                  : "bg-gray-100 mr-auto max-w-[80%] break-words"
              }`}
            >
              {message.parts?.map((part, partIndex) => {
                if (part.type === "text") {
                  // Only render text parts if they have content
                  return part.text?.trim() ? (
                    <p
                      key={partIndex}
                      className="text-gray-800 whitespace-pre-wrap mb-2"
                    >
                      {part.text}
                    </p>
                  ) : null;
                } else if (part.type === "tool-invocation") {
                  if (part.toolInvocation?.state === "call") {
                    // Extract tool name if possible
                    const toolName =
                      part.toolInvocation.toolName !== "unknown"
                        ? part.toolInvocation.toolName
                        : "Tool";

                    return (
                      <div
                        key={partIndex}
                        className="bg-amber-50 border border-amber-200 rounded-md p-3 my-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded mr-2">
                              Tool Call
                            </span>
                            <span className="text-amber-700 text-xs font-semibold">
                              {toolName}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 font-mono text-sm whitespace-pre-wrap">
                          {part.text}
                        </p>
                      </div>
                    );
                  } else if (part.toolInvocation?.state === "result") {
                    return (
                      <div
                        key={partIndex}
                        className="bg-green-50 border border-green-200 rounded-md p-3 my-3"
                      >
                        <div className="flex items-center mb-2">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            Tool Result
                          </span>
                        </div>
                        <p className="text-gray-700 font-mono text-sm whitespace-pre-wrap overflow-auto max-h-40">
                          {part.text}
                        </p>
                      </div>
                    );
                  }
                } else if (part.type === "reasoning") {
                  return (
                    <div
                      key={partIndex}
                      className="bg-purple-50 border border-purple-200 rounded-md p-3 my-3"
                    >
                      <div className="flex items-center mb-2">
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                          Reasoning
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {part.text}
                      </p>
                    </div>
                  );
                }
                return null;
              })}
              <span className="text-xs text-gray-500 mt-1 block">
                {message.role === "user" ? "You" : "Assistant"}
              </span>
            </div>
          ))}

          {/* Show tool call in progress indicator */}
          {hasActiveToolCalls && (
            <div className="bg-gray-100 mr-auto max-w-[80%] break-words p-4 rounded-lg">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 my-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">
                      Processing
                    </span>
                    <span className="text-blue-700 text-xs font-semibold">
                      Tool Call
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  <p className="text-gray-700 text-sm">
                    The assistant is processing your request...
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                Assistant
              </span>
            </div>
          )}
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
