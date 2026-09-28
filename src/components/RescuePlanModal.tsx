import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { generateRescuePlan, RescuePlanResponse } from '../utils/aiApi';

interface RescuePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRescuePlan: () => void;
  tasks: Task[];
}

export const RescuePlanModal: React.FC<RescuePlanModalProps> = ({
  isOpen,
  onClose,
  onApplyRescuePlan,
  tasks,
}) => {
  if (!isOpen) return null;

  const [isExecuting, setIsExecuting] = useState(false);
  const [step, setStep] = useState<'review' | 'confirmed'>('review');
  const [plan, setPlan] = useState<RescuePlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !plan && !isLoading) {
      setIsLoading(true);
      generateRescuePlan(tasks, [])
        .then(data => {
          setPlan(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError('Failed to generate AI Rescue Plan.');
          setIsLoading(false);
        });
    }
  }, [isOpen, tasks, plan, isLoading]);

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      onApplyRescuePlan();
      setIsExecuting(false);
      setStep('confirmed');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-[#dee8ff] relative">
        <div className="flex justify-between items-center pb-3 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">medical_services</span>
            </div>
            <h2 className="text-xl font-bold text-[#111c2d] font-['Geist']">
              Emergency Rescue Plan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#505f76] hover:bg-[#f0f3ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {step === 'review' ? (
          <div className="mt-5 space-y-4">
            {isLoading ? (
              <div className="p-10 flex flex-col items-center justify-center space-y-4">
                <span className="w-8 h-8 border-4 border-[#3525cd] border-t-transparent rounded-full animate-spin"></span>
                <p className="text-xs text-[#505f76] font-medium animate-pulse">Analyzing workload deficit & generating rescue plan...</p>
              </div>
            ) : error ? (
              <div className="p-6 bg-[#fff0f0] border border-[#ffdad6] rounded-2xl text-center text-xs text-[#ba1a1a]">
                {error}
              </div>
            ) : plan ? (
              <>
                {/* Summary Banner */}
                <div className="p-4 rounded-2xl bg-[#ffdad6]/60 border border-[#ba1a1a]/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#ba1a1a] uppercase">AI Assessment</span>
                  </div>
                  <p className="text-xs text-[#54647a] leading-relaxed">
                    {plan.summary}
                  </p>
                </div>

                {/* Adjustments checklist */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#505f76]">
                    Automated Plan Adjustments
                  </h4>

                  {(plan.adjustments || []).map((adj, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#f9f9ff] border border-[#dee8ff] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[#3525cd] text-[18px]">{adj.iconName || 'schedule'}</span>
                        <div>
                          <span className="font-semibold text-[#111c2d]">{adj.title}</span>
                          <p className="text-[#505f76]">{adj.description}</p>
                        </div>
                      </div>
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                        {adj.impact}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Target Outcome */}
                <div className="p-3.5 rounded-2xl bg-[#dee8ff]/50 border border-[#dee8ff] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#3525cd]">Post-Rescue Target Workload</span>
                    <p className="text-[11px] text-[#505f76]">{plan.targetOutcome}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    Optimal Status
                  </span>
                </div>
              </>
            ) : null}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-[#c7c4d8] text-[#505f76] font-semibold text-xs hover:bg-[#f0f3ff] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex-1 py-3 rounded-xl bg-[#3525cd] text-white font-bold text-xs hover:bg-[#2b1eb3] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                {isExecuting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Balancing Schedule...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    Apply Rescue Plan
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h3 className="text-xl font-bold text-[#111c2d]">
              Rescue Plan Implemented!
            </h3>
            <p className="text-xs text-[#505f76] max-w-sm mx-auto leading-relaxed">
              Your Wednesday workload has been balanced to 4.8 hours. SQL practice was rescheduled to Thursday, and high-priority tasks are highlighted for tonight.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#3525cd] text-white font-bold text-xs hover:bg-[#2b1eb3] transition-all shadow-md mt-2"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
