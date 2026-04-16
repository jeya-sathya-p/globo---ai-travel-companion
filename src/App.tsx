import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Calendar, 
  Utensils, 
  Wallet, 
  Info,
  Trophy,
  ChevronRight,
  X,
  Plane,
  Compass,
  Map as MapIcon,
  Download,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import GloboCharacter from './components/GloboCharacter';
import { getTravelAdvice, speakText, TravelResponse, Destination, ItineraryDay } from './services/geminiService';

// --- Types ---

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'destination' | 'itinerary' | 'clarification';
  destination?: Destination;
  itinerary?: ItineraryDay[];
  questions?: string[];
}

interface UserState {
  xp: number;
  level: number;
  badges: string[];
}

// --- Components ---

interface BadgeProps {
  name: string;
  icon: any;
  key?: React.Key;
}

const Badge = ({ name, icon: Icon }: BadgeProps) => (
  <div className="flex flex-col items-center gap-1 p-2 bg-white/10 rounded-xl border border-white/20 min-w-[80px]">
    <div className="p-2 bg-blue-500/20 rounded-full">
      <Icon className="w-5 h-5 text-blue-400" />
    </div>
    <span className="text-[10px] font-medium text-white/80 uppercase tracking-wider">{name}</span>
  </div>
);

const DestinationCard = ({ destination }: { destination: Destination }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:border-blue-400/50 transition-colors group"
  >
    <div className="relative h-40 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
      <img 
        src={`https://picsum.photos/seed/${destination.name}/800/400`} 
        alt={destination.name}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">{destination.name}</h3>
    </div>
    
    <div className="p-4 space-y-4">
      <p className="text-sm text-white/70 line-clamp-2">{destination.description}</p>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 text-white/60">
          <Calendar className="w-3 h-3 text-blue-400" />
          <span>{destination.bestTimeToVisit}</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <Wallet className="w-3 h-3 text-emerald-400" />
          <span>{destination.estimatedBudget}</span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Top Attractions</span>
        <div className="flex flex-wrap gap-1">
          {destination.topAttractions.slice(0, 3).map(attr => (
            <span key={attr} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-white/80 border border-white/10">
              {attr}
            </span>
          ))}
        </div>
      </div>

      <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
        <MapPin className="w-4 h-4" />
        Explore on Map
      </button>
    </div>
  </motion.div>
);

const ItineraryTimeline = ({ itinerary }: { itinerary: ItineraryDay[] }) => (
  <div className="space-y-6 py-4">
    {itinerary.map((day, idx) => (
      <motion.div 
        key={day.day}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.1 }}
        className="relative pl-8 border-l border-white/20"
      >
        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-900" />
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-blue-400">Day {day.day}</h4>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Utensils className="w-3 h-3" />
              <span>{day.food}</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <span className="text-white/30 w-16 shrink-0">Morning</span>
              <p className="text-white/80">{day.morning}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-white/30 w-16 shrink-0">Afternoon</span>
              <p className="text-white/80">{day.afternoon}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-white/30 w-16 shrink-0">Evening</span>
              <p className="text-white/80">{day.evening}</p>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// --- Main App ---

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "Hello traveler! I'm Globo, your AI travel companion. Where should we explore today? 🌍✈️" 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [globoState, setGloboState] = useState<'idle' | 'thinking' | 'happy' | 'explaining' | 'greeting'>('idle');
  const [userState, setUserState] = useState<UserState>({
    xp: 0,
    level: 1,
    badges: []
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSendMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);
    setGloboState('thinking');

    const history = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await getTravelAdvice(text, history);
    
    setIsThinking(false);
    setGloboState(response.type === 'itinerary' || response.type === 'destination' ? 'happy' : 'explaining');

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      type: response.type,
      destination: response.destination,
      itinerary: response.itinerary,
      questions: response.questions
    };

    setMessages(prev => [...prev, assistantMessage]);

    if (isSpeechEnabled) {
      speakText(response.content);
    }

    setTimeout(() => setGloboState('idle'), 3000);
  };

  const updateXP = (amount: number) => {
    setUserState(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      if (newLevel > prev.level) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const unlockBadge = (badge: string) => {
    setUserState(prev => ({
      ...prev,
      badges: [...prev.badges, badge]
    }));
    confetti({
      particleCount: 150,
      spread: 100,
      colors: ['#3B82F6', '#60A5FA', '#FBBF24']
    });
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const quickReplies = [
    "Plan a Trip",
    "Best Places Near Me",
    "Budget Travel",
    "Local Food",
    "Hidden Gems",
    "Travel Tips"
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        
        {/* Animated Clouds/Elements */}
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 opacity-10"
        >
          <Plane className="w-12 h-12 rotate-45" />
        </motion.div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>Next-Gen Travel AI</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
              AI TRAVEL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                GUIDE
              </span>
            </h1>
            
            <p className="text-xl text-white/60 max-w-lg leading-relaxed">
              Your smart companion for every journey. Discover hidden gems, plan perfect itineraries, and explore the world with Globo.
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => { setIsChatOpen(true); setGloboState('greeting'); }}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-3"
              >
                Start Planning Trip
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <img 
                      key={i} 
                      src={`https://i.pravatar.cc/100?u=${i}`} 
                      className="w-10 h-10 rounded-full border-2 border-[#0a0f1e]" 
                      alt="User"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold">2.4k+ Explorers</p>
                  <p className="text-white/40">Joined this week</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex justify-center"
          >
            <div className="relative z-10">
              <GloboCharacter state={globoState} />
              <div className="mt-8 text-center space-y-2">
                <h2 className="text-2xl font-bold">I'm Globo!</h2>
                <p className="text-white/40 italic">"Ready for takeoff?"</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Chat Interface Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-4xl h-[85vh] bg-[#12182b] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                    <GloboCharacter state={globoState} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Globo AI</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs text-white/40">Online & Ready</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      isSpeechEnabled ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/40"
                    )}
                  >
                    {isSpeechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setIsChatOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex flex-col gap-2",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>

                    {/* Structured Content Rendering */}
                    {msg.type === 'destination' && msg.destination && (
                      <div className="w-full max-w-md mt-2">
                        <DestinationCard destination={msg.destination} />
                      </div>
                    )}

                    {msg.type === 'itinerary' && msg.itinerary && (
                      <div className="w-full mt-2">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            Your Itinerary
                          </h4>
                          <div className="flex gap-2">
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 transition-colors">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <ItineraryTimeline itinerary={msg.itinerary} />
                      </div>
                    )}

                    {msg.questions && msg.questions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.questions.map(q => (
                          <button 
                            key={q}
                            onClick={() => handleSendMessage(q)}
                            className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400 hover:bg-blue-500/20 transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {isThinking && (
                  <div className="flex items-start gap-3">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white/5 border-t border-white/5">
                {messages.length < 3 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quickReplies.map(reply => (
                      <button 
                        key={reply}
                        onClick={() => handleSendMessage(reply)}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60 hover:bg-white/10 hover:text-white transition-all"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleListening}
                    className={cn(
                      "p-4 rounded-2xl transition-all",
                      isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-white/40 hover:bg-white/10"
                    )}
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask Globo anything about travel..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                    <button 
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isThinking}
                      className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Trigger (Mobile/Minimized) */}
      {!isChatOpen && (
        <motion.button 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center justify-center border border-white/20 group"
        >
          <Compass className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0f1e]" />
        </motion.button>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">Globo</span>
          </div>
          
          <div className="flex gap-8 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Destinations</a>
            <a href="#" className="hover:text-white transition-colors">Itineraries</a>
            <a href="#" className="hover:text-white transition-colors">Community</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          
          <p className="text-xs text-white/20">© 2026 Globo AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
