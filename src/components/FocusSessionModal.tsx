import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface FocusSessionModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProgress: (taskId: string, newProgress: number) => void;
  onCompleteTask: (taskId: string) => void;
}

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateProgress,
  onCompleteTask,
}) => {
  if (!isOpen || !task) return null;

  const initialSeconds = (task.durationMinutes || 45) * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(task.progress || 0);
  const [ambientSound, setAmbientSound] = useState<'none' | 'whitenoise' | 'rain'>('none');

  useEffect(() => {
    setTimeLeft((task.durationMinutes || 45) * 60);
    setCurrentProgress(task.progress || 0);
    setIsActive(false);
  }, [task]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      // Play web audio chime
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch (e) {
        // ignore audio errors in iframe
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleResetTimer = () => {
    setIsActive(false);
    setTimeLeft((task.durationMinutes || 45) * 60);
  };

  const handleSaveAndClose = () => {
    onUpdateProgress(task.id, currentProgress);
    onClose();
  };

  const handleCompleteAndClose = () => {
    onCompleteTask(task.id);
    onClose();
  };

  const pctCompleted = Math.min(
    100,
    Math.round(((initialSeconds - timeLeft) / initialSeconds) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#dee8ff] flex flex-col relative overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0f3ff]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#3525cd]">
              Focus Session
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#505f76] hover:bg-[#f0f3ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Task Details */}
        <div className="mt-4 text-center">
          <span className="px-3 py-1 rounded-full bg-[#dee8ff] text-[#3525cd] text-xs font-semibold">
            {task.subject}
          </span>
          <h3 className="text-2xl font-bold text-[#111c2d] mt-2 font-['Geist']">
            {task.title}
          </h3>
          <p className="text-xs text-[#505f76] mt-1">
            Target Duration: {task.durationMinutes} min • Due: {task.dueDate}
          </p>
        </div>

        {/* Timer Circle */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Background SVG Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="#e7eeff"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="#3525cd"
                strokeWidth="7"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * pctCompleted) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-500 ease-out"
              />
            </svg>

            {/* Inner Time Display */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-[#111c2d] font-['Geist'] tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-[#505f76] font-medium mt-1">
                {isActive ? 'Deep Work In Progress' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handleResetTimer}
            className="w-12 h-12 rounded-full border border-[#c7c4d8] text-[#505f76] flex items-center justify-center hover:bg-[#f0f3ff] transition-all active:scale-95"
            title="Reset"
          >
            <span className="material-symbols-outlined text-[22px]">restart_alt</span>
          </button>

          <button
            onClick={handleToggleTimer}
            className="w-16 h-16 rounded-full bg-[#3525cd] text-white flex items-center justify-center shadow-[0_8px_25px_0_rgba(53,37,205,0.35)] hover:bg-[#2b1eb3] transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[32px]">
              {isActive ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={() => setTimeLeft((prev) => Math.max(0, prev - 300))}
            className="w-12 h-12 rounded-full border border-[#c7c4d8] text-[#505f76] flex items-center justify-center hover:bg-[#f0f3ff] transition-all active:scale-95 text-xs font-bold"
            title="Fast Forward 5m"
          >
            +5m
          </button>
        </div>

        {/* Manual Progress Slider */}
        <div className="bg-[#f9f9ff] p-4 rounded-2xl border border-[#dee8ff] mb-5">
          <div className="flex justify-between items-center text-xs font-semibold text-[#505f76] mb-2">
            <span>Manual Progress</span>
            <span className="text-[#3525cd] font-bold">{currentProgress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={currentProgress}
            onChange={(e) => setCurrentProgress(Number(e.target.value))}
            className="w-full h-2 bg-[#dee8ff] rounded-lg appearance-none cursor-pointer accent-[#3525cd]"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSaveAndClose}
            className="w-full py-3 rounded-xl border border-[#c7c4d8] text-[#505f76] font-semibold text-sm hover:bg-[#f0f3ff] transition-all active:scale-95 cursor-pointer"
          >
            Save Progress
          </button>
          <button
            onClick={handleCompleteAndClose}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Mark Finished
          </button>
        </div>
      </div>
    </div>
  );
};
