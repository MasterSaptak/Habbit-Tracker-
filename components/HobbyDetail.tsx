import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Star, ChevronDown, ChevronUp, Sparkles, BrainCircuit, Play, TrendingUp } from 'lucide-react';
import { Hobby, Log, AIAdvice } from '../types';
import { ActivityLineChart, RatingBarChart } from './Charts';
import { getHobbyCoaching } from '../services/geminiService';

interface HobbyDetailProps {
  hobby: Hobby;
  onBack: () => void;
  onAddLog: (hobbyId: string, log: Omit<Log, 'id'>) => void;
  onDeleteLog: (hobbyId: string, logId: string) => void;
}

export const HobbyDetail: React.FC<HobbyDetailProps> = ({ hobby, onBack, onAddLog, onDeleteLog }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [showLogForm, setShowLogForm] = useState(false);
  
  // Log Form State
  const [logDuration, setLogDuration] = useState(30);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logNotes, setLogNotes] = useState('');
  const [logRating, setLogRating] = useState(3);

  // AI State
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog(hobby.id, {
      date: new Date(logDate).toISOString(),
      durationMinutes: logDuration,
      notes: logNotes,
      rating: logRating
    });
    setShowLogForm(false);
    // Reset defaults
    setLogNotes('');
    setLogRating(3);
  };

  const handleAskAI = async () => {
    setLoadingAi(true);
    const advice = await getHobbyCoaching(hobby);
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors">
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wide mb-3">
                {hobby.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{hobby.name}</h1>
              <p className="text-slate-500 max-w-2xl">{hobby.description}</p>
            </div>
            <button 
              onClick={() => setShowLogForm(!showLogForm)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" /> Log Session
            </button>
          </div>
        </div>

        {/* Quick Log Form */}
        {showLogForm && (
           <div className="bg-slate-50 p-6 border-b border-slate-100 animate-slide-down">
             <form onSubmit={handleLogSubmit} className="max-w-3xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                    <input type="date" required value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Duration (mins)</label>
                    <input type="number" min="1" required value={logDuration} onChange={e => setLogDuration(parseInt(e.target.value))} className="w-full p-2 rounded-lg border border-slate-200" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Rating (1-5)</label>
                    <select value={logRating} onChange={e => setLogRating(parseInt(e.target.value))} className="w-full p-2 rounded-lg border border-slate-200">
                      {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
                  <textarea value={logNotes} onChange={e => setLogNotes(e.target.value)} placeholder="What did you work on? How did it feel?" className="w-full p-2 rounded-lg border border-slate-200 h-20 resize-none" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowLogForm(false)} className="px-4 py-2 text-slate-500 text-sm hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors">Save Entry</button>
                </div>
             </form>
           </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-8 py-4 font-medium text-sm transition-colors relative ${activeTab === 'overview' ? 'text-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Overview & Stats
            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`px-8 py-4 font-medium text-sm transition-colors relative ${activeTab === 'history' ? 'text-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Log History
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-violet-600"></div>}
          </button>
        </div>

        <div className="p-8 bg-slate-50/50 min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* AI Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                       <Clock size={20} className="text-violet-500" /> Time Spent (Minutes)
                     </h3>
                     <ActivityLineChart logs={hobby.logs} />
                   </div>
                </div>
                <div className="lg:col-span-1">
                   <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-lg text-white h-full relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                       <BrainCircuit size={100} />
                     </div>
                     <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                       <Sparkles size={18} className="text-yellow-400" /> AI Coach
                     </h3>
                     
                     {!aiAdvice ? (
                       <div className="flex flex-col items-center justify-center h-48 text-center relative z-10">
                         <p className="text-slate-300 text-sm mb-6">Analyze your recent logs to get personalized tips and motivation.</p>
                         <button 
                           onClick={handleAskAI} 
                           disabled={loadingAi}
                           className="bg-white text-indigo-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors disabled:opacity-70"
                         >
                           {loadingAi ? 'Analyzing...' : 'Get Coaching'}
                         </button>
                       </div>
                     ) : (
                       <div className="space-y-4 relative z-10 animate-fade-in">
                         <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                           <span className="text-xs uppercase tracking-wider text-indigo-200 font-bold block mb-1">Tip</span>
                           <p className="text-sm font-medium">{aiAdvice.tip}</p>
                         </div>
                         <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                           <span className="text-xs uppercase tracking-wider text-indigo-200 font-bold block mb-1">Challenge</span>
                           <p className="text-sm font-medium">{aiAdvice.challenge}</p>
                         </div>
                         <div className="mt-4 pt-4 border-t border-white/10">
                           <p className="text-xs italic text-indigo-200">"{aiAdvice.motivation}"</p>
                         </div>
                         <button onClick={() => setAiAdvice(null)} className="text-xs text-white/50 hover:text-white mt-2 underline">Reset</button>
                       </div>
                     )}
                   </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Star size={20} className="text-amber-500" /> Satisfaction Ratings
                </h3>
                <RatingBarChart logs={hobby.logs} />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Progress Chart in History Tab */}
              {hobby.logs.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                   <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <TrendingUp size={20} className="text-violet-500" /> Progress Trend
                   </h3>
                   <ActivityLineChart logs={hobby.logs} />
                </div>
              )}

              <div className="space-y-4">
                {hobby.logs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">No logs found. Start tracking!</div>
                ) : (
                  hobby.logs.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                    <div key={log.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group hover:border-violet-100 transition-colors">
                       <div className="flex gap-4 items-start">
                         <div className="bg-slate-50 p-3 rounded-lg text-center min-w-[70px]">
                           <div className="text-xs text-slate-500 font-bold uppercase">{new Date(log.date).toLocaleDateString(undefined, {month: 'short'})}</div>
                           <div className="text-xl font-bold text-slate-800">{new Date(log.date).getDate()}</div>
                         </div>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="font-bold text-slate-800">{log.durationMinutes} mins</span>
                             <div className="flex text-amber-400">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={12} fill={i < log.rating ? "currentColor" : "none"} stroke="currentColor" className={i < log.rating ? "" : "text-slate-300"} />
                               ))}
                             </div>
                           </div>
                           <p className="text-slate-600 text-sm">{log.notes || <span className="italic text-slate-400">No notes</span>}</p>
                         </div>
                       </div>
                       <button 
                         onClick={() => onDeleteLog(hobby.id, log.id)}
                         className="text-slate-300 hover:text-red-500 transition-colors p-2"
                         title="Delete Log"
                       >
                         &times;
                       </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};