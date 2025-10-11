import React, { useState, useEffect, useRef } from 'react';
import { Menu, ArrowUp, MessageSquare, Edit3, X, Upload, Loader2, ScanText, FileText, BarChart2, Languages, Home } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createWorker } from 'tesseract.js';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
};

type TextStats = {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'chat' | 'ocr'>('home');

  return (
    <div className="min-h-screen bg-white">
      {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
      {currentPage === 'chat' && <ChatApp onNavigate={setCurrentPage} />}
      {currentPage === 'ocr' && <OCRApp onNavigate={setCurrentPage} />}
    </div>
  );
}

function HomePage({ onNavigate }: { onNavigate: (page: 'home' | 'chat' | 'ocr') => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500">
              <span className="text-white font-bold text-xl">J</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Jaisu AI Platform</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Your AI-Powered Toolkit
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our powerful tools to enhance your productivity
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div 
            onClick={() => onNavigate('chat')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer p-8 border-2 border-transparent hover:border-orange-500 group"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Chat Assistant</h3>
            <p className="text-gray-600 mb-6">
              Have intelligent conversations with our AI assistant. Get answers, brainstorm ideas, and solve problems together.
            </p>
            <div className="flex items-center text-orange-500 font-semibold group-hover:gap-3 gap-2 transition-all">
              <span>Launch Chat</span>
              <ArrowUp className="w-4 h-4 rotate-45" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('ocr')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer p-8 border-2 border-transparent hover:border-orange-500 group"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ScanText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Text Extractor</h3>
            <p className="text-gray-600 mb-6">
              Extract text from images instantly. Analyze content, detect languages, and get detailed text statistics.
            </p>
            <div className="flex items-center text-orange-500 font-semibold group-hover:gap-3 gap-2 transition-all">
              <span>Launch Extractor</span>
              <ArrowUp className="w-4 h-4 rotate-45" />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Developed with ❤️ by <span className="font-medium text-orange-500">Sudhanshu</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function ChatApp({ onNavigate }: { onNavigate: (page: 'home' | 'chat' | 'ocr') => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const newConv: Conversation = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      lastUpdated: Date.now(),
    };
    setConversations([newConv]);
    setCurrentConversationId(newConv.id);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputMessage]);

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

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;

    let convId = currentConversationId;
    if (!convId) {
      const newConv: Conversation = {
        id: generateId(),
        title: inputMessage.slice(0, 30),
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
      content: inputMessage,
      timestamp: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              title: c.messages.length === 0 ? inputMessage.slice(0, 30) : c.title,
              lastUpdated: Date.now(),
            }
          : c
      )
    );

    setInputMessage('');
    setIsLoading(true);
    
    setTimeout(() => {
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "I'm a demo assistant in this merged app. In a real implementation, this would connect to an AI service like Claude or GPT. I can help you with various tasks!",
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMsg], lastUpdated: Date.now() }
            : c
        )
      );
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-white text-gray-900">
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-gray-200 bg-gray-50 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <h1 className="text-sm font-semibold text-gray-800">Jaisu Chat</h1>
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="px-3 pb-2 space-y-2">
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-100 text-gray-800"
          >
            <Home size={15} />
            Back to Home
          </button>
          <button
            onClick={() => {
              createNewConversation();
              setIsSidebarOpen(false);
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
                setCurrentConversationId(conv.id);
                setIsSidebarOpen(false);
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
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-500">
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

        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-end gap-2">
            <div className="flex-1 flex items-end rounded-2xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-orange-500">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message Jaisu..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent px-4 py-3 resize-none max-h-32 text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 rounded-lg text-white transition-all disabled:opacity-50 bg-gradient-to-br from-orange-500 to-red-500"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`w-full py-3 ${isUser ? "bg-white" : "bg-gray-50"}`}>
      <div className="max-w-3xl mx-auto px-4 flex gap-4">
        <div
          className={`w-8 h-8 rounded flex items-center justify-center text-white font-semibold text-sm ${
            isUser ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-indigo-600"
          }`}
        >
          {isUser ? "U" : "J"}
        </div>
        <div className="flex-1 prose prose-sm md:prose-base max-w-none text-gray-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function OCRApp({ onNavigate }: { onNavigate: (page: 'home' | 'chat' | 'ocr') => void }) {
  const [activeTab, setActiveTab] = useState<'ocr' | 'stats' | 'language'>('ocr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [textStats, setTextStats] = useState<TextStats | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const worker = await createWorker();
      await worker.reinitialize('eng');
      await worker.reinitialize('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      setExtractedText(text);
      analyzeText(text);
    } catch (error) {
      console.error('Error processing image:', error);
      setExtractedText('Error processing image. Please try again.');
    }
    setIsProcessing(false);
  };

  const analyzeText = (text: string) => {
    setDetectedLanguage('English');
    const stats: TextStats = {
      characters: text.length,
      words: text.trim().split(/\s+/).filter(w => w).length,
      sentences: text.split(/[.!?]+/).filter(s => s.trim()).length,
      paragraphs: text.split(/\n\s*\n/).filter(p => p.trim()).length
    };
    setTextStats(stats);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => onNavigate('home')} className="flex items-center space-x-3 hover:opacity-80">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <ScanText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Jaisu Text Extractor</h1>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ocr')}
              className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
                activeTab === 'ocr'
                  ? 'border-orange-500 text-orange-500 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Extracted Text</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'border-orange-500 text-orange-500 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4" />
                <span>Statistics</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('language')}
              className={`px-4 py-3 border-b-2 transition whitespace-nowrap ${
                activeTab === 'language'
                  ? 'border-orange-500 text-orange-500 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Languages className="w-4 h-4" />
                <span>Language</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-indigo-50 p-4 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-gray-700 text-lg font-medium">Drop your image here or click to upload</p>
                  <p className="text-gray-500 text-sm mt-2">Supports PNG, JPG, JPEG</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {isProcessing && (
                <div className="flex items-center justify-center space-x-3 text-indigo-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-lg">Processing...</span>
                </div>
              )}

              {extractedText && (
                <div className="space-y-6">
                  {activeTab === 'ocr' && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-medium text-gray-800">Extracted Text</h3>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{extractedText}</p>
                    </div>
                  )}

                  {activeTab === 'stats' && textStats && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <BarChart2 className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-medium text-gray-800">Text Statistics</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-gray-500 text-sm">Characters</p>
                          <p className="text-2xl font-semibold text-gray-800">{textStats.characters}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-gray-500 text-sm">Words</p>
                          <p className="text-2xl font-semibold text-gray-800">{textStats.words}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-gray-500 text-sm">Sentences</p>
                          <p className="text-2xl font-semibold text-gray-800">{textStats.sentences}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-gray-500 text-sm">Paragraphs</p>
                          <p className="text-2xl font-semibold text-gray-800">{textStats.paragraphs}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'language' && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Languages className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-medium text-gray-800">Language Detection</h3>
                      </div>
                      <p className="text-gray-700">
                        Detected Language: <span className="font-semibold text-indigo-600">{detectedLanguage}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Developed with ❤️ by <span className="font-medium text-orange-500">Sudhanshu</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;