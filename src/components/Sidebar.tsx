import { Edit3, MessageSquare, X } from "lucide-react";
import { Conversation } from "../types";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseMobile}
      />
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-gray-200 bg-gray-50 transform transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#ff6b4a]">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <h1 className="text-sm font-semibold text-gray-800">Jaisu</h1>
          </div>
          <button onClick={onCloseMobile} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="px-3 pb-2">
          <button
            onClick={() => {
              onNewConversation();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-100 text-gray-800"
          >
            <Edit3 size={15} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                onSelectConversation(conv.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                currentConversationId === conv.id
                  ? "bg-gray-200 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              <MessageSquare size={14} className="text-gray-500" />
              <p className="truncate">{conv.title}</p>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
