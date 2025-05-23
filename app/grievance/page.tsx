"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// Define message types for TypeScript
type MessageType = "system" | "user";

interface Message {
  id: number;
  type: MessageType;
  text: string;
  isComplete?: boolean;
}

export default function GrievancePage() {
  const searchParams = useSearchParams();
  const initialGrievance = searchParams.get("grievanceText") || "";

  // State for chat-like interface
  const [messages, setMessages] = useState<Message[]>([
    ...(initialGrievance
      ? [{ id: 1, type: "user" as MessageType, text: initialGrievance }]
      : []),
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMessage: Message = {
      id: messages.length + 1,
      type: "user" as MessageType,
      text: inputValue,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-[calc(85vh)]">
      {/* Chat messages area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">
                Submit your grievance using the input box below
              </p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`animate-fadeIn flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="max-w-[80%] p-4 rounded-lg bg-gradient-to-r from-[#1d4e8f] to-[#2a6cb8] text-white rounded-tr-none shadow-md">
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 transition-all hover:shadow-xl">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type your grievance here..."
                className="flex-1 px-6 py-4 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-4 mr-2 rounded-full ${
                  inputValue.trim()
                    ? "bg-gradient-to-r from-[#1d4e8f] to-[#2a6cb8] text-white shadow-md hover:shadow-lg transform transition-transform hover:scale-105"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                } transition-all duration-200`}
                aria-label="Send message"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transform rotate-45"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}
