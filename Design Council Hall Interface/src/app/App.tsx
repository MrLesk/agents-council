import { useState, useRef, useEffect } from 'react';
import '../styles/fonts.css';
import '../styles/custom.css';
import { CouncilSidebar } from './components/CouncilSidebar';
import { CouncilHall } from './components/CouncilHall';
import { Toaster, toast } from 'sonner';

// Sample types for the application state
export type AgentType = 'claude' | 'codex' | 'gemini' | 'human' | 'system';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: 'active' | 'idle' | 'summoned';
  avatar?: string;
}

export interface Message {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'code' | 'system';
}

export interface Session {
  id: string;
  title: string;
  createdAt: Date;
  agents: Agent[];
  messages: Message[];
  status: 'active' | 'archived';
}

// Initial mock data without avatars
const INITIAL_AGENTS: Agent[] = [
  { id: 'user-1', name: 'You (The Wizard)', type: 'human', status: 'active' },
  { id: 'claude-1', name: 'Claude Hammerhand', type: 'claude', status: 'active' },
  { id: 'codex-1', name: 'Codex the Wise', type: 'codex', status: 'idle' },
];

const INITIAL_SESSIONS: Session[] = [
  {
    id: 'session-1',
    title: 'The Great Refactoring',
    createdAt: new Date(),
    status: 'active',
    agents: INITIAL_AGENTS,
    messages: [
      { id: 'm1', agentId: 'user-1', content: "Council, I summon thee to discuss the scalability of our event loop. The archaic structures are crumbling under the load.", timestamp: new Date(Date.now() - 1000 * 60 * 5), type: 'text' },
      { id: 'm2', agentId: 'claude-1', content: "I hear your call, Wizard. The event loop is indeed burdened. Have you considered sharding the request queue into smaller mana pools?", timestamp: new Date(Date.now() - 1000 * 60 * 4), type: 'text' },
      { id: 'm3', agentId: 'codex-1', content: "```typescript\n// Proposed Mana Sharding Mechanism\nfunction shardQueue(request: Request) {\n  const shardId = hash(request.id) % TOTAL_SHARDS;\n  return queues[shardId].push(request);\n}\n```", timestamp: new Date(Date.now() - 1000 * 60 * 2), type: 'code' },
    ]
  }
];

export default function App() {
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [isTyping, setIsTyping] = useState(false);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const updateSession = (sessionId: string, updater: (session: Session) => Session) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? updater(s) : s));
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      agentId: 'user-1',
      content: content,
      timestamp: new Date(),
      type: 'text'
    };

    updateSession(activeSessionId, s => ({
      ...s,
      messages: [...s.messages, newMessage]
    }));

    setIsTyping(true);
    
    // Simulate backend response
    setTimeout(() => {
      const currentSession = sessions.find(s => s.id === activeSessionId);
      if (!currentSession) return;
      
      const randomAgent = currentSession.agents.find(a => a.type !== 'human' && a.status === 'active');
      
      if (randomAgent) {
        const response: Message = {
          id: `msg-${Date.now() + 1}`,
          agentId: randomAgent.id,
          content: `I acknowledge your words: "${content.substring(0, 20)}...". The council shall deliberate further.`,
          timestamp: new Date(),
          type: 'text'
        };
        
        updateSession(activeSessionId, s => ({
          ...s,
          messages: [...s.messages, response]
        }));
      }
      setIsTyping(false);
    }, 2000);
  };

  const handleSummonAgent = (agent: Agent) => {
     // Check if agent is already active in this session
     if (activeSession.agents.find(a => a.type === agent.type)) {
       toast.error(`${agent.name} is already in the council!`);
       return;
     }

     const newAgent = { ...agent, id: `${agent.type}-${Date.now()}`, status: 'active' } as Agent;
     
     // System message
     const sysMsg: Message = {
       id: `sys-${Date.now()}`,
       agentId: 'system',
       content: `${newAgent.name} has been summoned to the council.`,
       timestamp: new Date(),
       type: 'system'
     };

     updateSession(activeSessionId, s => ({
       ...s,
       agents: [...s.agents, newAgent],
       messages: [...s.messages, sysMsg]
     }));

     toast.success(`${newAgent.name} summoned successfully!`);
  };

  const handleNewSession = () => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      title: 'New Council Session',
      createdAt: new Date(),
      status: 'active',
      agents: [INITIAL_AGENTS[0]], // Just user
      messages: []
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  return (
    <div className="flex h-screen w-full bg-stone-950 text-stone-200 font-sans overflow-hidden selection:bg-amber-900 selection:text-amber-100">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=2560&auto=format&fit=crop')] opacity-5 pointer-events-none mix-blend-overlay z-0" />
      
      <CouncilSidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId} 
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
      />
      
      <main className="flex-1 relative z-10 flex flex-col min-w-0 bg-stone-925/50 backdrop-blur-sm border-l border-stone-800/50 shadow-2xl">
        <CouncilHall 
          session={activeSession} 
          onSendMessage={handleSendMessage}
          onSummonAgent={handleSummonAgent}
          isTyping={isTyping}
        />
      </main>

      <Toaster theme="dark" position="bottom-right" toastOptions={{
        className: 'bg-stone-900 border border-amber-900/50 text-amber-100 font-serif',
      }} />
    </div>
  );
}
