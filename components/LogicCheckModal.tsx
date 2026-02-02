import React, { useEffect, useState } from 'react';
import { ShieldCheck, Loader, X } from 'lucide-react';
import { runSystemDiagnostics } from '../utils/calculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LogicCheckModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'running' | 'success' | 'failure'>('running');

  useEffect(() => {
    if (isOpen) {
      setStatus('running');
      const timer = setTimeout(() => {
        const result = runSystemDiagnostics();
        setStatus(result ? 'success' : 'failure');
      }, 1500); // Fake delay for UX
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          {status === 'running' && (
            <>
              <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-slate-800">Running Diagnostics...</h3>
              <p className="text-sm text-slate-500 mt-2">Verifying Sawtooth algorithms against test vectors.</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">System Integrity Verified</h3>
              <p className="text-sm text-slate-500 mt-2">All mathematical models are performing within expected tolerances.</p>
              <button onClick={onClose} className="mt-6 w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
                Close
              </button>
            </>
          )}
          
          {status === 'failure' && (
            <>
               <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-red-700">Integrity Check Failed</h3>
              <p className="text-sm text-slate-500 mt-2">Math engine returned unexpected results. Please reload.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
