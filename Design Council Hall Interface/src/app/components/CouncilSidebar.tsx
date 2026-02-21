import { Scroll, Plus, Users, Search, MoreVertical, Archive } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Agent, Session } from '../App';

interface CouncilSidebarProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export function CouncilSidebar({ sessions, activeSessionId, onSelectSession, onNewSession }: CouncilSidebarProps) {
  return (
    <div className="w-80 flex flex-col h-full bg-stone-950 border-r border-stone-800 shadow-2xl z-20">
      {/* Header */}
      <div className="p-4 border-b border-stone-800 bg-stone-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-800 flex items-center justify-center shadow-lg shadow-amber-900/20 border border-amber-500/30">
            <Users className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-amber-100 tracking-wide font-cinzel">Agents Council</h1>
            <p className="text-xs text-stone-500">Collaborative Intelligence</p>
          </div>
        </div>

        <button 
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-900/20 hover:bg-amber-900/30 text-amber-200 border border-amber-800/50 rounded-lg transition-all duration-300 group shadow-[0_0_15px_rgba(146,64,14,0.1)] hover:shadow-[0_0_20px_rgba(146,64,14,0.2)]"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium text-sm tracking-wide">Spawn Session</span>
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div className="px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Scroll className="w-3 h-3" />
          <span>Active Chronicles</span>
        </div>
        
        <div className="space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "w-full text-left px-3 py-3 rounded-lg flex items-start gap-3 transition-all duration-200 group relative overflow-hidden",
                activeSessionId === session.id 
                  ? "bg-stone-900 border border-stone-700/50 shadow-inner" 
                  : "hover:bg-stone-900/50 hover:border-stone-800/50 border border-transparent"
              )}
            >
              <div className={cn(
                "mt-0.5 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]",
                activeSessionId === session.id ? "text-amber-500 bg-amber-500" : "text-stone-700 bg-stone-700 group-hover:bg-stone-600"
              )} />
              
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "text-sm font-medium truncate transition-colors",
                  activeSessionId === session.id ? "text-amber-100" : "text-stone-400 group-hover:text-stone-300"
                )}>
                  {session.title}
                </h3>
                <p className="text-xs text-stone-600 truncate mt-0.5 flex items-center gap-2">
                  <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  <span className="w-1 h-1 rounded-full bg-stone-700" />
                  <span>{session.agents.length} Agents</span>
                </p>
              </div>

              {activeSessionId === session.id && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-700 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 px-3 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Archive className="w-3 h-3" />
          <span>Archives</span>
        </div>
        <div className="px-4 py-8 text-center text-stone-700 text-sm italic">
          No archived scrolls found.
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stone-800 bg-stone-950/80">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-stone-900 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 overflow-hidden relative">
            {/* User Avatar Placeholder */}
            <div className="absolute inset-0 bg-stone-700 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-stone-300">Human Operative</div>
            <div className="text-xs text-stone-500">Online</div>
          </div>
          <MoreVertical className="w-4 h-4 text-stone-600" />
        </div>
      </div>
    </div>
  );
}
