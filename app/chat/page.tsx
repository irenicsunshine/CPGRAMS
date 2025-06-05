"use client";
import { useChat } from "@ai-sdk/react";
import { CreateGrievanceResult } from "../components/create-grievance-result";
import { ClassifyGrievanceResult } from "../components/classify-grievance-result";
import { Send, User, Bot, Loader2, FileCheck, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APPROVAL } from "../actions/utils";
import { DocumentUpload } from "../components/document-upload";

export default function Page() {
  const { messages, input, setInput, handleSubmit, isLoading, addToolResult } =
    useChat();

  return (
    <main className="flex flex-col min-h-[calc(85vh)] max-w-4xl mx-auto">
      {/* Messages container */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 bg-gray-50 rounded-lg max-w-md shadow-sm">
              <h3 className="text-lg font-medium mb-2">
                Welcome to the Grievance Handling Assistant
              </h3>
              <p className="text-gray-600">
                Describe your issue and I&apos;ll help you resolve it with
                empathy and guidance.
              </p>
            </div>
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
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    } rounded-lg p-4 shadow-sm max-w-[80%]`}
                  >
                    <div className="flex items-center mb-2 gap-2">
                      {message.role === "user" ? (
                        <>
                          <User className="h-5 w-5" />
                          <span className="font-medium">You</span>
                        </>
                      ) : (
                        <>
                          <Bot className="h-5 w-5" />
                          <span className="font-medium">Assistant</span>
                        </>
                      )}
                    </div>

                    {message.role === "user" &&
                      !message.parts?.length &&
                      message.content && (
                        <div className="whitespace-pre-wrap mb-2">
                          {message.content}
                        </div>
                      )}

                    {/* Tool invocations */}
                    <div className="mt-2">
                      {message.parts?.map((part, partIndex) => {
                        // Handle text parts - these contain the actual text content for assistant messages
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
                                          part.toolInvocation.args.priority ===
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
                  </div>
                </div>

                {/* Reasoning parts - only for assistant messages */}
                {message.role === "assistant" &&
                  message.parts?.map((part, partIndex) => {
                    if (part.type === "reasoning") {
                      return (
                        <div
                          key={`reasoning-${message.id}-${partIndex}`}
                          className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4 mx-auto max-w-[90%]"
                        >
                          <div className="flex items-center mb-2">
                            <FileCheck className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="font-medium text-purple-800">
                              Reasoning
                            </span>
                          </div>
                          <div className="text-purple-800 whitespace-pre-wrap">
                            {part.reasoning}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed input at bottom */}
      <div className="border-t border-gray-200 bg-white w-full">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4">
          <Input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message here..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}