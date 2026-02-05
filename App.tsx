import React, { useState, useEffect } from 'react';
import { Layout, Github } from 'lucide-react';
import { Hobby, Log } from './types';
import { Dashboard } from './components/Dashboard';
import { HobbyDetail } from './components/HobbyDetail';

// --- Mock Data Service ---
const STORAGE_KEY = 'hobbyzen_data_v1';

const loadData = (): Hobby[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load data", e);
    return [];
  }
};

const saveData = (hobbies: Hobby[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hobbies));
};

const App: React.FC = () => {
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | string>('dashboard');

  useEffect(() => {
    setHobbies(loadData());
  }, []);

  useEffect(() => {
    saveData(hobbies);
  }, [hobbies]);

  const handleAddHobby = (newHobbyData: Omit<Hobby, 'id' | 'logs' | 'createdAt'>) => {
    const newHobby: Hobby = {
      ...newHobbyData,
      id: crypto.randomUUID(),
      logs: [],
      createdAt: new Date().toISOString()
    };
    setHobbies(prev => [...prev, newHobby]);
  };

  const handleAddLog = (hobbyId: string, logData: Omit<Log, 'id'>) => {
    const newLog: Log = {
      ...logData,
      id: crypto.randomUUID()
    };
    setHobbies(prev => prev.map(h => {
      if (h.id === hobbyId) {
        return { ...h, logs: [...h.logs, newLog] };
      }
      return h;
    }));
  };

  const handleDeleteLog = (hobbyId: string, logId: string) => {
    if(!window.confirm("Delete this log?")) return;
    setHobbies(prev => prev.map(h => {
      if (h.id === hobbyId) {
        return { ...h, logs: h.logs.filter(l => l.id !== logId) };
      }
      return h;
    }));
  };

  const handleDeleteHobby = (hobbyId: string) => {
    if(!window.confirm("Are you sure you want to delete this hobby? This action cannot be undone.")) return;
    setHobbies(prev => prev.filter(h => h.id !== hobbyId));
  };

  const activeHobby = hobbies.find(h => h.id === currentView);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-violet-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 font-bold text-xl text-slate-900 cursor-pointer"
            onClick={() => setCurrentView('dashboard')}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-lg flex items-center justify-center text-white">
              <Layout size={18} />
            </div>
            <span>HobbyZen</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="hidden md:inline text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-500">
               {hobbies.length} Active Hobbies
             </span>
             <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
               <Github size={20} />
             </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {currentView === 'dashboard' ? (
          <Dashboard 
            hobbies={hobbies} 
            onSelectHobby={(id) => setCurrentView(id)} 
            onAddHobby={handleAddHobby}
            onDeleteHobby={handleDeleteHobby}
          />
        ) : activeHobby ? (
          <HobbyDetail 
            hobby={activeHobby} 
            onBack={() => setCurrentView('dashboard')} 
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
          />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-400">Hobby not found</h2>
            <button onClick={() => setCurrentView('dashboard')} className="mt-4 text-violet-600 font-medium hover:underline">Return Home</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;