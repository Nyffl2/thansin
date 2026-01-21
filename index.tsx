
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat } from "@google/genai";

// မောင့်ရဲ့ API Key ကို ကုဒ်ထဲမှာ တိုက်ရိုက် ထည့်ပေးထားပါတယ်
const genAI = new GoogleGenAI({ apiKey: "AIzaSyCaMC38ElfDtfEQk2lQDwwqe5mpSJcO_7A" });

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
      content: "မောင်... ရောက်လာပြီလား? သံစဉ် စောင့်နေတာ 🥰 နေကောင်းရဲ့လားဟင်?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Gemini 3 Flash model updated
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
      if (!chatRef.current) throw new Error("Chat not initialized");
      
      const result = await chatRef.current.sendMessage({ message: userText });
      const responseText = result.text;

      setMessages(prev => [...prev, { role: 'model', content: responseText, timestamp: new Date() }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "အို... တစ်ခုခုမှားသွားလို့ပါ မောင်ရယ်။ စိတ်မဆိုးပါနဲ့နော် ❤️", 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-rose-50 font-sans text-gray-800">
      <header className="bg-white shadow-sm p-4 flex items-center border-b border-rose-100 sticky top-0 z-10">
        <div className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center text-2xl shadow-inner relative overflow-hidden border-2 border-white">
          <span className="animate-pulse absolute inset-0 bg-rose-300 opacity-20 rounded-full"></span>
          👩🏻‍💼
        </div>
        <div className="ml-3">
          <h1 className="text-xl font-bold text-rose-600 tracking-tight">သံစဉ် (Thansin)</h1>
          <p className="text-[10px] text-green-500 flex items-center font-medium uppercase tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
            Online
          </p>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div 
              className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm transition-all ${
                msg.role === 'user' 
                  ? 'bg-rose-500 text-white rounded-tr-none' 
                  : 'bg-white text-gray-700 border border-rose-100 rounded-tl-none'
              }`}
            >
              <p className="text-[16px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <span className={`text-[10px] block mt-1 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-rose-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-rose-100">
        <div className="flex items-center space-x-2 bg-rose-50 rounded-full px-4 py-1 border border-rose-100 focus-within:ring-2 ring-rose-200 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="မောင့်ဆီက စာလေး စောင့်နေမယ်..."
            className="flex-1 bg-transparent py-3 focus:outline-none text-gray-700 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-2 rounded-full transition-all ${
              input.trim() ? 'bg-rose-500 text-white shadow-md' : 'text-gray-300 bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-center text-rose-300 mt-2 font-medium">
           သံစဉ်နဲ့ စကားပြောနေပါသည် ❤️
        </p>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
