import React from 'react';
import { ScheduleItem, Task } from '../types';
import { generateScheduleFromTasks } from '../utils/scheduleEngine';

interface ScheduleViewProps {
  schedule?: ScheduleItem[];
  tasks?: Task[];
  onOpenSmartSchedule: () => void;
  onOpenAddEvent: () => void;
  onDeleteScheduleItem?: (id: string) => void;
  onNavigateToTasks?: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  tasks = [],
  onOpenSmartSchedule,
  onOpenAddEvent,
  onDeleteScheduleItem,
  onNavigateToTasks,
}) => {
  // Dynamically derive timeline from Supabase tasks if schedule is not explicitly overridden
  const activeTimeline = schedule && schedule.length > 0
    ? schedule
    : generateScheduleFromTasks(tasks);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-28 md:pb-12 font-['Inter'] relative">
      {/* Top Banner & Action */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#111c2d] font-['Geist']">Today's Timeline</h2>
          <p className="text-xs text-[#505f76]">Synchronized with your tasks & deadlines</p>
        </div>
        <button
          onClick={onOpenAddEvent}
          className="px-3.5 py-2 bg-white border border-[#c7c4d8] text-[#3525cd] hover:bg-[#f0f3ff] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Custom Event
        </button>
      </div>

      {/* Main Timeline Container or Empty State */}
      {activeTimeline.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#dee8ff] text-center shadow-xs my-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#dee8ff] text-[#3525cd] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[32px]">event_busy</span>
          </div>
          <h3 className="text-lg font-bold text-[#111c2d] font-['Geist']">Your schedule is empty</h3>
          <p className="text-xs sm:text-sm text-[#505f76] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Add tasks to your task list and we'll build your schedule around your deadlines.
          </p>
          <button
            onClick={onNavigateToTasks || onOpenAddEvent}
            className="mt-5 px-5 py-2.5 bg-[#3525cd] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#2b1eb3] transition-all flex items-center gap-1.5 cursor-pointer font-['Geist']"
          >
            <span className="material-symbols-outlined text-[18px]">checklist</span>
            Go to My Tasks
          </button>
        </div>
      ) : (
        <div className="relative pl-2 sm:pl-4 pt-2">
          {/* Continuous Vertical Timeline Line */}
          <div className="absolute left-[34px] sm:left-[42px] top-6 bottom-6 w-[2px] bg-[#e2e8f0] z-0" />

          {/* Timeline Items List */}
          <div className="flex flex-col gap-6 relative z-10">
            {activeTimeline.map((item) => {
              const isBreak = item.type === 'break';
              const isStudy = item.type === 'study';

              return (
                <div key={item.id} className="flex gap-3 sm:gap-5 w-full group items-start">
                  {/* Time & Dot Node */}
                  <div className="w-12 sm:w-14 flex flex-col items-center shrink-0">
                    <span className="text-xs font-semibold text-[#505f76] pt-1 font-['Geist']">
                      {item.time}
                    </span>
                    <div
                      className={`w-3.5 h-3.5 rounded-full mt-2 ring-4 ring-[#f9f9ff] shrink-0 transition-transform group-hover:scale-125 ${
                        isBreak
                          ? 'bg-[#d0e1fb]'
                          : isStudy
                          ? 'bg-purple-600'
                          : item.badgeText?.includes('Due') || item.badgeText?.includes('High')
                          ? 'bg-[#ba1a1a]'
                          : 'bg-[#3525cd]'
                      }`}
                    />
                  </div>

                  {/* Event Card */}
                  {isBreak ? (
                    /* Dashed Card for Breaks & Rest */
                    <div className="bg-[#f9f9ff] rounded-2xl p-4 border border-[#c7c4d8]/40 border-dashed flex-1 hover:border-[#3525cd]/40 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#505f76] shadow-xs border border-[#dee8ff]">
                          <span className="material-symbols-outlined text-[18px]">
                            {item.iconName || 'coffee'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#464555] font-['Geist']">
                            {item.title}
                          </h3>
                          {item.location && (
                            <p className="text-xs text-[#777587] mt-0.5">{item.location}</p>
                          )}
                        </div>
                      </div>
                      {onDeleteScheduleItem && (
                        <button
                          onClick={() => onDeleteScheduleItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-[#c7c4d8] hover:text-[#ba1a1a] transition-all p-1 cursor-pointer"
                          title="Delete item"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Solid Card for Task Study Sessions */
                    <div
                      className={`rounded-2xl p-5 shadow-[0_4px_20px_0_rgba(79,70,229,0.04)] border flex-1 hover:shadow-[0_8px_30px_0_rgba(79,70,229,0.08)] transition-all ${
                        isStudy
                          ? 'bg-[#f0f3ff] border-[#c3c0ff]'
                          : 'bg-white border-[#c7c4d8]/35'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="text-sm sm:text-base font-semibold text-[#111c2d] font-['Geist'] tracking-tight">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#505f76] text-[20px]">
                            {item.iconName || 'menu_book'}
                          </span>
                          {onDeleteScheduleItem && (
                            <button
                              onClick={() => onDeleteScheduleItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 text-[#c7c4d8] hover:text-[#ba1a1a] transition-all p-1 cursor-pointer"
                              title="Delete item"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {item.location && (
                        <p className="text-xs text-[#505f76] mb-3">{item.location}</p>
                      )}

                      {/* Tag / Badge */}
                      {item.badgeText && (
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-['Geist'] ${
                            item.badgeText.includes('Due') || item.badgeText.includes('High')
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : isStudy
                              ? 'bg-[#3525cd] text-white'
                              : 'bg-[#4f46e5]/10 text-[#3525cd]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {item.badgeText.includes('High') ? 'priority_high' : 'timer'}
                          </span>
                          <span>{item.badgeText}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button for Smart Schedule */}
      <div className="fixed bottom-[84px] md:bottom-8 left-0 md:left-[280px] right-0 px-4 z-30 flex justify-center pointer-events-none">
        <button
          onClick={onOpenSmartSchedule}
          className="pointer-events-auto bg-[#3525cd] text-white font-semibold text-xs sm:text-sm rounded-full px-6 py-3 flex items-center gap-2 shadow-[0_8px_30px_0_rgba(79,70,229,0.3)] hover:shadow-[0_12px_40px_0_rgba(79,70,229,0.45)] hover:-translate-y-0.5 transition-all active:scale-95 h-11 cursor-pointer font-['Geist']"
        >
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          Generate Smart Schedule
        </button>
      </div>
    </div>
  );
};
