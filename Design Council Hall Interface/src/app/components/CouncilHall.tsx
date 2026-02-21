import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, UserPlus, X, Swords, Scroll, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Agent, Session, Message } from '../App';
import { MessageBubble } from './MessageBubble';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import councilBg from 'figma:asset/66ba6bfd4ef0c966b88108bfcfa55d772f8ba674.png';

interface CouncilHallProps {
  session: Session;
  onSendMessage: (content: string) => void;
  onSummonAgent: (agent: Agent) => void;
  isTyping: boolean;
}

const AVAILABLE_AGENTS: Agent[] = [
  { id: 'claude-new', name: 'Claude Hammerhand', type: 'claude', status: 'idle' },
  { id: 'codex-new', name: 'Codex the Wise', type: 'codex', status: 'idle' },
  { id: 'gemini-new', name: 'Gemini Starborn', type: 'gemini', status: 'idle' },
];

export function CouncilHall({ session, onSendMessage, onSummonAgent, isTyping }: CouncilHallProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSummonOpen, setIsSummonOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeAgents = session.agents;
  const messages = session.messages;

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleSummon = (agent: Agent) => {
    onSummonAgent(agent);
    setIsSummonOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-stone-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <img src={councilBg} alt="" className="w-full h-full object-cover opacity-10 blur-[1px] mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/40" />
      </div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none z-0 mix-blend-multiply" />

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-stone-800 bg-stone-950/80 backdrop-blur-md z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-amber-900/20 rounded-lg border border-amber-900/30">
            <Swords className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-200 tracking-wide">{session.title}</h2>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Council In Session</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-3 mr-4">
            {activeAgents.slice(0, 5).map((agent, i) => (
              <div 
                key={agent.id} 
                className="w-8 h-8 rounded-full border-2 border-stone-900 bg-stone-800 relative z-[5] hover:z-10 transition-all hover:scale-110"
                style={{ zIndex: 10 - i }}
                title={agent.name}
              >
                {agent.avatar ? (
                  <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-stone-400 font-bold">
                    {agent.name[0]}
                  </div>
                )}
              </div>
            ))}
            {activeAgents.length > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-stone-900 bg-stone-800 flex items-center justify-center text-xs text-stone-400 z-0">
                +{activeAgents.length - 5}
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsSummonOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 rounded-lg transition-all text-sm font-medium shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Summon Agent</span>
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative z-10 scroll-smooth" 
        ref={scrollRef}
      >
        <div className="max-w-4xl mx-auto pb-4">
           {/* Welcome / Start of Session */}
           <div className="text-center py-10 opacity-50">
             <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-800">
               <Scroll className="w-8 h-8 text-stone-600" />
             </div>
             <p className="text-stone-500 text-sm font-serif italic">
               The council has convened on {session.createdAt.toLocaleDateString()}.<br/>
               The scribe is recording the proceedings.
             </p>
           </div>

           {messages.map((msg) => {
             const agent = activeAgents.find(a => a.id === msg.agentId) || { id: 'unknown', name: 'Unknown', type: 'system', status: 'idle' } as Agent;
             // If not found, check if it's the current user
             const finalAgent = msg.agentId === 'user-1' 
                ? activeAgents.find(a => a.id === 'user-1') || { id: 'user-1', name: 'You', type: 'human', status: 'active' } as Agent 
                : agent;

             return <MessageBubble key={msg.id} message={msg} agent={finalAgent} />;
           })}
           
           {isTyping && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex items-center gap-2 text-stone-500 text-xs pl-4 font-mono"
             >
               <span className="w-2 h-2 rounded-full bg-stone-600 animate-bounce" style={{ animationDelay: '0ms' }} />
               <span className="w-2 h-2 rounded-full bg-stone-600 animate-bounce" style={{ animationDelay: '150ms' }} />
               <span className="w-2 h-2 rounded-full bg-stone-600 animate-bounce" style={{ animationDelay: '300ms' }} />
               <span className="ml-2">The council is deliberating...</span>
             </motion.div>
           )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-stone-950 border-t border-stone-800 relative z-20">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Address the council..."
            className="w-full bg-stone-900/50 text-stone-200 placeholder:text-stone-600 border border-stone-700 rounded-xl p-4 pr-14 min-h-[60px] max-h-40 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-900/50 resize-none font-sans shadow-inner transition-all"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="absolute right-3 bottom-3 p-2 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center mt-2 text-[10px] text-stone-600 font-mono">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      {/* Summon Modal */}
      <AnimatePresence>
        {isSummonOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/50">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-stone-200">Summon Agent</h3>
                </div>
                <button onClick={() => setIsSummonOpen(false)} className="text-stone-500 hover:text-stone-300">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {AVAILABLE_AGENTS.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleSummon(agent)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-stone-800 border border-transparent hover:border-stone-700 transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-600 overflow-hidden flex-shrink-0 flex items-center justify-center text-stone-400 font-bold">
                       {agent.avatar ? (
                         <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                       ) : (
                         <span>{agent.name[0]}</span>
                       )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-stone-300 group-hover:text-amber-400 transition-colors">{agent.name}</div>
                      <div className="text-xs text-stone-500 capitalize">{agent.type} Agent</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 text-xs font-bold uppercase tracking-wider">
                      Summon
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
