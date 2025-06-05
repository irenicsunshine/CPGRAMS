"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useConversation } from "@elevenlabs/react";
import { Bot, Loader2, MessageCircle, Mic, Speech, Square, Tag, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { APPROVAL } from "../actions/utils";
import { ClassifyGrievanceResult } from "../components/classify-grievance-result";
import { CreateGrievanceResult } from "../components/create-grievance-result";
import { DocumentUpload } from "../components/document-upload";
import UserIcon from "../components/Icons";

export default function Page() {
  const { messages, input, setInput, append, isLoading, addToolResult } =
    useChat();

  // ElevenLabs Speech-to-Text states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isConversating, setIsConversating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  interface ConversationMessage {
    source: "user" | "ai";
    timestamp?: string | number;
    message?: string;
    tool_response?: string;
    category?: string;
  }

  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => {
      setConversationMessages((msgs) => [...msgs, message]);
    },
    onError: (error) => console.error("Error:", error),
  });

  const startConversation = useCallback(async () => {
    try {
      setIsConversating(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: "agent_01jwwkyttcfvpv6jq9sqg9mhys",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
    setIsConversating(false);
  }, [conversation]);

  return (
    <div
      className={cn("flex flex-col bg-gray-50 min-h-[calc(85vh)]", {
        "justify-center": messages.length === 0,
      })}
    >
      {/* Chat messages area */}
      <main
        className={cn("overflow-y-auto p-6", {
          "flex-1": messages.length > 0,
        })}
      >
        {conversationMessages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {conversationMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation to see messages here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {conversationMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.source === "user"
                      ? "justify-end "
                      : "justify-start"
                      }`}
                  >
                    {message.source === "ai" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${message.source === "user"
                        ? "bg-primary text-white ml-auto"
                        : "bg-muted"
                        }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium opacity-70">
                            {message.source === "user" ? "You" : "AI Assistant"}
                          </span>
                          {message.timestamp && (
                            <span className="text-xs opacity-50">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>

                        {/* Message Content */}
                        {message.message && (
                          <p className="text-sm">{message.message}</p>
                        )}

                        {/* Show tool call result (category) if present in tool_response or similar */}
                        {message.tool_response && (
                          <Badge variant="outline" className="mt-2">
                            Category: {message.tool_response}
                          </Badge>
                        )}
                        {/* Optionally, support older property if present */}
                        {message.category && !message.tool_response && (
                          <Badge variant="outline" className="mt-2">
                            Category: {message.category}
                          </Badge>
                        )}

                        {/* Debug Info (collapsible) */}
                        {/* <details className="text-xs opacity-60">
                          <summary className="cursor-pointer hover:opacity-80">Debug Info</summary>
                          <pre className="mt-2 p-2 bg-black/10 rounded text-xs overflow-auto">
                            {JSON.stringify(message, null, 2)}
                          </pre>
                        </details> */}
                      </div>
                    </div>

                    {message.source === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
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
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 my-6 ${message.role === "user"
                      ? "justify-end ml-auto"
                      : "justify-start mr-auto"
                      } max-w-[90%]`}
                  >
                    {message.role !== "user" && (
                      <Avatar className="w-8 h-8 border">
                        <AvatarFallback>S</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg border px-6 text-default ${message.role === "user"
                        ? `bg-user text-right ${message.content.length < 50 &&
                          !message.content.includes("\n")
                          ? "w-fit py-4"
                          : "max-w-full py-6"
                        }`
                        : "bg-assistant break-words max-w-full py-6"
                        }`}
                    >
                      {message.role === "user" &&
                        !message.parts?.length &&
                        message.content && (
                          <div className="prose text-default max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        )}
                      {/* Tool invocations */}

                      {message.parts?.map((part, partIndex) => {
                        if (part.type === "text") {
                          return (
                            <div
                              key={partIndex + "-container"}
                              className="prose text-default max-w-none"
                            >
                              <ReactMarkdown>{part.text}</ReactMarkdown>
                            </div>
                          );
                        }

                        if (
                          part.type === "tool-invocation" &&
                          part.toolInvocation
                        ) {
                          const { toolName, state, toolCallId } =
                            part.toolInvocation;

                          if (
                            toolName === "confirmGrievance" &&
                            state === "call"
                          ) {
                            return (
                              <div
                                key={toolCallId}
                                className="bg-white border border-gray-200 rounded-lg p-4 my-3 shadow-sm"
                              >
                                <div className="mb-3">
                                  <h4 className="text-lg font-medium text-gray-800 mb-2">
                                    Confirm Grievance Filing
                                  </h4>
                                  <p className="text-gray-600 mb-2">
                                    Are you ready to file this grievance?
                                  </p>

                                  {part.toolInvocation.args.priority && (
                                    <div className="mb-2">
                                      <span className="font-medium">
                                        Priority:
                                      </span>{" "}
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${part.toolInvocation.args.priority ===
                                          "high"
                                          ? "bg-red-100 text-red-800"
                                          : part.toolInvocation.args
                                            .priority === "medium"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                          }`}
                                      >
                                        {part.toolInvocation.args.priority
                                          .charAt(0)
                                          .toUpperCase() +
                                          part.toolInvocation.args.priority.slice(
                                            1
                                          )}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-3">
                                  <Button
                                    className="text-white px-4 py-2 rounded-md flex items-center gap-2"
                                    onClick={() =>
                                      addToolResult({
                                        toolCallId,
                                        result: APPROVAL.YES,
                                      })
                                    }
                                  >
                                    Yes, File Grievance
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md flex items-center gap-2"
                                    onClick={() =>
                                      addToolResult({
                                        toolCallId,
                                        result: "No, I would like to add more information.",
                                      })
                                    }
                                  >
                                    No, Edit
                                  </Button>
                                </div>
                              </div>
                            );
                          }

                          if (toolName === "documentUpload" && state == "call") {
                            return (
                              <div key={toolCallId}>
                                <p className="mb-4 text-gray-600">
                                  {part.toolInvocation.args.message}
                                </p>
                                <DocumentUpload
                                  toolCallId={toolCallId}
                                  onComplete={(files, toolCallId) => {
                                    console.log("Document upload completed:", {
                                      files,
                                      toolCallId,
                                    });
                                    addToolResult({
                                      toolCallId,
                                      result: files,
                                    });
                                  }}
                                  onCancel={() =>
                                    addToolResult({
                                      toolCallId,
                                      result: "No documents available.",
                                    })
                                  }
                                />
                              </div>
                            );
                          }

                          if (
                            toolName === "additionalSupport" &&
                            state == "call"
                          ) {
                            return (
                              <div
                                key={toolCallId}
                                className="bg-white border border-gray-200 rounded-lg p-4 my-3 shadow-sm"
                              >
                                <div className="mb-3">
                                  <h4 className="text-lg font-medium text-gray-800 mb-2">
                                    Additional Support
                                  </h4>
                                  <p className="text-gray-600 mb-2">
                                    There are support groups working in this area,
                                    would you like additional support?
                                  </p>
                                </div>

                                <div className="flex gap-3">
                                  <Button
                                    className="text-white px-4 py-2 rounded-md flex items-center gap-2"
                                    onClick={() =>
                                      addToolResult({
                                        toolCallId,
                                        result: "Connect me to a support group",
                                      })
                                    }
                                  >
                                    Connect me to a support group
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-md flex items-center gap-2"
                                    onClick={() =>
                                      addToolResult({
                                        toolCallId,
                                        result:
                                          "No, I dont want additional support.",
                                      })
                                    }
                                  >
                                    No, I dont want additional support.
                                  </Button>
                                </div>
                              </div>
                            );
                          }

                          if (state === "result") {
                            if (toolName === "createGrievance") {
                              const { result } = part.toolInvocation;
                              return (
                                <div key={partIndex} className="mt-3">
                                  <CreateGrievanceResult {...result} />
                                </div>
                              );
                            } else if (toolName === "classifyGrievance") {
                              const { result } = part.toolInvocation;
                              return (
                                <ClassifyGrievanceResult
                                  key={partIndex}
                                  categories={result?.categories || []}
                                />
                              );
                            }
                          } else {
                            return (
                              <div key={partIndex}>
                                {toolName === "createGrievance" ? (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 my-2">
                                    <div className="flex items-center">
                                      <Loader2 className="animate-spin h-5 w-5 text-green-600 mr-2" />
                                      <span>Creating grievance...</span>
                                    </div>
                                  </div>
                                ) : toolName === "classifyGrievance" ? (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2">
                                    <div className="flex items-center">
                                      <Tag className="animate-pulse h-5 w-5 text-blue-600 mr-2" />
                                      <span>Classifying grievance...</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2">
                                    <div className="flex items-center">
                                      <Loader2 className="animate-spin h-5 w-5 text-gray-600 mr-2" />
                                      <span>Processing...</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }
                        }
                        return null;
                      })}
                    </div>
                    {message.role === "user" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary">
                          <UserIcon className="w-6 h-6 fill-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="bg-white p-4">
          <div className="max-w-3xl mx-auto mb-1 mt-4">
            <div className="flex items-center bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 transition-all hover:shadow-xl p-1">
              <Textarea
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                }}
                onKeyDown={async (event) => {
                  if (event.key === "Enter" && input.trim() && !isLoading) {
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
                  "flex-1 bg-background border-none shadow-none focus-visible:ring-0 focus-visible:border-transparent px-5 py-3 resize-none",
                  { "h-20": messages.length === 0 }
                )}
                disabled={isLoading}
                autoFocus
              />

              <div className="flex gap-2 px-2">
                {isConversating ? (
                  <Button
                    onClick={stopConversation}
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-red-50 border-red-200 hover:bg-red-100"
                    title="Stop conversation"
                  >
                    <Square className="size-4 text-red-600" strokeWidth={1.75} />
                    {/* square */}
                  </Button>
                ) : (
                  <Button
                    onClick={startConversation}
                    disabled={conversation.status === "connected"}
                    size="icon"
                    variant="outline"
                    className="rounded-full"
                  >
                    <Speech className="h-4 w-4" strokeWidth={1.5} />
                    {/* Start Conversation */}
                  </Button>
                )}
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
      </main>
    </div>
  );
}
