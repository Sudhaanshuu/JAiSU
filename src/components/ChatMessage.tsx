import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Message } from "../types";

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const roleColor = isUser ? "bg-[#ff6b4a]" : "bg-indigo-600";
  const roleInitial = isUser ? "U" : "J";

  return (
    <div className={`w-full py-3 ${isUser ? "bg-white" : "bg-gray-50"}`}>
      <div className="mx-auto flex max-w-3xl gap-3 px-3 sm:gap-4 sm:px-4">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs font-semibold text-white sm:h-9 sm:w-9 sm:text-sm ${roleColor}`}
        >
          {roleInitial}
        </div>

        <div className="flex-1 text-gray-800 prose prose-sm sm:prose-base max-w-none leading-relaxed break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({ className, children, ...props }) {
                const languageMatch = /language-(\w+)/.exec(className || "");
                return languageMatch ? (
                  <pre className="overflow-x-auto rounded-lg bg-gray-900 p-3 text-sm text-gray-100 shadow-inner sm:text-base">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code
                    className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono sm:text-base"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-6 mb-2">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-6 mb-2">{children}</ol>;
              },
            }}
          >
            {message.content.trim()}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
