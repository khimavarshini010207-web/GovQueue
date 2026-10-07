import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Loader2, FileText, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';
import type { AIGuideResponse } from '../../shared/types.js';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  guide?: AIGuideResponse;
  timestamp: string;
}

interface GovGuideChatProps {
  onClose?: () => void;
  standalone?: boolean;
}

export const GovGuideChat: React.FC<GovGuideChatProps> = ({ onClose, standalone = false }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am GovGuide AI, your official digital assistant for public service discovery. Tell me what civic service or document you need help with, and I will guide you to the right department.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    'I moved to a new address. Which service should I use?',
    'How do I get an income certificate for college scholarship?',
    'What documents should I prepare for a birth certificate?',
    'I need help with renewing my driving licence.',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askGovGuide(textToSend, conversationId);
      if (res.conversationId) {
        setConversationId(res.conversationId);
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        guide: res,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'AI guidance is temporarily unavailable. Please browse our service catalog directly or try rephrasing your query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${standalone ? 'h-[620px] max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-xl' : 'h-full bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 backdrop-blur-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">GovGuide AI</h2>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-400 text-blue-950 rounded-full">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-blue-200">Official Citizen Service Advisory System</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close GovGuide"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.sender === 'user' ? (
              <div className="max-w-[85%] bg-blue-700 text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-xs text-sm">
                <p>{msg.text}</p>
                <span className="text-[10px] text-blue-200 mt-1 block text-right">{msg.timestamp}</span>
              </div>
            ) : (
              <div className="max-w-[92%] bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl rounded-tl-xs shadow-xs text-sm">
                {msg.text && <p className="leading-relaxed">{msg.text}</p>}

                {msg.guide && (
                  <div className="space-y-3.5">
                    {/* Intent summary */}
                    <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                      Recommendation for: {msg.guide.intent}
                    </div>

                    {/* Recommendation Card */}
                    <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                          Recommended Service
                        </span>
                        <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {Math.round(msg.guide.confidence * 100)}% Match
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mb-1.5">
                        {msg.guide.recommendedServiceName}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{msg.guide.reason}</p>
                    </div>

                    {/* Required Documents Checklist */}
                    {msg.guide.requiredDocuments.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Required Documents Checklist:</span>
                        </div>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {msg.guide.requiredDocuments.map((doc, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-blue-600 font-bold">•</span>
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quick CTA Actions */}
                    {msg.guide.recommendedServiceId && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (onClose) onClose();
                            navigate(`/book?serviceId=${msg.guide!.recommendedServiceId}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Appointment</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onClose) onClose();
                            navigate(`/services/${msg.guide!.recommendedServiceId}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          <span>View Service Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <AlertCircle className="w-3 h-3 text-slate-400" />
                      <span>Advisory guidance only. Official verification takes place at the service center.</span>
                    </div>
                  </div>
                )}
                <span className="text-[10px] text-slate-400 mt-2 block">{msg.timestamp}</span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl max-w-xs shadow-xs text-xs text-slate-500">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span>Analyzing service catalog and policies...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts if few messages */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Suggested Citizen Inquiries:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q)}
                className="text-xs bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input box */}
      <div className="p-3 bg-white border-t border-slate-200 rounded-b-2xl">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about address updates, certificates, licences, PAN..."
            className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
