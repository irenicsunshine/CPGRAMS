"use client";
import { useChat } from "@ai-sdk/react";
import { CreateGrievanceResult } from "../components/create-grievance-result";
import { ClassifyGrievanceResult } from "../components/classify-grievance-result";
import { Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APPROVAL } from "../actions/utils";
import { DocumentUpload } from "../components/document-upload";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import UserIcon from "../components/Icons";

export default function Page() {
  const {
    messages,
    input,
    setInput,
    append,
    isLoading,
    addToolResult,
  } = useChat();

  // ElevenLabs Speech-to-Text states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="w-full">
                  <div
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`${
                        message.role === "user"
                          ? "bg-blue-500 text-gray-800"
                          : "bg-gray-100"
                      } rounded-lg p-4 shadow-sm max-w-[80%]`}
                    >
                      <div className="flex items-center mb-2 gap-2 bg-gray-50">
                        {message.role === "user" ? (
                          <>
                            <Avatar className="w-8 h-8 border">
                              <AvatarFallback className="bg-transparent">
                                <UserIcon className="w-5 h-5 fill-primary" />{" "}
                              </AvatarFallback>
                            </Avatar>
                          </>
                        ) : (
                          <>
                            <Avatar className="w-8 h-8 border">
                              <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                          </>
                        )}
                      </div>

                      {message.role === "user" &&
                        !message.parts?.length &&
                        message.content && (
                          <div className="whitespace-pre-wrap mb-2 text-gray-800">
                            {message.content}
                          </div>
                        )}

                      {/* Tool invocations */}
                      <div className="mt-2">
                        {message.parts?.map((part, partIndex) => {
                          if (part.type === "text") {
                            return (
                              <div
                                key={`text-${partIndex}`}
                                className={`mb-2 whitespace-pre-wrap ${
                                  message.role === "user" ? "" : "text-gray-800"
                                }`}
                              >
                                {part.text}
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
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            part.toolInvocation.args
                                              .priority === "high"
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
                                          result: APPROVAL.NO,
                                        })
                                      }
                                    >
                                      No, Cancel
                                    </Button>
                                  </div>
                                </div>
                              );
                            }

                            if (
                              toolName === "documentUpload" &&
                              state == "call"
                            ) {
                              return (
                                <div key={toolCallId}>
                                  <p className="mb-4 text-gray-600">
                                    {part.toolInvocation.args.message}
                                  </p>
                                  <DocumentUpload
                                    toolCallId={toolCallId}
                                    onComplete={(files, toolCallId) => {
                                      console.log(
                                        "Document upload completed:",
                                        {
                                          files,
                                          toolCallId,
                                        }
                                      );
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
                                      There are support groups working in this
                                      area, would you like additional support?
                                    </p>
                                  </div>

                                  <div className="flex gap-3">
                                    <Button
                                      className="text-white px-4 py-2 rounded-md flex items-center gap-2"
                                      onClick={() =>
                                        addToolResult({
                                          toolCallId,
                                          result:
                                            "Connect me to a support group",
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                  "flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:border-transparent px-5 py-3 resize-none",
                  { "h-20": messages.length === 0 }
                )}
                disabled={isLoading}
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
      </main>
    </div>
  );
}