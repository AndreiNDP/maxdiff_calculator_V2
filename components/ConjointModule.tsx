import React, { useMemo } from 'react';
import { Layers, Plus, Trash2, Zap, BarChart2, Info, LayoutTemplate, Percent } from 'lucide-react';
import { ConjointState, Attribute, DesignMethod } from '../types';
import { calculateCBCEfficiency, calculateOrmeMinSample, optimizeCBCTasks, calculateInteractionSample, calculateAttributeStats } from '../utils/calculations';
import { StatusBadge } from './ui/StatusBadge';

interface Props {
  state: ConjointState;
  onChange: (newState: ConjointState) => void;
}

export const ConjointModule: React.FC<Props> = ({ state, onChange }) => {
  const minSample = useMemo(() => calculateOrmeMinSample(state), [state]);
  const interactionStats = useMemo(() => calculateInteractionSample(state), [state]);
  const efficiency = useMemo(() => calculateCBCEfficiency(state), [state]);
  const attributeStats = useMemo(() => calculateAttributeStats(state), [state]);
  
  const maxLevels = Math.max(...state.attributes.map(a => a.levels), 0);

  const addAttribute = () => {
    const newAttr: Attribute = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Attribute ${state.attributes.length + 1}`,
      levels: 2,
    };
    onChange({ ...state, attributes: [...state.attributes, newAttr] });
  };

  const removeAttribute = (id: string) => {
    onChange({ ...state, attributes: state.attributes.filter(a => a.id !== id) });
  };

  const updateAttribute = (id: string, field: keyof Attribute, value: string | number) => {
    onChange({
      ...state,
      attributes: state.attributes.map(a => a.id === id ? { ...a, [field]: value } : a)
    });
  };

  const handleOptimize = () => {
     const optimalTasks = optimizeCBCTasks(state);
     onChange({ ...state, nTasks: Math.max(optimalTasks, 1) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Column: Attribute Manager & Config */}
      <div className="space-y-6 flex flex-col h-full">
        {/* Attribute Manager */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Attributes & Levels
            </h3>
            <button 
              onClick={addAttribute}
              className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          
          <div className="space-y-3 overflow-y-auto flex-1 custom-scroll max-h-[300px] pr-2">
            {state.attributes.length === 0 && (
               <div className="text-center py-8 text-slate-400 text-sm">No attributes defined. Add one to start.</div>
            )}
            {state.attributes.map((attr) => (
              <div key={attr.id} className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-100 group">
                <input
                  type="text"
                  className="flex-1 bg-transparent border-b border-transparent focus:border-indigo-400 outline-none text-slate-700 font-medium placeholder-slate-400"
                  value={attr.name}
                  placeholder="Attribute Name"
                  onChange={(e) => updateAttribute(attr.id, 'name', e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Levels:</span>
                  <input
                    type="number"
                    min="2"
                    className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-center text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={attr.levels}
                    onChange={(e) => updateAttribute(attr.id, 'levels', parseInt(e.target.value) || 2)}
                  />
                </div>
                <button 
                  onClick={() => removeAttribute(attr.id)}
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Task Config */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Task Configuration
            </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Design Method</label>
                <div className="relative">
                  <select 
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                    value={state.designMethod}
                    onChange={(e) => onChange({...state, designMethod: e.target.value as DesignMethod})}
                  >
                    <option value="complete">Complete Enumeration</option>
                    <option value="shortcut">Shortcut</option>
                    <option value="random">Random</option>
                    <option value="balanced">Balanced Overlap</option>
                  </select>
                  <LayoutTemplate className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
              
               <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Sample Size (N)</label>
                <input 
                  type="number" min="1"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={state.sampleSize}
                  onChange={(e) => onChange({...state, sampleSize: parseInt(e.target.value) || 0})}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-slate-600">Tasks per Resp.</label>
                  <button 
                    onClick={handleOptimize} 
                    className="text-xs text-indigo-600 hover:underline"
                    title="Calculate tasks required for SE < 0.05"
                  >Optimize</button>
                </div>
                <input 
                  type="number" min="1"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={state.nTasks}
                  onChange={(e) => onChange({...state, nTasks: parseInt(e.target.value) || 0})}
                />
              </div>
             
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Concepts/Task</label>
                <input 
                  type="number" min="2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={state.conceptsPerTask}
                  onChange={(e) => onChange({...state, conceptsPerTask: parseInt(e.target.value) || 0})}
                />
              </div>

               <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">% None (Expected)</label>
                <div className="relative">
                  <input 
                    type="number" min="0" max="100"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={state.percentNone}
                    onChange={(e) => onChange({...state, percentNone: parseInt(e.target.value) || 0})}
                  />
                  <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Right Column: Analytics */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            Statistical Analysis
          </h3>

          <div className="flex-1 flex flex-col space-y-8">
            
            {/* Efficiency Gauge */}
            <div className="text-center relative pb-2 border-b border-slate-100">
               <div className="mb-2">
                  <span className="text-3xl font-bold text-slate-700">{efficiency.score}%</span>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Efficiency</p>
               </div>
               <div className="flex justify-center mb-4">
                   <StatusBadge status={efficiency.status} />
               </div>
            </div>

            {/* Excel-Style Matrix */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Orme's Design Requirements</h4>
              
              <div className="grid grid-cols-2 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
                {/* Main Effects */}
                <div className="bg-white p-3">
                  <span className="block text-xs text-slate-500 mb-1">Cells of Analysis (Main)</span>
                  <span className="block text-lg font-semibold text-slate-800">{maxLevels}</span>
                  <span className="text-xs text-slate-400">Max Levels</span>
                </div>
                <div className="bg-white p-3">
                  <span className="block text-xs text-slate-500 mb-1">Sample Size (Main)</span>
                  <span className={`block text-lg font-semibold ${state.sampleSize < minSample ? 'text-red-500' : 'text-emerald-600'}`}>
                    {minSample}
                  </span>
                  <span className="text-xs text-slate-400">Required N</span>
                </div>

                {/* 2-Way Effects */}
                <div className="bg-white p-3">
                  <span className="block text-xs text-slate-500 mb-1">Cells of Analysis (2-Way)</span>
                  <span className="block text-lg font-semibold text-slate-800">{interactionStats.maxInteractionCells}</span>
                  <span className="text-xs text-slate-400">Max Interac.</span>
                </div>
                <div className="bg-white p-3">
                  <span className="block text-xs text-slate-500 mb-1">Sample Size (2-Way)</span>
                  <span className={`block text-lg font-semibold ${state.sampleSize < interactionStats.minSample ? 'text-orange-500' : 'text-emerald-600'}`}>
                    {interactionStats.minSample}
                  </span>
                  <span className="text-xs text-slate-400">Required N</span>
                </div>
              </div>
            </div>

            {/* Attribute Stability Table */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                Attribute Stability 
                <span title="Expected Standard Error. Target < 0.05 for high quality.">
                  <Info className="w-3 h-3 text-slate-300" />
                </span>
              </h4>
              <div className="overflow-y-auto custom-scroll pr-2 border border-slate-200 rounded-lg bg-slate-50">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-500 font-medium text-xs sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Attribute</th>
                      <th className="px-3 py-2 text-center">Levels</th>
                      <th className="px-3 py-2 text-right">Est. Std Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {attributeStats.map(attr => (
                      <tr key={attr.id} className="bg-white hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-700 truncate max-w-[120px]" title={attr.name}>{attr.name}</td>
                        <td className="px-3 py-2 text-center text-slate-600">{attr.levels}</td>
                        <td className={`px-3 py-2 text-right font-mono ${attr.stdError > 0.05 ? 'text-orange-500' : 'text-emerald-600 font-semibold'}`}>{attr.stdError.toFixed(4)}</td>
                      </tr>
                    ))}
                    {attributeStats.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-slate-400 italic">No attributes defined</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};