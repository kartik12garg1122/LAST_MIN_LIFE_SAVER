import React, { useState, useEffect } from 'react';
import { Task, TaskPriority } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Partial<Task>) => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialTask,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('DBMS');
  const [dueDate, setDueDate] = useState('Tomorrow 10 PM');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [notes, setNotes] = useState('');
  const [isToday, setIsToday] = useState(true);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setSubject(initialTask.subject);
      setDueDate(initialTask.dueDate);
      setDurationMinutes(initialTask.durationMinutes || 60);
      setPriority(initialTask.priority);
      setNotes(initialTask.notes || '');
      setIsToday(initialTask.isToday ?? true);
    } else {
      setTitle('');
      setSubject('DBMS');
      setDueDate('Tomorrow 10 PM');
      setDurationMinutes(60);
      setPriority('high');
      setNotes('');
      setIsToday(true);
    }
  }, [initialTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      id: initialTask?.id,
      title: title.trim(),
      subject: subject.trim(),
      dueDate: dueDate.trim(),
      durationMinutes: Number(durationMinutes),
      priority,
      notes: notes.trim(),
      isToday,
      completed: initialTask ? initialTask.completed : false,
      progress: initialTask ? initialTask.progress : 0,
    });
    onClose();
  };

  const commonSubjects = ['DBMS', 'DSA', 'OS', 'Calculus', 'Networks', 'AI', 'Ethics'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-[#dee8ff] relative">
        <div className="flex justify-between items-center pb-3 border-b border-[#f0f3ff]">
          <h2 className="text-xl font-bold text-[#111c2d] font-['Geist']">
            {initialTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#505f76] hover:bg-[#f0f3ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-['Inter']">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#505f76] uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Binary Tree Assignment"
              className="w-full h-11 px-3.5 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all"
            />
          </div>

          {/* Subject & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#505f76] uppercase tracking-wider mb-1.5">
                Subject / Course
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                list="subjects-list"
                placeholder="DBMS"
                className="w-full h-11 px-3.5 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all"
              />
              <datalist id="subjects-list">
                {commonSubjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#505f76] uppercase tracking-wider mb-1.5">
                Estimated Time (mins)
              </label>
              <input
                type="number"
                min="10"
                max="360"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-[#505f76] uppercase tracking-wider mb-1.5">
              Due Date & Time
            </label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. Aug 20, 10:00 PM or Tomorrow 10 PM"
              className="w-full h-11 px-3.5 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-[#505f76] uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  priority === 'high'
                    ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30 shadow-xs'
                    : 'bg-[#f9f9ff] text-[#505f76] border-[#dee8ff] hover:bg-[#f0f3ff]'
                }`}
              >
                🔴 High Priority
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  priority === 'medium'
                    ? 'bg-[#d0e1fb] text-[#0b1c30] border-[#505f76]/30 shadow-xs'
                    : 'bg-[#f9f9ff] text-[#505f76] border-[#dee8ff] hover:bg-[#f0f3ff]'
                }`}
              >
                🔵 Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  priority === 'low'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                    : 'bg-[#f9f9ff] text-[#505f76] border-[#dee8ff] hover:bg-[#f0f3ff]'
                }`}
              >
                🟢 Low
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#505f76] uppercase tracking-wider mb-1.5">
              Task Notes / Subgoals (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What specifically needs to be completed?"
              className="w-full p-3 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Include in Today's Plan */}
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isToday}
              onChange={(e) => setIsToday(e.target.checked)}
              className="w-4 h-4 rounded text-[#3525cd] focus:ring-[#3525cd] border-[#c7c4d8]"
            />
            <span className="text-xs font-semibold text-[#111c2d]">
              Include in Today's Plan & Workload calculation
            </span>
          </label>

          {/* Submit Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#c7c4d8] text-[#505f76] font-semibold text-sm hover:bg-[#f0f3ff] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#3525cd] text-white font-semibold text-sm hover:bg-[#2b1eb3] transition-all shadow-[0_4px_20px_0_rgba(79,70,229,0.25)]"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
