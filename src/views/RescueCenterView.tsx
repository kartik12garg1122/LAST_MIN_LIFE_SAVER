import React from 'react';
import { Task, DayWorkload, UserProfile } from '../types';
import { calculateDashboardStats } from '../utils/analytics';

interface RescueCenterViewProps {
  tasks: Task[];
  workload: DayWorkload[];
  user: UserProfile;
  isBalanced?: boolean;
  onOpenRescuePlan: () => void;
  onStartWorking: (task: Task) => void;
}

export const RescueCenterView: React.FC<RescueCenterViewProps> = ({
  tasks,
  user,
  isBalanced = false,
  onOpenRescuePlan,
  onStartWorking,
}) => {
  const stats = calculateDashboardStats(tasks, user);
  const isOverloaded = !isBalanced && stats.isOverloaded;
  const highPriorityTasks = tasks.filter((t) => !t.completed && t.priority === 'high');

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto pb-24 md:pb-10 font-['Inter']">
      <p className="text-xs sm:text-sm text-[#505f76] -mt-1 font-['Inter']">
        Catch problems before they become missed deadlines.
      </p>

      {/* Dynamic Warning Section */}
      {isOverloaded ? (
        <section className="bg-[#ffdad6] text-[#ba1a1a] rounded-2xl p-5 shadow-sm border border-[#ba1a1a]/20 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined fill text-[#ba1a1a] text-[24px]">
              warning
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#ba1a1a] font-['Geist'] tracking-tight">
              You're falling behind
            </h2>
          </div>
          <div className="inline-block bg-[#ba1a1a]/10 text-[#ba1a1a] px-2.5 py-0.5 rounded-full text-xs font-bold w-max font-['Geist']">
            High Risk ({stats.timeDeficitHours}h Deficit)
          </div>
        </section>
      ) : (
        <section className="bg-emerald-50 text-emerald-800 rounded-2xl p-5 shadow-sm border border-emerald-300 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined fill text-emerald-600 text-[24px]">
              check_circle
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-emerald-900 font-['Geist'] tracking-tight">
              Workload Perfectly Balanced
            </h2>
          </div>
          <div className="inline-block bg-emerald-200/80 text-emerald-900 px-2.5 py-0.5 rounded-full text-xs font-bold w-max font-['Geist']">
            Optimal State
          </div>
        </section>
      )}

      {/* Dynamic Time Deficit Section */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_0_rgba(79,70,229,0.04)] border border-[#c7c4d8]/30 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-[#505f76] uppercase tracking-wider font-['Geist']">
          Time Deficit
        </h3>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-[#505f76]">Available Daily Target</p>
            <p className="text-xl sm:text-2xl font-bold text-[#111c2d] font-['Geist'] mt-0.5">
              {stats.todayAvailableHours} hours
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#505f76]">Required Work Today</p>
            <p
              className={`text-xl sm:text-2xl font-bold font-['Geist'] mt-0.5 ${
                isOverloaded ? 'text-[#ba1a1a]' : 'text-emerald-700'
              }`}
            >
              {stats.todayRequiredHours} hours
            </p>
          </div>
        </div>

        {/* Deficit Progress Bar */}
        <div className="h-2.5 w-full bg-[#f0f3ff] rounded-full overflow-hidden mt-1 relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isOverloaded ? 'bg-[#ba1a1a]' : 'bg-emerald-500'
            }`}
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  (stats.todayRequiredHours / (stats.todayAvailableHours || 1)) * 100
                )
              )}%`,
            }}
          />
        </div>

        <p
          className={`text-xs font-medium mt-0.5 ${
            isOverloaded ? 'text-[#ba1a1a]' : 'text-emerald-700'
          }`}
        >
          {isOverloaded
            ? `-${stats.timeDeficitHours}h deficit (Overloaded by ${Math.round(
                ((stats.todayRequiredHours / stats.todayAvailableHours) - 1) * 100
              )}%)`
            : '0.0h deficit (Balanced)'}
        </p>
      </section>

      {/* Recommended Actions Section */}
      <section className="mb-2">
        <h3 className="text-base sm:text-lg font-bold text-[#111c2d] mb-3 font-['Geist']">
          Recommended Actions
        </h3>

        <div className="flex flex-col gap-2.5">
          {highPriorityTasks.length > 0 ? (
            highPriorityTasks.slice(0, 3).map((task, idx) => (
              <div
                key={task.id}
                onClick={() => onStartWorking(task)}
                className="bg-white rounded-2xl p-4 border border-[#c7c4d8]/30 flex items-start gap-3.5 shadow-sm hover:border-[#3525cd]/40 transition-all cursor-pointer group"
              >
                <div className="bg-[#4f46e5]/10 p-2.5 rounded-xl mt-0.5 text-[#3525cd] shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">priority_high</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111c2d] font-['Geist']">
                    Complete {task.title} tonight
                  </p>
                  <p className="text-xs text-[#505f76] mt-0.5">
                    High priority task for {task.subject} ({task.durationMinutes}m duration, due:{' '}
                    {task.dueDate}).
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#505f76] text-[20px] self-center">
                  chevron_right
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 bg-white rounded-2xl border border-[#dee8ff] text-xs text-[#505f76] text-center">
              No urgent high-priority tasks requiring emergency intervention!
            </div>
          )}
        </div>
      </section>

      {/* Primary Action Button */}
      <button
        onClick={onOpenRescuePlan}
        className="w-full bg-[#3525cd] text-white font-semibold text-sm py-3.5 rounded-xl shadow-[0_4px_20px_0_rgba(53,37,205,0.25)] hover:bg-[#2b1eb3] transition-all flex items-center justify-center gap-2 active:scale-[0.98] duration-200 cursor-pointer font-['Geist']"
      >
        <span className="material-symbols-outlined text-[18px]">medical_services</span>
        {!isOverloaded ? 'Re-Analyze Rescue Plan' : 'Create Rescue Plan'}
      </button>
    </div>
  );
};
