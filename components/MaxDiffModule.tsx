import React, { useMemo } from 'react';
import { Calculator, AlertTriangle, CheckCircle, Smartphone, Info, BookOpen } from 'lucide-react';
import { MaxDiffState } from '../types';
import { calculateMaxDiffFrequency, validateMaxDiffDesign, optimizeMaxDiffScreens, calculateMaxDiffAdvancedMetrics } from '../utils/calculations';
import { StatusBadge } from './ui/StatusBadge';

interface Props {
  state: MaxDiffState;
  onChange: (newState: MaxDiffState) => void;
}

export const MaxDiffModule: React.FC<Props> = ({ state, onChange }) => {
  
  const frequency = useMemo(() => calculateMaxDiffFrequency(state), [state]);
  const validation = useMemo(() => validateMaxDiffDesign(frequency), [frequency]);
  const metrics = useMemo(() => calculateMaxDiffAdvancedMetrics(state, frequency), [state, frequency]);
  
  // Respondent burden estimation (approx 15 seconds per screen)
  const burdenMinutes = (state.nScreens * 15) / 60;

  const handleOptimize = () => {
    const optimalScreens = optimizeMaxDiffScreens(state.totalItems, state.itemsPerScreen);
    onChange({ ...state, nScreens: optimalScreens });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Column: Inputs & Guide */}
      <div className="space-y-6 flex flex-col">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            Design Parameters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Total Items (K)</label>
              <input 
                type="number" 
                min="2"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={state.totalItems}
                onChange={(e) => onChange({...state, totalItems: parseInt(e.target.value) || 0})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Items Per Screen (k)</label>
              <input 
                type="number" 
                min="2"
                max={state.totalItems}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={state.itemsPerScreen}
                onChange={(e) => onChange({...state, itemsPerScreen: parseInt(e.target.value) || 0})}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-600">Number of Screens</label>
                <button 
                  onClick={handleOptimize}
                  className="text-xs text-indigo-600 font-medium hover:text-indigo-800 underline"
                  title="Calculates screens needed for 4.0 frequency"
                >
                  Optimize for Excellence
                </button>
              </div>
              <input 
                type="number" 
                min="1"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={state.nScreens}
                onChange={(e) => onChange({...state, nScreens: parseInt(e.target.value) || 0})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Sample Size (N)</label>
              <input 
                type="number" 
                min="1"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={state.sampleSize}
                onChange={(e) => onChange({...state, sampleSize: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </div>

        {/* Guidelines Reference Box */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-sm">
          <h4 className="font-semibold text-indigo-800 flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4" /> Sawtooth Rules of Thumb
          </h4>
          <p className="text-indigo-900 mb-3 text-xs opacity-80">Target Frequency (Exposures per Item):</p>
          <ul className="space-y-1.5">
            <li className="flex justify-between items-center text-emerald-800 font-medium">
              <span>Excellent</span>
              <span>&ge; 4.0</span>
            </li>
            <li className="flex justify-between items-center text-emerald-700">
              <span>Acceptable</span>
              <span>3.0 – 3.9</span>
            </li>
             <li className="flex justify-between items-center text-orange-700">
              <span>Danger</span>
              <span>2.5 – 2.9</span>
            </li>
             <li className="flex justify-between items-center text-red-700 font-bold">
              <span>Don't Bother!</span>
              <span>&lt; 2.5</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column: Analytics */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-indigo-600" />
            Statistical Validity
          </h3>

          <div className="flex-1 space-y-8">
            {/* Frequency Gauge */}
            <div className="text-center">
              <span className="text-sm text-slate-500 uppercase tracking-wide">Frequency Count</span>
              <div className="mt-2 text-5xl font-bold text-slate-800">{frequency.toFixed(2)}</div>
              <div className="mt-2 flex justify-center">
                 <StatusBadge status={validation.status} />
              </div>
              <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">{validation.message}</p>
            </div>

            {/* Visual Bar - Updated Range to 5 */}
            <div className="px-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>0</span>
                <span>2.5</span>
                <span>3.0</span>
                <span>4.0</span>
                <span>5+</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden w-full relative">
                <div 
                  className={`h-full transition-all duration-500 ${validation.score > 70 ? 'bg-emerald-500' : validation.score > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min((frequency / 5) * 100, 100)}%` }}
                ></div>
                {/* Markers for specific thresholds */}
                <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white opacity-100 z-10" title="2.5 Danger Line"></div>
                <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-white opacity-50"></div>
                <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-white opacity-50"></div>
              </div>
            </div>

            {/* Advanced Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <div>
                 <span className="block text-xs text-slate-500 flex items-center gap-1">
                   Est. Standard Error
                   <span title="Lower is better. Approximates precision of utility scores (1/√TotalExposures)." className="cursor-help text-slate-400"><Info className="w-3 h-3"/></span>
                 </span>
                 <span className="block text-lg font-semibold text-slate-700">{metrics.stdError.toFixed(4)}</span>
               </div>
               <div>
                 <span className="block text-xs text-slate-500 flex items-center gap-1">
                   Pairwise Depth
                   <span title="Avg. times any two items appear together. Should be > 0.5 for connectivity." className="cursor-help text-slate-400"><Info className="w-3 h-3"/></span>
                 </span>
                 <span className={`block text-lg font-semibold ${metrics.pairwiseDepth < 0.5 ? 'text-orange-500' : 'text-slate-700'}`}>
                   {metrics.pairwiseDepth.toFixed(2)}
                 </span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
               <div>
                 <span className="block text-sm text-slate-500">Respondent Burden</span>
                 <span className="block text-xl font-semibold text-slate-700">{burdenMinutes.toFixed(1)} <span className="text-sm font-normal text-slate-400">min</span></span>
               </div>
               <div>
                 <span className="block text-sm text-slate-500">Total Observations</span>
                 <span className="block text-xl font-semibold text-slate-700">{(state.nScreens * state.itemsPerScreen * state.sampleSize).toLocaleString()}</span>
               </div>
            </div>
            
            {validation.status === 'Critical' && (
               <div className="mt-6 p-3 bg-red-50 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">
                    <strong>Critical Issue:</strong> Exposures are below 2.5. The design will likely fail to produce valid utility scores. Increase screens or reduce items.
                  </p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
