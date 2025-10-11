import { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { Conversation, Message } from "./types";
import {
  saveConversations,
  loadConversations,
  generateId,
} from "./utils/storage";

declare global {
  interface Window {
    puter: any;
  }
}

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadConversations();
    if (loaded.length > 0) {
      setConversations(loaded);
      setCurrentConversationId(loaded[0].id);
    } else {
      const newConv: Conversation = {
        id: generateId(),
        title: "New Chat",
        messages: [],
        lastUpdated: Date.now(),
      };
      setConversations([newConv]);
      setCurrentConversationId(newConv.id);
    }
  }, []);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, currentConversationId]);

  const currentConversation = conversations.find((c) => c.id === currentConversationId);

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      lastUpdated: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
  };

  const handleSendMessage = async (content: string) => {
    let convId = currentConversationId;
    if (!convId) {
      const newConv: Conversation = {
        id: generateId(),
        title: content.slice(0, 30),
        messages: [],
        lastUpdated: Date.now(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
      convId = newConv.id;
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              title: c.messages.length === 0 ? content.slice(0, 30) : c.title,
              lastUpdated: Date.now(),
            }
          : c
      )
    );

    setIsLoading(true);
    try {
      if (!window.puter || !window.puter.ai) throw new Error("AI not loaded");

      const response = await window.puter.ai.chat(content, {
        model: "claude-3-5-sonnet",
        stream: true,
      });

      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMsg], lastUpdated: Date.now() }
            : c
        )
      );

      let full = "";
      for await (const chunk of response) {
        full += chunk;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [
                    ...c.messages.slice(0, -1),
                    { ...assistantMsg, content: full },
                  ],
                  lastUpdated: Date.now(),
                }
              : c
          )
        );
      }
    } catch {
      const errMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "Error occurred. Try again.",
        timestamp: Date.now(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, errMsg], lastUpdated: Date.now() }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white text-gray-900">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={createNewConversation}
        isMobileOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <header className="px-4 py-3 flex items-center border-b lg:hidden border-gray-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 py-4">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#ff6b4a]">
                  <span className="text-white font-bold text-2xl">J</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-800">
                  How can I help you today?
                </h1>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentConversation.messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

export default App;
