"use client";
import React, { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";          // ← remove this line if you don’t need GFM

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollToBottom, [messages]);          // auto-scroll on new message
  useEffect(() => inputRef.current?.focus(), []); // focus input on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setMessages((p) => [...p, { role: "user", content: input, timestamp: new Date() }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const text = data.text ?? "";

      setMessages((p) => [...p, { role: "assistant", content: text, timestamp: new Date() }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred";
      setMessages((p) => [
        ...p,
        { role: "assistant", content: `Sorry, I encountered an error: ${msg}`, timestamp: new Date() },
      ]);
    }
    setIsLoading(false);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen flex flex-col h-[calc(100vh-300px)] bg-black/5 backdrop-blur-lg border border-white/10 rounded-xl shadow-xl">
      {/* Chat body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-2xl p-4 relative group ${
                m.role === "user"
                  ? "bg-white/10 text-white shadow-inner"
                  : "bg-white/5 text-gray-100"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="whitespace-pre-wrap">
                <ReactMarkdown
                  // delete the next line if you removed the import above
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: (props) => <a {...props} className="text-pink-400 underline" />,
                    code: ({ inline, children, ...props } : any) =>
                      inline ? (
                        <code {...props} className="bg-white/10 px-1 py-0.5 rounded">
                          {children}
                        </code>
                      ) : (
                        <pre {...props} className="bg-black/20 p-3 rounded overflow-x-auto">
                          <code>{children}</code>
                        </pre>
                      ),
                  }}
                >
                  {m.content}
                </ReactMarkdown>
                </div>
              ) : (
                m.content
              )}

              <span className="absolute -bottom-5 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTime(m.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl p-4 bg-white/5 text-gray-200 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="p-6 border-t border-white/10">
        <div className="flex space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 text-white rounded-xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl transition-colors duration-200 font-medium disabled:opacity-50 flex items-center space-x-2"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}