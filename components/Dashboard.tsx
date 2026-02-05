import React, { useState } from 'react';
import { 
  Plus, 
  Trophy, 
  Clock, 
  Zap, 
  Sparkles, 
  Trash2, 
  Palette, 
  Dumbbell, 
  BookOpen, 
  Users, 
  Coffee, 
  Star 
} from 'lucide-react';
import { Hobby, FrequencyType } from '../types';
import { suggestNewHobbies } from '../services/geminiService';

interface DashboardProps {
  hobbies: Hobby[];
  onSelectHobby: (id: string) => void;
  onAddHobby: (hobby: Omit<Hobby, 'id' | 'logs' | 'createdAt'>) => void;
  onDeleteHobby: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ hobbies, onSelectHobby, onAddHobby, onDeleteHobby }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showSuggester, setShowSuggester] = useState(false);
  const [interests, setInterests] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Creative');
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState(3);
  const [freq, setFreq] = useState<FrequencyType>(FrequencyType.Weekly);

  const totalLogs = hobbies.reduce((acc, h) => acc + h.logs.length, 0);
  const totalHours = hobbies.reduce((acc, h) => acc + h.logs.reduce((sum, l) => sum + l.durationMinutes, 0), 0) / 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddHobby({
      name,
      description: desc,
      category,
      icon: '🎨',
      targetFrequency: target,
      frequencyType: freq
    });
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDesc('');
    setCategory('Creative');
    setTarget(3);
  };

  const handleGetSuggestions = async () => {
    if (!interests.trim()) return;
    setLoadingSuggestions(true);
    const results = await suggestNewHobbies(interests);
    setSuggestions(results);
    setLoadingSuggestions(false);
  };

  const getProgress = (hobby: Hobby) => {
    const now = new Date();
    let count = 0;
    let label = '';

    if (hobby.frequencyType === FrequencyType.Daily) {
      count = hobby.logs.filter(l => new Date(l.date).toDateString() === now.toDateString()).length;
      label = 'Today';
    } else if (hobby.frequencyType === FrequencyType.Weekly) {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      count = hobby.logs.filter(l => new Date(l.date) > oneWeekAgo).length;
      label = 'Past 7 Days';
    } else {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      count = hobby.logs.filter(l => new Date(l.date) > thirtyDaysAgo).length;
      label = 'Past 30 Days';
    }

    const percent = Math.min((count / hobby.targetFrequency) * 100, 100);
    return { count, percent, label };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Creative': return <Palette size={20} className="text-violet-500" />;
      case 'Physical': return <Dumbbell size={20} className="text-emerald-500" />;
      case 'Educational': return <BookOpen size={20} className="text-blue-500" />;
      case 'Social': return <Users size={20} className="text-amber-500" />;
      case 'Relaxation': return <Coffee size={20} className="text-rose-500" />;
      default: return <Star size={20} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <div className="text-slate-400 mb-2"><Trophy size={20} /></div>
          <div className="text-2xl font-bold text-slate-800">{hobbies.length}</div>
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Active Hobbies</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <div className="text-slate-400 mb-2"><Clock size={20} /></div>
          <div className="text-2xl font-bold text-slate-800">{totalHours.toFixed(1)}h</div>
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Time</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <div className="text-slate-400 mb-2"><Zap size={20} /></div>
          <div className="text-2xl font-bold text-slate-800">{totalLogs}</div>
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Sessions</div>
        </div>
        <button 
          onClick={() => setShowSuggester(!showSuggester)}
          className="bg-gradient-to-br from-violet-500 to-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white flex flex-col items-center justify-center hover:scale-[1.02] transition-transform cursor-pointer"
        >
          <Sparkles size={24} className="mb-2 text-yellow-300" />
          <div className="font-bold">Find New Hobby</div>
          <div className="text-xs text-indigo-100 mt-1">Ask AI Assistant</div>
        </button>
      </div>

      {/* AI Suggester */}
      {showSuggester && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500"/> Discover Something New
          </h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              placeholder="I like being outdoors, solving puzzles, and music..."
              className="flex-1 p-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
            <button 
              onClick={handleGetSuggestions}
              disabled={loadingSuggestions}
              className="bg-indigo-600 text-white px-6 rounded-xl font-medium disabled:opacity-50"
            >
              {loadingSuggestions ? 'Thinking...' : 'Suggest'}
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {suggestions.map((s, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-slate-800 mb-1">{s.name}</h4>
                <p className="text-xs text-slate-500 mb-2">{s.description}</p>
                <p className="text-xs text-indigo-600 italic">"{s.reason}"</p>
                <button 
                  onClick={() => {
                    setName(s.name);
                    setDesc(s.description);
                    setShowSuggester(false);
                    setIsAdding(true);
                  }}
                  className="mt-3 w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                >
                  Start this Hobby
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hobbies Grid */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Your Hobbies</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Add Hobby
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 animate-slide-down">
          <h3 className="text-lg font-bold text-slate-800 mb-4">New Hobby Goal</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg outline-none" value={category} onChange={e => setCategory(e.target.value)}>
                  <option>Creative</option>
                  <option>Physical</option>
                  <option>Educational</option>
                  <option>Social</option>
                  <option>Relaxation</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input type="text" className="w-full p-2 border border-slate-200 rounded-lg outline-none" value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium text-slate-700">Target:</label>
              <input type="number" min="1" className="w-20 p-2 border border-slate-200 rounded-lg" value={target} onChange={e => setTarget(parseInt(e.target.value))} />
              <span className="text-slate-500 text-sm">times per</span>
              <select className="p-2 border border-slate-200 rounded-lg" value={freq} onChange={e => setFreq(e.target.value as FrequencyType)}>
                <option value={FrequencyType.Weekly}>Week</option>
                <option value={FrequencyType.Monthly}>Month</option>
                <option value={FrequencyType.Daily}>Day</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium">Create Hobby</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hobbies.map(hobby => (
          <div 
            key={hobby.id} 
            onClick={() => onSelectHobby(hobby.id)}
            className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-violet-100 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span className="inline-block px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                  {hobby.category}
                </span>
                <div className="flex items-center gap-2">
                  <div className="mt-0.5">
                    {getCategoryIcon(hobby.category)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 leading-tight">{hobby.name}</h3>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteHobby(hobby.id);
                }}
                className="text-slate-300 hover:text-red-500 p-2 -mr-2 -mt-2 hover:bg-red-50 rounded-lg transition-colors z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                title="Delete Hobby"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{hobby.description || "No description provided."}</p>
            
            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center gap-1 text-slate-600">
                <Zap size={16} className="text-amber-500" />
                <span className="font-semibold">{hobby.logs.length}</span> sessions
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span>Goal: {hobby.targetFrequency}/{hobby.frequencyType === 'Weekly' ? 'wk' : hobby.frequencyType === 'Daily' ? 'day' : 'mo'}</span>
              </div>
            </div>
            
            {/* Real Progress Bar */}
            {(() => {
              const { count, percent, label } = getProgress(hobby);
              return (
                <div className="mt-2 pt-4 border-t border-slate-50">
                   <div className="flex justify-between items-center text-xs mb-2">
                     <span className="font-medium text-slate-500">Goal <span className="text-slate-400 font-normal">({label})</span></span>
                     <span className={`font-bold ${percent >= 100 ? 'text-emerald-600' : 'text-slate-700'}`}>
                       {count}/{hobby.targetFrequency}
                     </span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div 
                       className={`h-full rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                       style={{ width: `${percent}%` }}
                     />
                   </div>
                </div>
              );
            })()}

          </div>
        ))}
        
        {hobbies.length === 0 && !isAdding && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <Sparkles size={48} className="mb-4 text-slate-200" />
            <p className="text-lg font-medium">No hobbies tracked yet.</p>
            <p className="text-sm">Add one manually or ask AI for suggestions!</p>
          </div>
        )}
      </div>
    </div>
  );
};