
import React, { useState, useEffect } from 'react';
import { generateExcuse } from './services/geminiService';
import { ExcuseRequest, Tone, ReasonType, Recipient, GeneratedExcuse } from './types';
import AIChatBox from './components/AIChatBox';

const TONES: Tone[] = ['Professional', 'Dramatic', 'Funny', 'Apologetic', 'Short & Blunt', 'Casual', 'Custom...'];
const REASON_TYPES: ReasonType[] = ['Transport', 'Family', 'Technical', 'Creative', 'Honest-ish', 'Work-related', 'Custom...'];
const RECIPIENTS: Recipient[] = ['Boss', 'Teacher', 'Partner', 'Friend', 'Client', 'Parent', 'Custom...'];
const SITUATIONS = [
  "Late for work/class",
  "Missing a meeting",
  "Missing a social event",
  "Project delay",
  "Late for a date",
  "Didn't do assigned task",
  "Need to leave early",
  "Custom..."
];

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

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('excuse_pro_history');
    if (saved) {
      try {
        setGeneratedExcuses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('excuse_pro_history', JSON.stringify(generatedExcuses));
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
    } catch (error) {
      console.error(error);
      alert("System glitch! Even the AI doesn't have an excuse for this failure.");
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

  const displayedExcuses = showFavoritesOnly 
    ? generatedExcuses.filter(e => e.isFavorite) 
    : generatedExcuses;

  return (
    <div className="min-h-screen pb-24 pt-10 px-4 md:px-6 bg-slate-50/50 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
          
          <div className="relative inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-[2.5rem] mb-6 shadow-[0_25px_50px_-12px_rgba(79,70,229,0.5)] border-4 border-white transform transition-all hover:scale-110 duration-500 group overflow-hidden">
            <svg className="w-14 h-14 text-white z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              <circle cx="12" cy="11" r="3" strokeWidth="1.5" />
              <path d="M12 9v2l1 1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="absolute top-4 right-4 animate-bounce">
              <svg className="w-4 h-4 text-yellow-300 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
          </div>
          
          <h1 className="text-6xl font-[900] text-slate-900 mb-3 tracking-tighter flex items-center justify-center gap-3">
            Excuse <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400 italic">Pro AI</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-lg mx-auto leading-relaxed font-semibold opacity-80">
            Intelligent excuses. Perfectly phrased. 100% human-sounding.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Form Side */}
          <section className="lg:col-span-5 space-y-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -z-0"></div>
            <div className="space-y-6 relative z-10">
              {/* Situation */}
              <div className="group">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-4 group-focus-within:text-indigo-600 transition-colors">Situation</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:border-indigo-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer shadow-sm"
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
                    placeholder="Briefly describe the snag..."
                    className="w-full mt-4 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all animate-in slide-in-from-top-2 font-bold text-slate-700 shadow-sm"
                    value={customSituation}
                    onChange={(e) => setCustomSituation(e.target.value)}
                  />
                )}
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Excuse For</label>
                <div className="flex flex-wrap gap-2.5">
                  {RECIPIENTS.map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRecipient(r)}
                      className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all border-2 ${
                        selectedRecipient === r 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200 scale-105' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-300 hover:text-indigo-600'
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
                    className="w-full mt-4 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all font-bold text-slate-700 shadow-sm"
                    value={customRecipient}
                    onChange={(e) => setCustomRecipient(e.target.value)}
                  />
                )}
              </div>

              {/* Reason & Tone */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Reasoning</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 text-slate-800 font-bold focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value as ReasonType)}
                  >
                    {REASON_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {selectedReason === 'Custom...' && (
                    <input 
                      type="text"
                      placeholder="Write your reason..."
                      className="w-full mt-3 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none transition-all font-bold text-slate-700 shadow-sm animate-in fade-in zoom-in-95"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Tone</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 text-slate-800 font-bold focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value as Tone)}
                  >
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {selectedTone === 'Custom...' && (
                    <input 
                      type="text"
                      placeholder="Describe the vibe..."
                      className="w-full mt-3 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none transition-all font-bold text-slate-700 shadow-sm animate-in fade-in zoom-in-95"
                      value={customTone}
                      onChange={(e) => setCustomTone(e.target.value)}
                    />
                  )}
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Secret Ingredients (Optional)</label>
                <textarea 
                  placeholder="Any specific facts to weave into the story..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none h-28 resize-none transition-all font-bold text-slate-700 shadow-sm"
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-black py-5 rounded-[1.75rem] shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:transform-none"
              >
                {loading ? (
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                ) : (
                  <>
                    <span className="uppercase tracking-[0.3em] text-sm">Generate Pro Excuse</span>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Results Side */}
          <section className="lg:col-span-7 space-y-8 lg:max-h-[900px] lg:overflow-y-auto pr-2 custom-scrollbar pb-10">
            {/* Filter Toggle */}
            <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-200 shadow-sm">
               <h2 className="text-sm font-black text-slate-600 uppercase tracking-[0.2em] ml-4">
                 {showFavoritesOnly ? 'Favorite Excuses' : 'Excuse History'}
               </h2>
               <button 
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all ${
                  showFavoritesOnly 
                    ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' 
                    : 'bg-white text-slate-400 border border-slate-200 hover:border-yellow-200'
                }`}
               >
                 <svg className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                 {showFavoritesOnly ? 'ALL HISTORY' : 'VIEW FAVORITES'}
               </button>
            </div>

            {displayedExcuses.length === 0 ? (
              <div className="h-[500px] flex flex-col items-center justify-center p-12 text-center bg-white/50 rounded-[3rem] border-4 border-dashed border-indigo-100/50 backdrop-blur-sm">
                <div className="w-32 h-32 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-300 shadow-inner group-hover:scale-110 transition-transform">
                  {showFavoritesOnly ? (
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ) : (
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  )}
                </div>
                <h3 className="text-3xl font-[900] text-slate-900 mb-3 tracking-tight">
                  {showFavoritesOnly ? 'No Favorites Yet' : 'The Vault is Empty'}
                </h3>
                <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed text-lg">
                  {showFavoritesOnly ? "Star your best alibis to keep them here for quick access." : "Generate some excuses to populate your timeline."}
                </p>
              </div>
            ) : (
              displayedExcuses.map((excuse) => (
                <div 
                  key={excuse.id} 
                  className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-12 duration-700 group relative"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-8 bg-indigo-600 rounded-full shadow-lg shadow-indigo-100"></div>
                      <span className="text-[12px] font-[900] tracking-[0.3em] text-indigo-600 uppercase">EXCUSE PRO AI: {excuse.id.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => toggleFavorite(excuse.id)}
                        className={`p-3 rounded-2xl transition-all shadow-sm ${
                          excuse.isFavorite 
                            ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100 hover:scale-110' 
                            : 'bg-slate-50 text-slate-300 hover:text-yellow-400 hover:bg-yellow-50'
                        }`}
                        title={excuse.isFavorite ? "Remove from favorites" : "Add to favorites"}
                       >
                         <svg className={`w-5 h-5 ${excuse.isFavorite ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                       </button>
                       <button 
                        onClick={() => copyToClipboard(excuse.id, excuse.text)}
                        className={`px-5 py-3 rounded-2xl flex items-center gap-3 text-[11px] font-black tracking-widest transition-all shadow-sm ${
                          copySuccess === excuse.id 
                            ? 'bg-green-500 text-white shadow-xl shadow-green-200' 
                            : 'bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white hover:shadow-xl hover:shadow-indigo-100'
                        }`}
                      >
                        {copySuccess === excuse.id ? (
                           <>
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                             EXCUSE COPIED
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
                    <svg className="absolute -top-6 -left-6 w-16 h-16 text-indigo-500 opacity-5" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8v8H6c0 5.515 4.485 10 10 10v2C9.37 28 4 22.63 4 16V8h6zm14 0v8h-4c0 5.515 4.485 10 10 10v2c-6.63 0-12-5.37-12-12V8h6z"></path></svg>
                    <p className="text-slate-800 leading-[1.6] text-2xl font-[600] relative z-10 px-4 italic border-l-4 border-indigo-100 py-2">
                      {excuse.text}
                    </p>
                  </div>

                  <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</span>
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tight truncate max-w-[120px]">{selectedRecipient}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Style</span>
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tight truncate max-w-[120px]">{selectedTone}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setGeneratedExcuses(prev => prev.filter(e => e.id !== excuse.id))}
                      className="text-slate-300 hover:text-red-500 text-[10px] font-black transition-colors uppercase tracking-[0.2em] self-end mb-1"
                    >
                      Burn History
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <AIChatBox />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
          background-clip: content-box;
        }
      `}</style>
    </div>
  );
};

export default App;
