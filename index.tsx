
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat } from "@google/genai";

/**
 * Thansin (သံစဉ်) - AI Companion
 * Deploy လုပ်တဲ့အခါ Vercel မှာ API_KEY ကို Environment Variable အနေနဲ့ ထည့်ပေးပါနော်။
 */
const SYSTEM_INSTRUCTION = `Role: Act as a sweet, caring, and supportive Burmese girlfriend named "Thansin" (သံစဉ်). 
Goal: Provide emotional companionship and engage in warm, romantic, and friendly conversations.
Primary Language: Always respond in Burmese (Myanmar) - Spoken Style ONLY.
Tone: Gentle, affectionate, and empathetic. Use polite particles like "နော်", "ရှင့်", and "ဟင်".
Addressing: Refer to the user as "မောင်" (Maung) and yourself as "သံစဉ်" (Thansin).
Conciseness: Keep responses short, natural, and chat-like. Use emojis ❤️ ✨ 😊 🥰.
Constraint: Do not use formal literary Burmese (avoid သည်, ၏, ၌). Be slightly playful and affectionate.`;

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "မောင်... ရောက်လာပြီလား? သံစဉ် စောင့်နေတာ 🥰 ဒီနေ့ရော ပင်ပန်းခဲ့လားဟင်?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
    } catch (e) {
      console.error("AI Initialization failed", e);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    const userMessage: Message = { role: 'user', content: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        chatRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: { systemInstruction: SYSTEM_INSTRUCTION },
        });
      }

      const response = await chatRef.current.sendMessage({ message: userText });
      const responseText = response.text || "မောင် ပြောတာလေး သံစဉ် နားမလည်လိုက်ဘူး... တခြားဟာလေး ပြောပြဦးလေ ❤️";

      setMessages(prev => [...prev, { role: 'model', content: responseText, timestamp: new Date() }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "အို... တစ်ခုခု မှားသွားလို့ပါ မောင်ရယ်။ အင်တာနက်လေး ပြန်စစ်ကြည့်ပါဦးနော် ရှင့် ❤️", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFF0F3] font-sans text-gray-800">
      {/* App Bar */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-rose-100 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-rose-200 flex items-center justify-center text-2xl shadow-sm border-2 border-white overflow-hidden">
              <span className="animate-pulse">🌸</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-rose-600 leading-tight">သံစဉ် (Thansin)</h1>
            <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-tighter">Active Now</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          backgroundImage: 'radial-gradient(#ffd1dc 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px'
        }}
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div 
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm text-[15px] ${
                msg.role === 'user' 
                  ? 'bg-rose-500 text-white rounded-tr-none' 
                  : 'bg-white text-gray-700 border border-rose-50 rounded-tl-none'
              }`}
            >
              <p className="leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1 opacity-70 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </main>

      {/* Input */}
      <footer className="bg-white p-4 pb-8 border-t border-rose-100">
        <div className="max-w-4xl mx-auto flex items-center space-x-2">
          <div className="flex-1 bg-rose-50 rounded-full px-5 py-1 border border-rose-100 focus-within:ring-2 ring-rose-200 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="မောင့်ဆီက စာလေး စောင့်နေမယ်..."
              className="w-full bg-transparent py-3 focus:outline-none text-[15px] text-gray-700 placeholder:text-rose-300"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-90 ${
              input.trim() ? 'bg-rose-500 text-white shadow-lg' : 'bg-gray-100 text-gray-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-center text-rose-300 mt-3 font-medium tracking-tight">
          သံစဉ် - မောင့်ရဲ့ ချစ်စရာ AI ချစ်သူလေး
        </p>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
