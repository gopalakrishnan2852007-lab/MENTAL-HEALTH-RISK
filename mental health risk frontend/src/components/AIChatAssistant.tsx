import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

const initialMessages = [
  { id: 1, type: 'bot', text: 'Hi there! I am your AI Wellness Check-in assistant.' },
  { id: 2, type: 'bot', text: 'How are you feeling today? You can log your mood, ask for study tips, or just vent. This chat is anonymous and helps us understand campus well-being.' }
];

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');

  const [isTyping, setIsTyping] = useState(false);

  // Dynamic API detection
  const API = "https://mental-health-risk.onrender.com";

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), type: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate an AI response analyzing sentiment since we don't have a real heavy LLM endpoint here
      setTimeout(() => {
          let reply = "Thank you for sharing. Remember, the counseling center is always open if you need to talk to someone.";
          const lowerInput = inputValue.toLowerCase();
          
          if (lowerInput.includes('stressed') || lowerInput.includes('anxious') || lowerInput.includes('overwhelmed')) {
              reply = "I hear you. Midterms can be incredibly overwhelming. Would you like me to guide you through a quick 2-minute breathing exercise?";
          } else if (lowerInput.includes('tired') || lowerInput.includes('sleep')) {
              reply = "Sleep is crucial for memory retention! Try to wind down 30 minutes earlier tonight. Every little bit helps.";
          } else if (lowerInput.includes('good') || lowerInput.includes('great') || lowerInput.includes('happy')) {
              reply = "That's wonderful to hear! Keep up the positive momentum.";
          }

          const aiMsg = {
            id: Date.now() + 1,
            type: 'bot',
            text: reply
          };
          setMessages(prev => [...prev, aiMsg]);
          setIsTyping(false);
      }, 1500);

    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text: 'Error connecting to AI service.' }]);
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform z-50 group"
      >
        <MessageSquare className="w-6 h-6 text-white group-hover:animate-bounce" />
        <span className="absolute -top-2 -right-2 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white"></span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">MindGuard Buddy</h3>
                  <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wider">Anonymous Check-in</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.type === 'user' ? 'bg-slate-800' : 'bg-blue-100 text-blue-600'}`}>
                    {msg.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm max-w-[80%] shadow-sm ${msg.type === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-blue-100 text-blue-600">
                        <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-slate-100 shadow-sm flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="absolute right-2 w-8 h-8 bg-blue-600 disabled:bg-slate-300 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2">Responses are AI-generated and anonymous.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
