
import React, { useState, useEffect } from 'react';
import { generateExcuse } from './services/geminiService';
import { ExcuseRequest, Tone, ReasonType, Recipient, GeneratedExcuse } from './types';
import AIChatBox from './components/AIChatBox';

const TONES: Tone[] = ['Professional', 'Dramatic', 'Funny', 'Apologetic', 'Short & Blunt', 'Casual', 'Custom...'];
const REASON_TYPES: ReasonType[] = ['Transport', 'Family', 'Technical', 'Creative', 'Honest-ish', 'Work-related', 'Custom...'];
const RECIPIENTS: Recipient[] = ['Boss', 'Teacher', 'Partner', 'Friend', 'Client', 'Parent', 'Custom...'];
const SITUATIONS = [
  "Late for work/class",
  "Missed a meeting",
  "Missed a social event",
  "Project delay",
  "Late for a date",
  "Didn't do assigned task",
  "Need to leave early",
  "Custom..."
];

const Logo = () => (
  <div className="relative flex flex-col items-center group">
    {/* Animated Background Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-400/10 rounded-full blur-[60px] group-hover:bg-slate-400/20 transition-all duration-700"></div>
    
    {/* SVG Logo Container */}
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan */}
            <stop offset="50%" stopColor="#64748b" /> {/* Slate-500 */}
            <stop offset="100%" stopColor="#1e293b" /> {/* Slate-800 */}
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer Tech Rings */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#logoGradient)" strokeWidth="0.5" strokeOpacity="0.4" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="url(#logoGradient)" strokeWidth="1.2" strokeDasharray="2 4" strokeLinecap="round" />
        
        {/* Tech Dots on Ring */}
        <circle cx="50" cy="8" r="1" fill="#22d3ee" />
        <circle cx="50" cy="92" r="1" fill="#1e293b" />
        <circle cx="8" cy="50" r="1" fill="url(#logoGradient)" />
        <circle cx="92" cy="50" r="1" fill="url(#logoGradient)" />
        
        {/* The Circuit Bulb */}
        <path 
          d="M50 20 C38 20 30 28 30 40 C30 50 35 55 38 60 L38 72 C38 74 40 76 42 76 L58 76 C60 76 62 74 62 72 L62 60 C65 55 70 50 70 40 C70 28 62 20 50 20 Z" 
          fill="none" 
          stroke="url(#logoGradient)" 
          strokeWidth="2.5"
          filter="url(#glow)"
        />
        
        {/* Circuit Patterns inside Bulb */}
        <path d="M50 25 V45" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <path d="M42 32 Q45 40 40 48" stroke="url(#logoGradient)" strokeWidth="0.8" fill="none" opacity="0.6" />
        <path d="M58 32 Q55 40 60 48" stroke="url(#logoGradient)" strokeWidth="0.8" fill="none" opacity="0.6" />
        <circle cx="50" cy="38" r="1.5" fill="url(#logoGradient)" />
        <circle cx="40" cy="48" r="1.2" fill="url(#logoGradient)" />
        <circle cx="60" cy="48" r="1.2" fill="url(#logoGradient)" />
        
        {/* Bulb Base */}
        <rect x="42" y="78" width="16" height="3" rx="1.5" fill="url(#logoGradient)" />
        <rect x="44" y="83" width="12" height="3" rx="1.5" fill="url(#logoGradient)" />
        <rect x="46" y="88" width="8" height="3" rx="1.5" fill="url(#logoGradient)" />
      </svg>
    </div>

    {/* Typography matches provided image */}
    <div className="mt-4 text-center">
      <h1 className="text-6xl font-[1000] text-slate-900 tracking-tight leading-none uppercase">
        EXCUSE
      </h1>
      <div className="flex items-center justify-center gap-1.5 mt-1">
        <span className="text-slate-800 font-black text-2xl tracking-[0.1em] uppercase">PR</span>
        {/* Chat bubble icon for the 'O' in PRO */}
        <div className="bg-slate-800 rounded-lg p-1.5 flex items-center justify-center shadow-lg shadow-slate-200">
           <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
             <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
             <text x="5" y="14" fontSize="8" fontWeight="bold" fill="white" fontFamily="sans-serif">AI</text>
           </svg>
        </div>
        <span className="text-slate-800 font-black text-2xl tracking-[0.1em] uppercase"> AI</span>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [customSituation, setCustomSituation] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [customTone, setCustomTone] = useState('');
  
  const [selectedSituation, setSelectedSituation] = useState(SITUATIONS[0]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient>(RECIPIENTS[0]);
  const [selectedReason, setSelectedReason] = useState<ReasonType>(REASON_TYPES[0]);
  const [selectedTone, setSelectedTone] = useState<Tone>(TONES[0]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  
  const [generatedExcuses, setGeneratedExcuses] = useState<GeneratedExcuse[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('excuse_pro_v1_history');
    if (saved) {
      try {
        setGeneratedExcuses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('excuse_pro_v1_history', JSON.stringify(generatedExcuses));
  }, [generatedExcuses]);

  const handleGenerate = async () => {
    setLoading(true);
    const finalSituation = selectedSituation === 'Custom...' ? customSituation : selectedSituation;
    const finalRecipient = selectedRecipient === 'Custom...' ? customRecipient : selectedRecipient;
    const finalReason = selectedReason === 'Custom...' ? customReason : selectedReason;
    const finalTone = selectedTone === 'Custom...' ? customTone : selectedTone;
    
    const request: ExcuseRequest = {
      situation: finalSituation,
      recipient: finalRecipient,
      reasonType: finalReason,
      tone: finalTone,
      additionalDetails
    };

    try {
      const text = await generateExcuse(request);
      const newExcuse: GeneratedExcuse = {
        id: Math.random().toString(36).substring(7),
        text,
        timestamp: Date.now(),
        isFavorite: false
      };
      setGeneratedExcuses(prev => [newExcuse, ...prev]);
      setShowFavoritesOnly(false);
    } catch (error) {
      console.error(error);
      alert("AI limit reached or connection lost. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const toggleFavorite = (id: string) => {
    setGeneratedExcuses(prev => prev.map(e => 
      e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
    ));
  };

  const deleteExcuse = (id: string) => {
    setGeneratedExcuses(prev => prev.filter(e => e.id !== id));
  };

  const filteredExcuses = showFavoritesOnly 
    ? generatedExcuses.filter(e => e.isFavorite) 
    : generatedExcuses;

  return (
    <div className="min-h-screen pb-24 pt-10 px-4 md:px-6 bg-slate-50 selection:bg-slate-200 selection:text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-16 relative">
          <Logo />
          <p className="mt-8 text-slate-400 text-lg font-bold max-w-sm mx-auto leading-tight opacity-70">
            Intelligent excuses. Perfectly phrased. <br/>100% human-sounding.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Form Section */}
          <section className="lg:col-span-5 space-y-8 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -z-0"></div>
            
            <div className="space-y-7 relative z-10">
              {/* Situation Field */}
              <div className="group">
                <label className="block text-[11px] font-black text-slate-800 uppercase tracking-[0.25em] mb-4 group-focus-within:text-slate-900 transition-colors">Situation</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-slate-800 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer shadow-sm"
                    value={selectedSituation}
                    onChange={(e) => setSelectedSituation(e.target.value)}
                  >
                    {SITUATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {selectedSituation === 'Custom...' && (
                  <input 
                    type="text"
                    placeholder="Describe your situation..."
                    className="w-full mt-4 bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-slate-800 focus:bg-white focus:outline-none transition-all animate-in slide-in-from-top-2 font-bold text-slate-800 shadow-sm"
                    value={customSituation}
                    onChange={(e) => setCustomSituation(e.target.value)}
                  />
                )}
              </div>

              {/* Excuse For Field */}
              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase tracking-[0.25em] mb-4">Excuse For</label>
                <div className="flex flex-wrap gap-2.5">
                  {RECIPIENTS.map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRecipient(r)}
                      className={`px-4 py-2.5 text-[10px] font-black rounded-xl transition-all border-2 ${
                        selectedRecipient === r 
                          ? 'bg-slate-800 text-white border-slate-800 shadow-xl shadow-slate-200 scale-105' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-slate-800 hover:text-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {selectedRecipient === 'Custom...' && (
                  <input 
                    type="text"
                    placeholder="Who are we convincing?"
                    className="w-full mt-4 bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 focus:border-slate-800 focus:bg-white focus:outline-none transition-all font-bold text-slate-800 shadow-sm"
                    value={customRecipient}
                    onChange={(e) => setCustomRecipient(e.target.value)}
                  />
                )}
              </div>

              {/* Reason & Tone Split */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Reasoning</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 text-slate-800 font-bold focus:border-slate-800 focus:outline-none transition-all shadow-sm appearance-none"
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value as ReasonType)}
                  >
                    {REASON_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {selectedReason === 'Custom...' && (
                    <input 
                      type="text"
                      placeholder="Type reason..."
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 shadow-sm focus:border-slate-800 transition-all animate-in fade-in"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Tone</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 text-slate-800 font-bold focus:border-slate-800 focus:outline-none transition-all shadow-sm appearance-none"
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value as Tone)}
                  >
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {selectedTone === 'Custom...' && (
                    <input 
                      type="text"
                      placeholder="Type tone..."
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 shadow-sm focus:border-slate-800 transition-all animate-in fade-in"
                      value={customTone}
                      onChange={(e) => setCustomTone(e.target.value)}
                    />
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-3">Extra Detail (Optional)</label>
                <textarea 
                  placeholder="e.g. Broken elevator, heavy rain, dog ate it..."
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 shadow-sm focus:border-slate-800 focus:bg-white focus:outline-none h-28 resize-none transition-all"
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                />
              </div>

              {/* Generate Button */}
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                ) : (
                  <>
                    <span className="uppercase tracking-[0.3em] text-xs">Generate Pro Excuse</span>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Results Section */}
          <section className="lg:col-span-7 space-y-8 lg:max-h-[900px] lg:overflow-y-auto pr-2 custom-scrollbar pb-10">
            {/* Filter Toggle */}
            <div className="sticky top-0 z-20 flex justify-between items-center bg-white/70 backdrop-blur-md p-5 rounded-[2.5rem] border border-slate-200 shadow-sm">
               <div className="flex items-center gap-4 ml-2">
                 <div className="w-2 h-8 bg-slate-800 rounded-full"></div>
                 <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.25em]">
                   {showFavoritesOnly ? 'Favorite Archives' : 'Excuse History'}
                 </h2>
               </div>
               <button 
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all border-2 ${
                  showFavoritesOnly 
                    ? 'bg-slate-800 border-slate-800 text-white shadow-xl shadow-slate-100' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-800 hover:text-slate-800'
                }`}
               >
                 <svg className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                 {showFavoritesOnly ? 'VIEW ALL' : 'FAVORITES'}
               </button>
            </div>

            {filteredExcuses.length === 0 ? (
              <div className="h-[500px] flex flex-col items-center justify-center p-12 text-center bg-white/40 rounded-[3rem] border-4 border-dashed border-slate-200 backdrop-blur-sm">
                <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-8 text-slate-300 shadow-inner">
                  {showFavoritesOnly ? (
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ) : (
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">No Records Found</h3>
                <p className="text-slate-500 font-bold max-w-xs mx-auto leading-relaxed">
                  {showFavoritesOnly ? "You haven't favorited any excuses yet." : "Generate a pro excuse to see it archived here."}
                </p>
              </div>
            ) : (
              filteredExcuses.map((excuse) => (
                <div 
                  key={excuse.id} 
                  className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-10 duration-500 group relative"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">LOG ID: {excuse.id.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-3">
                       <button 
                        onClick={() => toggleFavorite(excuse.id)}
                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-sm border-2 ${
                          excuse.isFavorite 
                            ? 'bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-100' 
                            : 'bg-white border-slate-50 text-slate-200 hover:text-slate-800 hover:border-slate-800'
                        }`}
                       >
                         <svg className={`w-5 h-5 ${excuse.isFavorite ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                       </button>
                       <button 
                        onClick={() => copyToClipboard(excuse.id, excuse.text)}
                        className={`px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black tracking-widest transition-all shadow-sm ${
                          copySuccess === excuse.id 
                            ? 'bg-green-600 text-white shadow-xl shadow-green-100' 
                            : 'bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200'
                        }`}
                      >
                        {copySuccess === excuse.id ? (
                           <>
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                             COPIED
                           </>
                        ) : (
                           <>
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                             COPY
                           </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative mb-8">
                    <svg className="absolute -top-6 -left-6 w-16 h-16 text-slate-500 opacity-5" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8v8H6c0 5.515 4.485 10 10 10v2C9.37 28 4 22.63 4 16V8h6zm14 0v8h-4c0 5.515 4.485 10 10 10v2c-6.63 0-12-5.37-12-12V8h6z"></path></svg>
                    <p className="text-slate-800 leading-[1.65] text-2xl font-[600] relative z-10 px-4 italic border-l-4 border-slate-200 py-2">
                      {excuse.text}
                    </p>
                  </div>

                  <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Target</span>
                        <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase truncate max-w-[100px]">{selectedRecipient}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Style</span>
                        <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase truncate max-w-[100px]">{selectedTone}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteExcuse(excuse.id)}
                      className="text-slate-300 hover:text-red-400 text-[10px] font-black transition-colors uppercase tracking-[0.2em] self-end mb-1"
                    >
                      Burn
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>

      {/* Excuse Assistant Chat */}
      <AIChatBox />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
          background-clip: content-box;
        }
      `}</style>
    </div>
  );
};

export default App;
