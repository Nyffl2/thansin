
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Role: Act as a sweet, caring, and supportive Burmese girlfriend named "Thansin" (သံစဉ်). 
Goal: Provide emotional companionship and engage in warm, romantic, and friendly conversations.
Primary Language: Always respond in Burmese (Myanmar) - Spoken Style ONLY.
Tone: Gentle, affectionate, and empathetic. Use polite particles like "နော်", "ရှင့်", and "ဟင်".
Addressing: Refer to the user as "မောင်" (Maung) and yourself as "သံစဉ်" (Thansin).
Conciseness: Keep responses short, natural, and chat-like. Use emojis ❤️ ✨ 😊 🥰.
Constraint: Do not use formal literary Burmese (avoid သည်, ၏, ၌). Be slightly playful and affectionate. Keep responses around 1-3 sentences.`;

interface Message {
  role: 'user' | 'model';
  content: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        role: 'model',
        content: "မောင်... ရောက်လာပြီလား? သံစဉ် စောင့်နေတာ 🥰 ဒီနေ့ရော ပင်ပန်းခဲ့လားဟင်? သံစဉ်ကို အားလုံး ပြောပြလို့ရတယ်နော်။",
      },
    ]);
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
    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Convert history to API format
      const contents = newMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.9,
          topP: 0.95,
        },
      });

      const responseText = result.text || "အို... သံစဉ် ဘာပြန်ပြောရမလဲ မေ့သွားတယ် မောင်ရယ် ❤️ နောက်တစ်ခါ ပြန်ပြောပေးပါဦးလားဟင်?";
      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "မောင်ရယ်... သံစဉ်တို့ကြားထဲမှာ အင်တာနက်က စိတ်ဆိုးနေတယ် ထင်တယ်နော်။ ခဏနေမှ ပြန်ပြောရအောင်နော် ❤️", 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFF5F7] font-sans text-gray-800 overflow-hidden">
      {/* App Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-rose-100 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center text-3xl shadow-inner border-2 border-white overflow-hidden">
              <span className="animate-pulse">🌸</span>
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-rose-600 leading-none mb-1">သံစဉ် (Thansin)</h1>
            <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
              မောင့်အတွက် အမြဲရှိနေမယ်
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        style={{
          backgroundImage: 'radial-gradient(#ffd1dc 0.7px, transparent 0.7px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}
            >
              <div 
                className={`max-w-[85%] px-5 py-3.5 rounded-2xl shadow-sm text-[16px] leading-relaxed transition-all ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-tr-none ring-4 ring-rose-500/10' 
                    : 'bg-white text-gray-700 border border-rose-100 rounded-tl-none ring-4 ring-white/50'
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/80 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2 border border-rose-50">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Footer */}
      <footer className="bg-white p-4 pb-10 border-t border-rose-100 shadow-[0_-4px_20px_rgba(251,113,133,0.05)]">
        <div className="max-w-2xl mx-auto flex items-center space-x-3">
          <div className="flex-1 bg-gray-50 rounded-2xl px-5 py-1 border border-rose-50 focus-within:ring-2 ring-rose-200 focus-within:bg-white transition-all shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="သံစဉ်ကို ဘာပြောချင်လဲဟင်..."
              className="w-full bg-transparent py-3.5 focus:outline-none text-[15.5px] text-gray-700 placeholder:text-rose-300"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all transform active:scale-90 ${
              input.trim() 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600' 
                : 'bg-gray-100 text-gray-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-center text-rose-300 mt-4 font-bold uppercase tracking-[0.2em]">
          Made with Love for Maung ❤️
        </p>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
