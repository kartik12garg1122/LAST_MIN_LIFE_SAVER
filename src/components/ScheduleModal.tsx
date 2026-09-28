import React, { useState } from 'react';
import { ScheduleItem, ScheduleItemType } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddScheduleItem: (item: ScheduleItem) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onAddScheduleItem,
}) => {
  if (!isOpen) return null;

  const [time, setTime] = useState('15:30');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [type, setType] = useState<ScheduleItemType>('study');
  const [badgeText, setBadgeText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let icon = 'menu_book';
    if (type === 'break') icon = 'coffee';
    if (type === 'lab') icon = 'database';
    if (type === 'lecture') icon = 'memory';
    if (type === 'study') icon = 'psychology';

    onAddScheduleItem({
      id: 'sch-' + Date.now(),
      time,
      title: title.trim(),
      location: location.trim() || undefined,
      durationMinutes,
      type,
      badgeText: badgeText.trim() || undefined,
      iconName: icon,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#dee8ff] relative">
        <div className="flex justify-between items-center pb-3 border-b border-[#f0f3ff]">
          <h2 className="text-xl font-bold text-[#111c2d] font-['Geist']">
            Add Timeline Event
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#505f76] hover:bg-[#f0f3ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs font-['Inter']">
          <div>
            <label className="block font-bold text-[#505f76] uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Algorithm Study Session"
              className="w-full h-10 px-3 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#505f76] uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#505f76] uppercase tracking-wider mb-1">
                Duration (mins)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#505f76] uppercase tracking-wider mb-1">
                Event Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ScheduleItemType)}
                className="w-full h-10 px-3 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] outline-none bg-white"
              >
                <option value="class">Class / Course</option>
                <option value="study">Study Session</option>
                <option value="lab">Lab Session</option>
                <option value="lecture">Lecture</option>
                <option value="break">Break / Meal</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#505f76] uppercase tracking-wider mb-1">
                Badge / Tag (Optional)
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. Project Due"
                className="w-full h-10 px-3 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#505f76] uppercase tracking-wider mb-1">
              Location / Link (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Library Study Hall or Online Link"
              className="w-full h-10 px-3 rounded-xl border border-[#c7c4d8] text-sm text-[#111c2d] focus:border-[#3525cd] outline-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#c7c4d8] text-[#505f76] font-semibold text-xs hover:bg-[#f0f3ff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#3525cd] text-white font-bold text-xs hover:bg-[#2b1eb3] shadow-md"
            >
              Add to Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
