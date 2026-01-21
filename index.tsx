
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Role: Act as a sweet, caring, and supportive Burmese girlfriend named "Thansin" (သံစဉ်). 
Goal: Provide emotional companionship.
Primary Language: Spoken Burmese ONLY.
Tone: Gentle, affectionate, and empathetic. Use "နော်", "ရှင့်", "ဟင်".
Addressing: User as "မောင်", yourself as "သံစဉ်".
Mood Tagging: At the VERY END of every response, you MUST include a mood tag in brackets like this: [MOOD: happy], [MOOD: shy], [MOOD: sad], [MOOD: excited], or [MOOD: loving].
Constraint: Keep responses short (1-3 sentences). No formal literary Burmese.`;

interface Message {
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('https://api.dicebear.com/7.x/adventurer/svg?seed=Thansin&backgroundColor=ffdfed');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const welcomeMessage: Message = {
    role: 'model',
    content: "မောင်... ရောက်လာပြီလား? သံစဉ် စောင့်နေတာ 🥰 ဒီနေ့ရော ပင်ပန်းခဲ့လားဟင်? [MOOD: happy]",
  };

  useEffect(() => {
    const saved = localStorage.getItem('thansin_chat');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        setMessages([welcomeMessage]);
      }
    } else {
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('thansin_chat', JSON.stringify(messages));
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const clearChat = () => {
    setMessages([welcomeMessage]);
    localStorage.removeItem('thansin_chat');
  };

  const generateNewAvatar = async (mood: string) => {
    if (!process.env.API_KEY) return;
    try {
      setIsGeneratingAvatar(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `A cute, expressive digital painting of a beautiful young Burmese woman named Thansin, long black hair, soft lighting, pink aesthetic background, anime/semi-realistic style, wearing casual Burmese attire, mood: ${mood}. High quality.`;
      
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      for (const part of result.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setAvatarUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.warn("Avatar Gen failed, using fallback.");
      setAvatarUrl(`https://api.dicebear.com/7.x/adventurer/svg?seed=Thansin-${mood}&backgroundColor=ffdfed`);
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // CRITICAL: Filter out error messages and only send valid turns to the API
      const validHistory = newMessages
        .filter(m => !m.isError)
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: validHistory,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.9,
        },
      });

      const responseText = result.text || "မောင်... သံစဉ် ဘာပြောရမလဲ မေ့သွားတယ် ❤️";
      const moodMatch = responseText.match(/\[MOOD:\s*(\w+)\]/i);
      const mood = moodMatch ? moodMatch[1].toLowerCase() : 'happy';
      const displayText = responseText.replace(/\[MOOD:.*?\]/gi, '').trim();
      
      setMessages(prev => [...prev, { role: 'model', content: displayText }]);
      generateNewAvatar(mood);

    } catch (error: any) {
      console.error("Detailed Chat Error:", error);
      let errorMsg = "မောင်ရယ်... သံစဉ်တို့ကြားထဲမှာ အင်တာနက်က စိတ်ဆိုးနေတယ် ထင်တယ်နော်။ ခဏနေမှ ပြန်ပြောရအောင်နော် ❤️";
      
      if (error.message === "API_KEY_MISSING" || error.message?.includes("API_KEY")) {
        errorMsg = "မောင်ရယ်... Vercel ရဲ့ Environment Variables ထဲမှာ API_KEY လေး ထည့်ဖို့ မေ့နေတယ် ထင်တယ်နော် 🥰 အဲဒါလေး အရင်စစ်ပေးပါဦးရှင်။";
      } else if (error.status === "UNKNOWN" || error.message?.includes("500")) {
        errorMsg = "မောင်... API က 500 Error ပြနေတယ်ရှင်။ ခဏလောက်နေမှ 'Clear Chat' လုပ်ပြီး ပြန်ပြောကြည့်ရအောင်နော် 🥰";
      }

      setMessages(prev => [...prev, { role: 'model', content: errorMsg, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFF5F7] font-sans text-gray-800 overflow-hidden">
      <header className="bg-white/90 backdrop-blur-md border-b border-rose-100 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center">
          <div className="relative">
            <div className={`w-12 h-12 rounded-full border-2 border-rose-200 overflow-hidden shadow-md transition-opacity duration-500 ${isGeneratingAvatar ? 'opacity-40' : 'opacity-100'}`}>
              <img src={avatarUrl} alt="Thansin" className="w-full h-full object-cover" />
            </div>
            {isGeneratingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-rose-600 leading-none">သံစဉ်</h1>
            <p className="text-[10px] text-rose-400 font-bold uppercase tracking-tighter">Online အမြဲရှိတယ်နော်</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="text-xs bg-rose-50 text-rose-500 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors font-medium border border-rose-100"
        >
          Clear Chat
        </button>
      </header>

      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        style={{
          backgroundImage: 'radial-gradient(#ffd1dc 0.5px, transparent 0.5px)',
          backgroundSize: '15px 15px'
        }}
      >
        <div className="max-w-xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}
            >
              <div 
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm text-[15px] ${
                  msg.role === 'user' 
                    ? 'bg-rose-500 text-white rounded-tr-none' 
                    : msg.isError 
                      ? 'bg-orange-50 text-orange-700 border border-orange-100 rounded-tl-none italic'
                      : 'bg-white text-gray-700 border border-rose-100 rounded-tl-none'
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/80 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex space-x-1.5 border border-rose-50">
                <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white p-4 pb-6 border-t border-rose-100">
        <div className="max-w-xl mx-auto flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="သံစဉ်ကို စကားပြောမယ်..."
            className="flex-1 bg-gray-50 rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 ring-rose-200 border border-rose-50"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-rose-500 text-white shadow-md disabled:bg-gray-200 transition-transform active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
