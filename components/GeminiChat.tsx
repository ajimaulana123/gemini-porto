import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

export const GeminiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Aether system online. Querying design parameters. How may I assist?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    const response = await sendMessageToGemini(history, input);

    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-auto">
      {isOpen && (
        <div className="w-80 sm:w-96 bg-black/90 border border-white/20 backdrop-blur-md mb-4 p-4 font-mono text-sm shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
            <span className="text-xs uppercase tracking-widest text-white/60">Aether.ai // v3.0</span>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
              [X]
            </button>
          </div>
          
          <div className="h-64 overflow-y-auto space-y-3 mb-4 scrollbar-hide pr-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-2 ${msg.role === 'user' ? 'bg-white/10 text-white' : 'text-white/70'}`}>
                  <p className="leading-relaxed whitespace-pre-wrap text-xs">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-white/40 text-xs animate-pulse">
                > processing_neural_request...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 border-t border-white/10 pt-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Input query..."
              className="flex-1 bg-transparent border-none outline-none text-white text-xs placeholder-white/20"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="text-white/80 hover:text-white disabled:opacity-30 uppercase text-xs"
            >
              [Send]
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 bg-black/80 border border-white/20 backdrop-blur-sm px-4 py-3 hover:bg-white/5 transition-all duration-300"
      >
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 group-hover:text-white/80 transition-colors">
            {isOpen ? 'Terminate Link' : 'Initialize AI'}
          </span>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
      </button>
    </div>
  );
};
