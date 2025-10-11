import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Message } from "../types";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`w-full py-3 ${isUser ? "bg-white" : "bg-gray-50"}`}>
      <div className="max-w-3xl mx-auto px-4 flex gap-4">
        <div
          className={`w-8 h-8 rounded flex items-center justify-center text-white font-semibold text-sm ${
            isUser ? "bg-[#ff6b4a]" : "bg-indigo-600"
          }`}
        >
          {isUser ? "U" : "J"}
        </div>
        <div className="flex-1 prose prose-sm md:prose-base max-w-none text-gray-800">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return match ? (
                  <pre className="rounded-lg bg-gray-900 text-gray-100 p-3 overflow-x-auto text-sm">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-gray-100 rounded px-1 py-0.5 text-sm" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
