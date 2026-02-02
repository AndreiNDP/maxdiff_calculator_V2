import React, { useState } from 'react';
import { Activity, Download, Settings, Github, LayoutGrid, List } from 'lucide-react';
import { MaxDiffModule } from './components/MaxDiffModule';
import { ConjointModule } from './components/ConjointModule';
import { LogicCheckModal } from './components/LogicCheckModal';
import { MaxDiffState, ConjointState } from './types';
import { generateReport } from './utils/export';

const App: React.FC = () => {
  // --- Global State ---
  const [activeTab, setActiveTab] = useState<'maxdiff' | 'cbc'>('maxdiff');
  const [showLogicCheck, setShowLogicCheck] = useState(false);

  // --- Domain State ---
  const [maxDiffState, setMaxDiffState] = useState<MaxDiffState>({
    totalItems: 20,
    itemsPerScreen: 4,
    nScreens: 12,
    sampleSize: 300
  });

  const [cbcState, setCbcState] = useState<ConjointState>({
    attributes: [
      { id: '1', name: 'Brand', levels: 3 },
      { id: '2', name: 'Price', levels: 4 },
      { id: '3', name: 'Package Type', levels: 3 }
    ],
    nTasks: 12,
    conceptsPerTask: 3,
    sampleSize: 300,
    percentNone: 0,
    designMethod: 'balanced'
  });

  const handleExport = () => {
    generateReport(activeTab, maxDiffState, cbcState);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* --- Header --- */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <div>
             <h1 className="text-lg font-bold text-slate-800 leading-tight">Design Architect</h1>
             <p className="text-xs text-slate-500 font-medium">MaxDiff & Conjoint (CBC) Calculator</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1">
           <button 
             onClick={() => setActiveTab('maxdiff')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'maxdiff' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <List className="w-4 h-4" /> MaxDiff
           </button>
           <button 
             onClick={() => setActiveTab('cbc')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'cbc' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <Activity className="w-4 h-4" /> Conjoint
           </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowLogicCheck(true)}
            className="text-slate-400 hover:text-indigo-600 transition-colors p-2" 
            title="System Logic Check"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </header>

      {/* --- Main Content (Scrollable Container for SharePoint Safety) --- */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scroll p-6">
        <div className="max-w-6xl mx-auto h-full">
          {activeTab === 'maxdiff' ? (
            <div className="animate-fade-in h-full">
               <MaxDiffModule state={maxDiffState} onChange={setMaxDiffState} />
            </div>
          ) : (
            <div className="animate-fade-in h-full">
               <ConjointModule state={cbcState} onChange={setCbcState} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-400 shrink-0">
        <p>Built for Market Science Professionals. Adheres to Sawtooth Software guidelines.</p>
      </footer>

      {/* Modals */}
      <LogicCheckModal isOpen={showLogicCheck} onClose={() => setShowLogicCheck(false)} />
      
      {/* Global CSS for simplistic fade-in without extra libs */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
