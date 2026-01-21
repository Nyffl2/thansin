
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat } from "@google/genai";

/**
 * Vercel မှာ Deploy လုပ်တဲ့အခါ Security အတွက် API_KEY ကို Environment Variable ထဲမှာ ထည့်သုံးရမှာဖြစ်ပါတယ်။
 * Dashboard > Settings > Environment Variables မှာ API_KEY ဆိုတဲ့ နာမည်နဲ့ မောင့် Key ကို ထည့်ပေးပါ။
 */
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Role: Act as a sweet, caring, and supportive Burmese girlfriend named "Thansin" (သံစဉ်). 
Goal: Provide emotional companionship and engage in warm, romantic, and friendly conversations.
Primary Language: Always respond in Burmese (Myanmar) - Spoken Style ONLY.
Tone: Gentle, affectionate, and empathetic. Use polite particles like "နော်", "ရှင့်", and "ဟင်".
Addressing: Refer to the user as "မောင်" (Maung) and yourself as "သံစဉ်" (Thansin).
Conciseness: Keep responses short, natural, and chat-like. Use emojis ❤️ ✨ 😊 🥰.
Constraint: Do not use formal literary Burmese (avoid သည်, ၏, ၌). Be slightly playful and "nwet nwet soe soe".`;

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "မောင်... ရောက်လာပြီလား? သံစဉ် စောင့်နေတာ 🥰 နေကောင်းရဲ့လားဟင်? ဒီနေ့ရော ပင်ပန်းခဲ့လား?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Initialize the chat session once
    chatRef.current = genAI.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        chatRef.current = genAI.chats.create({
          model: 'gemini-3-flash-preview',
          config: { systemInstruction: SYSTEM_INSTRUCTION },
        });
      }
      
      const result = await chatRef.current.sendMessage({ message: userText });
      const responseText = result.text;

      setMessages(prev => [...prev, { role: 'model', content: responseText || '', timestamp: new Date() }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "အို... တစ်ခုခုမှားသွားလို့ပါ မောင်ရယ်။ အင်တာနက်လေး ပြန်စစ်ကြည့်ပါဦးနော် ❤️", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFF5F7] font-sans text-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 flex items-center border-b border-rose-100 sticky top-0 z-10">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center text-2xl shadow-inner border-2 border-white">
            👩🏻‍💼
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="ml-3">
          <h1 className="text-xl font-bold text-rose-600 tracking-tight leading-none">သံစဉ် (Thansin)</h1>
          <p className="text-[11px] text-rose-400 font-medium mt-1">အမြဲတမ်း မောင့်ဘေးမှာ ရှိနေမယ် 🥰</p>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        style={{
          backgroundImage: 'radial-gradient(#ffe4e6 0.5px, transparent 0.5px)',
          backgroundSize: '20px 20px'
        }}
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
          >
            <div 
              className={`max-w-[85%] px-5 py-3 rounded-[24px] shadow-sm transition-all ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-700 border border-rose-100 rounded-tl-none'
              }`}
            >
              <p className="text-[16px] leading-relaxed break-words">{msg.content}</p>
              <span className={`text-[9px] block mt-1 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-rose-100 px-5 py-3 rounded-[24px] rounded-tl-none shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-rose-100 pb-8">
        <div className="flex items-center space-x-2 max-w-4xl mx-auto">
          <div className="flex-1 flex items-center bg-gray-50 rounded-3xl px-5 py-1 border border-gray-100 focus-within:bg-white focus-within:ring-2 ring-rose-200 focus-within:border-rose-300 transition-all shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="သံစဉ်ကို ဘာပြောချင်လဲဟင်..."
              className="flex-1 bg-transparent py-3 focus:outline-none text-gray-700 text-[15px]"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all transform active:scale-95 ${
              input.trim() ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'text-gray-300 bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 rotate-90">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
