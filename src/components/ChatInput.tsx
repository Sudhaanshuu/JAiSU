import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void;
  disabled: boolean;
}) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      textareaRef.current!.style.height = "auto";
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white w-full">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex items-end gap-2 px-3 py-2 sm:px-4 sm:py-3 max-w-full sm:max-w-3xl"
      >
        <div className="flex-1 flex items-end rounded-2xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-[#ff6b4a]">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Message Jaisu..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent px-3 py-2 sm:px-4 sm:py-3 resize-none max-h-32 text-sm sm:text-base focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="p-2 sm:p-3 rounded-lg text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: "#ff6b4a" }}
        >
          <ArrowUp size={18} />
        </button>
      </form>
    </div>
  );
}
