import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  GraduationCap,
  Calendar,
  Layers
} from 'lucide-react';
import API from '../../services/api';

export default function AIAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your Academic AI Agent assistant. Ask me anything about your timetable, attendance, notes summary, quizzes, or exam revision strategies!",
      suggestions: ['Check my attendance shortage', 'Show today\'s classes', 'Generate AI quiz', 'Create study flashcards']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const { data } = await API.post('/ai/chat', { prompt: textToSend });
      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: data.answer,
            quiz: data.quiz,
            flashcards: data.flashcards,
            suggestions: data.suggestions || ['Ask another question', 'Generate study plan']
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: "Sorry, I had trouble processing that request. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl h-[85vh] sm:h-[650px] glass-panel rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/70 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base gradient-text">Academic AI Copilot</h3>
                <p className="text-xs text-slate-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
                  <span>Online & Ready</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-primary to-primary-700 text-white rounded-br-none shadow-md shadow-primary/20'
                      : 'glass-card text-slate-900 dark:text-slate-100 rounded-bl-none border border-white/20 dark:border-slate-700/60'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Render AI Quiz Component */}
                  {msg.quiz && (
                    <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-accent">Self Assessment Drill</h4>
                      {msg.quiz.map((q, qIdx) => (
                        <div key={qIdx} className="p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl space-y-2">
                          <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">{qIdx + 1}. {q.question}</p>
                          <div className="space-y-1">
                            {q.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => alert(oIdx === q.answerIndex ? '✅ Correct! ' + q.explanation : '❌ Incorrect. Try again!')}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs bg-white/60 dark:bg-slate-700/60 hover:bg-primary/20 transition-colors"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render AI Flashcards */}
                  {msg.flashcards && (
                    <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-secondary">High-Yield Flashcards</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.flashcards.map((fc, fcIdx) => (
                          <div key={fcIdx} className="p-3 bg-slate-900/60 text-white rounded-xl border border-secondary/30">
                            <p className="text-xs font-bold text-secondary">{fc.front}</p>
                            <p className="text-xs mt-1 text-slate-300">{fc.back}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Chips Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug)}
                        className="text-[11px] font-medium px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all backdrop-blur-sm"
                      >
                        ⚡ {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 p-4 glass-card rounded-2xl w-fit">
                <Sparkles className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs font-medium text-slate-400">AI is reasoning...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 glass-panel border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about classes, attendance shortage, assignments, or study plans..."
                className="flex-1 glass-input text-xs sm:text-sm"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 rounded-xl gradient-btn disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
