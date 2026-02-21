import { Agent, Message } from '../App';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { User, Code, Terminal, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  agent: Agent;
}

export function MessageBubble({ message, agent }: MessageBubbleProps) {
  const isHuman = agent.type === 'human';
  const isSystem = agent.type === 'system';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-4 p-4 rounded-xl mb-4 max-w-4xl mx-auto w-full group relative",
        isHuman ? "flex-row-reverse" : "flex-row",
        isSystem ? "bg-stone-900/30 border border-stone-800/50 text-stone-500 text-sm justify-center py-2" : "hover:bg-stone-900/20 transition-colors"
      )}
    >
      {!isSystem && (
        <div className={cn("flex-shrink-0 relative", isHuman ? "ml-2" : "mr-2")}>
          <div className={cn(
            "w-10 h-10 rounded-full border-2 overflow-hidden shadow-lg flex items-center justify-center relative z-10",
            agent.type === 'claude' ? "border-amber-600 bg-amber-950" :
            agent.type === 'codex' ? "border-blue-600 bg-blue-950" :
            isHuman ? "border-emerald-600 bg-emerald-950" : "border-stone-600 bg-stone-800"
          )}>
            {agent.avatar ? (
              <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-white/80">
                {agent.type === 'claude' && <Bot className="w-6 h-6" />}
                {agent.type === 'codex' && <Code className="w-6 h-6" />}
                {isHuman && <User className="w-6 h-6" />}
              </div>
            )}
          </div>
          
          {/* Rank/Status indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-stone-950 flex items-center justify-center text-[8px] font-bold text-white",
            agent.type === 'claude' ? "bg-amber-600" :
            agent.type === 'codex' ? "bg-blue-600" :
            isHuman ? "bg-emerald-600" : "bg-stone-600"
          )}>
            {agent.type === 'claude' ? 'C' : agent.type === 'codex' ? 'X' : agent.type === 'human' ? 'H' : '?'}
          </div>
        </div>
      )}

      <div className={cn(
        "flex flex-col min-w-0 max-w-[80%]",
        isHuman ? "items-end text-right" : "items-start",
        isSystem && "items-center text-center w-full"
      )}>
        {!isSystem && (
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-sm font-bold tracking-wide",
              agent.type === 'claude' ? "text-amber-500" :
              agent.type === 'codex' ? "text-blue-400" :
              isHuman ? "text-emerald-400" : "text-stone-400"
            )}>
              {agent.name}
            </span>
            <span className="text-xs text-stone-600 font-mono">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        <div className={cn(
          "text-stone-300 leading-relaxed font-sans",
          isSystem ? "italic" : "",
          message.type === 'code' ? "w-full text-left" : ""
        )}>
          {message.type === 'code' ? (
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-4 font-mono text-sm overflow-x-auto shadow-inner relative group/code mt-2">
               <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                  <div className="px-2 py-1 bg-stone-800 text-xs text-stone-400 rounded">Copy</div>
               </div>
               <pre className="whitespace-pre-wrap break-words text-blue-200">
                 {message.content.replace(/```\w*\n?|```/g, '')}
               </pre>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
