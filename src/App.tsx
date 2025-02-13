import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Bot, Upload, Send, Loader2, ScanText, MessageSquare, X, Minimize2, Maximize2, Languages, FileText, BarChart2 } from 'lucide-react';
import LanguageDetector from 'languagedetect';

type Message = {
  text: string;
  isBot: boolean;
};

type TextStats = {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
};

function App() {
  const [activeTab, setActiveTab] = useState<'ocr' | 'stats' | 'language'>('ocr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [textStats, setTextStats] = useState<TextStats | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm Jaisu's AI assistant. How can I help you today?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
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
    // Detect language
    const detector = new LanguageDetector();
    const detectedLangs = detector.detect(text, 1);
    setDetectedLanguage(detectedLangs[0]?.[0] || 'Unknown');

    // Calculate statistics
    const stats: TextStats = {
      characters: text.length,
      words: text.trim().split(/\s+/).length,
      sentences: text.split(/[.!?]+/).length - 1,
      paragraphs: text.split(/\n\s*\n/).length
    };
    setTextStats(stats);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, { text: inputMessage, isBot: false }]);
    setInputMessage('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: "I'm a demo AI assistant. I can help you with text extraction and analysis!",
        isBot: true
      }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                Jaisu AI
              </h1>
            </div>
            <div className="bg-gray-100 rounded-lg p-1">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('ocr')}
                  className={`px-4 py-2 rounded-lg transition ${
                    activeTab === 'ocr'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ScanText className="w-4 h-4" />
                    <span>Text Extractor</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-4 py-2 rounded-lg transition ${
                    activeTab === 'stats'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BarChart2 className="w-4 h-4" />
                    <span>Statistics</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('language')}
                  className={`px-4 py-2 rounded-lg transition ${
                    activeTab === 'language'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-blue-50 p-4 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-blue-500" />
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
                <div className="flex items-center justify-center space-x-3 text-blue-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-lg">Processing...</span>
                </div>
              )}

              {extractedText && (
                <div className="space-y-6">
                  {activeTab === 'ocr' && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-medium text-gray-800">Extracted Text</h3>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{extractedText}</p>
                    </div>
                  )}

                  {activeTab === 'stats' && textStats && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <BarChart2 className="w-5 h-5 text-blue-500" />
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
                        <Languages className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-medium text-gray-800">Language Detection</h3>
                      </div>
                      <p className="text-gray-700">
                        Detected Language: <span className="font-semibold text-blue-600">{detectedLanguage}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-blue-500" />
                <span className="font-medium text-gray-800">AI Assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsChatMinimized(!isChatMinimized)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isChatMinimized ? <Maximize2 className="w-4 h-4 text-gray-600" /> : <Minimize2 className="w-4 h-4 text-gray-600" />}
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className={`transition-all duration-300 ${isChatMinimized ? 'h-0' : 'h-96'}`}>
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-2 ${
                          message.isBot
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Developed with ❤️ by{' '}
            <span className="font-medium text-blue-500">
              Sudhanshu
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;