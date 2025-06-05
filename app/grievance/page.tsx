"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { Textarea } from "@/components/ui/textarea";
import { classifyGrievance, createGrievance } from "@/app/actions/grievance";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic, Square } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import UserIcon from "../components/Icons";
import { performMySchemeSearch } from "@/app/actions/myscheme-search";

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
        } else if (toolCall.toolName === "performMySchemeSearch") {
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
          const result = await performMySchemeSearch(query);

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

  // ElevenLabs Speech-to-Text states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const transcribeAudio = useCallback(
    async (audioBlob: Blob) => {
      try {
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        const response = await fetch("/api/speech-to-text", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Transcription failed");
        }

        const result = await response.json();

        if (result.text && result.text.trim()) {
          // Append transcribed text to existing input
          const newText = input ? `${input} ${result.text}` : result.text;
          setInput(newText);
        } else {
          // Consider how to inform the user about no speech detected if necessary
          console.warn("No speech detected. Please try again.");
        }
      } catch (error) {
        console.error("Transcription error:", error);
        // Consider how to inform the user about transcription failure if necessary
      } finally {
        setIsProcessing(false);
      }
    },
    [input, setInput]
  );

  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      // Prevent multiple recordings
      if (isRecording || isProcessing) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      // Consider displaying this error to the user in a different way if needed
    }
  }, [transcribeAudio, isProcessing, isRecording]);

  // Stop recording audio
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  // Get recording status text
  const getRecordingStatus = () => {
    if (isProcessing) return "Processing speech...";
    if (isRecording) return "Recording... Click to stop";
    return "Click to start recording";
  };

  return (
    <div
      className={cn("flex flex-col bg-gray-50 min-h-[calc(85vh)]", {
        "justify-center": chatMessages.length === 0,
      })}
    >
      {/* Chat messages area */}
      <main
        className={cn("overflow-y-auto p-6", {
          "flex-1": chatMessages.length > 0,
        })}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {chatMessages.length === 0 && (
            <div className="p-6 m-4 rounded-lg border bg-assistant">
              <p className="text-primary font-bold">
                Namaste! Welcome to the CPGRAMS Grievance Redress Portal.
              </p>
              <p className="text-primary font-bold my-2">
                I&apos;m Seva, your digital assistant. How can I help you today?
              </p>
              <p className="text-primary my-2">
                Would you like to file a grievance or do you need information
                about a specific government scheme or service?
              </p>
            </div>
          )}
          {parsedMessages.map((message: Message, index) => {
            const isUser = message.role === "user";
            return (
              <div
                key={index}
                className={`flex items-start gap-3 my-6 ${
                  isUser ? "justify-end ml-auto" : "justify-start mr-auto"
                } max-w-[90%]`}
              >
                {!isUser && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg border px-6 ${
                    isUser
                      ? `bg-user text-right ${
                          message.content.length < 50 &&
                          !message.content.includes("\n")
                            ? "w-fit py-4"
                            : "max-w-full py-6"
                        }`
                      : "bg-assistant break-words max-w-full py-6"
                  }`}
                >
                  {message.parts?.map((part, partIndex) => {
                    if (part.type === "text") {
                      // Only render text parts if they have content
                      return part.text?.trim() ? (
                        <div 
                          key={partIndex + '-container'}
                          className="prose text-default max-w-none"
                        >
                          <ReactMarkdown
                            children={part.text}
                          />
                        </div>
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
                            <p className="text-default font-mono text-sm whitespace-pre-wrap">
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
                </div>
                {isUser && (
                  <Avatar className="w-8 h-8 border">
                    {/* AvatarImage removed as we are using the icon directly in fallback */}
                    <AvatarFallback className="bg-transparent">
                      {" "}
                      {/* Making fallback background transparent if needed */}
                      <UserIcon className="w-5 h-5 fill-primary" />{" "}
                      {/* Adjusted size for icon within avatar */}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}

          {/* Show tool call in progress indicator */}
          {hasActiveToolCalls && (
            <div className="bg-background flex items-start gap-3 max-w-[80%] break-words rounded-lg justify-start mr-auto">
              <div className="w-8 h-8"></div>
              <div className="bg-assistant border border-blue-200 rounded-md p-3 my-3">
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
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <div className="bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 transition-all hover:shadow-xl p-1">
            <Textarea
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
              placeholder={
                isRecording
                  ? "Recording... Speak now"
                  : isProcessing
                  ? "Processing speech..."
                  : "Provide your grievance here..."
              }
              className={cn(
                "flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:border-transparent px-5 py-3 resize-none",
                { "h-20": chatMessages.length === 0 }
              )}
              disabled={isResponding}
              autoFocus
            />

            {isRecording ? (
              <Button
                type="button"
                onClick={stopRecording}
                variant="outline"
                size="icon"
                className="rounded-full bg-red-50 border-red-200 hover:bg-red-100"
                title="Stop recording"
              >
                <Square className="size-4 text-red-600" strokeWidth={1.75} />
                {/* square */}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={startRecording}
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full",
                  isProcessing && "bg-blue-50 border-blue-200"
                )}
                disabled={isProcessing}
                title={getRecordingStatus()}
              >
                <Mic
                  className={cn(
                    "size-4",
                    isProcessing ? "text-blue-600" : "text-current"
                  )}
                  strokeWidth={1.75}
                />
                {/* record */}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
