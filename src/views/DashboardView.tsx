import React from 'react';
import { Task, DayWorkload, UserProfile } from '../types';
import { calculateDashboardStats } from '../utils/analytics';

interface DashboardViewProps {
  tasks: Task[];
  workload: DayWorkload[];
  user: UserProfile;
  onToggleTask: (taskId: string) => void;
  onStartWorking: (task: Task) => void;
  onOpenAIAdvisor: (mode: 'schedule' | 'recommendations') => void;
  onNavigateToTab: (tab: any) => void;
  onOpenAddTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  user,
  onToggleTask,
  onStartWorking,
  onOpenAIAdvisor,
  onNavigateToTab,
  onOpenAddTask,
}) => {
  const stats = calculateDashboardStats(tasks, user);
  const focusTask = stats.focusTask;
  const todayTasks = stats.todayTasks;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-24 md:pb-10 font-['Inter']">
      {/* 1. Quick Stats (Horizontal Scroll) */}
      <section
        className="flex gap-2.5 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Dynamic Productivity */}
        <div className="snap-start flex-none w-[125px] sm:w-[135px] bg-white rounded-2xl p-4 border border-[#c7c4d8]/30 shadow-[0_4px_20px_0_rgba(79,70,229,0.04)] hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-[#3525cd] mb-1 fill text-[22px]">
            bolt
          </span>
          <p className="text-xs font-semibold text-[#505f76] font-['Geist']">Productivity</p>
          <p className="text-2xl font-bold text-[#111c2d] font-['Geist'] tracking-tight mt-0.5">
            {stats.productivityPercentage}%
          </p>
        </div>

        {/* Dynamic Progress */}
        <div className="snap-start flex-none w-[125px] sm:w-[135px] bg-white rounded-2xl p-4 border border-[#c7c4d8]/30 shadow-[0_4px_20px_0_rgba(79,70,229,0.04)] hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-emerald-600 mb-1 fill text-[22px]">
            check_circle
          </span>
          <p className="text-xs font-semibold text-[#505f76] font-['Geist']">Progress</p>
          <p className="text-2xl font-bold text-[#111c2d] font-['Geist'] tracking-tight mt-0.5">
            {stats.completedCount}/{stats.totalCount}
          </p>
        </div>

        {/* Dynamic Deadlines */}
        <div className="snap-start flex-none w-[125px] sm:w-[135px] bg-white rounded-2xl p-4 border border-[#c7c4d8]/30 shadow-[0_4px_20px_0_rgba(79,70,229,0.04)] hover:shadow-md transition-shadow">
          <span className="material-symbols-outlined text-[#ba1a1a] mb-1 fill text-[22px]">
            warning
          </span>
          <p className="text-xs font-semibold text-[#505f76] font-['Geist']">Deadlines</p>
          <p className="text-2xl font-bold text-[#111c2d] font-['Geist'] tracking-tight mt-0.5">
            {stats.highPriorityCount}
          </p>
        </div>

        {/* Dynamic Workload */}
        <div
          onClick={() => onNavigateToTab('rescue')}
          className="snap-start flex-none w-[125px] sm:w-[135px] bg-white rounded-2xl p-4 border border-[#c7c4d8]/30 shadow-[0_4px_20px_0_rgba(79,70,229,0.04)] hover:shadow-md transition-shadow cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[#46494b] mb-1 fill text-[22px] group-hover:text-[#3525cd]">
            bar_chart
          </span>
          <p className="text-xs font-semibold text-[#505f76] font-['Geist']">Workload</p>
          <p className="text-2xl font-bold text-[#111c2d] font-['Geist'] tracking-tight mt-0.5">
            {stats.workloadPercentage}%
          </p>
        </div>
      </section>

      {/* 2. Attention Section (Featured Focus Task or Empty State) */}
      <section>
        {focusTask ? (
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c7c4d8]/40 shadow-[0_12px_30px_0_rgba(79,70,229,0.07)] relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ba1a1a]" />

            <div className="flex justify-between items-start mb-2 pl-2">
              <span className="bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 font-['Geist']">
                <span className="material-symbols-outlined text-[14px]">priority_high</span>
                {focusTask.priority === 'high' ? 'High Priority' : 'Current Focus'}
              </span>
              <button
                onClick={() => onNavigateToTab('tasks')}
                className="text-[#505f76] hover:text-[#111c2d] p-1 rounded-lg hover:bg-[#f0f3ff]"
                title="View in Tasks"
              >
                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
              </button>
            </div>

            <div className="pl-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111c2d] mb-1 font-['Geist'] tracking-tight">
                {focusTask.title}
              </h2>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-[#505f76] mb-4">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">subject</span>
                  <span>{focusTask.subject}</span>
                </div>
                <div className="flex items-center gap-1 text-[#ba1a1a] font-medium">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>Due: {focusTask.dueDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                  <span>{focusTask.durationMinutes} min</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1.5 font-['Geist']">
                  <span className="text-[#505f76] font-medium">Progress</span>
                  <span className="text-[#3525cd] font-bold">
                    {focusTask.progress || 0}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#f0f3ff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3525cd] rounded-full transition-all duration-500"
                    style={{ width: `${focusTask.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Start Working Button */}
              <button
                onClick={() => onStartWorking(focusTask)}
                className="mt-5 w-full h-11 bg-[#3525cd] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-[#2b1eb3] transition-all shadow-[0_4px_20px_0_rgba(53,37,205,0.25)] cursor-pointer font-['Geist']"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                Start Working
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#c7c4d8]/40 shadow-xs text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-5xl text-emerald-500 mb-2">
              task_alt
            </span>
            <h2 className="text-xl font-bold text-[#111c2d] font-['Geist']">All Caught Up! 🎉</h2>
            <p className="text-xs text-[#505f76] mt-1 max-w-sm">
              You currently have no pending tasks. Add a new task to start tracking your study plan.
            </p>
            <button
              onClick={onOpenAddTask}
              className="mt-4 px-5 py-2.5 bg-[#3525cd] text-white text-xs font-bold rounded-xl hover:bg-[#2b1eb3] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add First Task
            </button>
          </div>
        )}
      </section>

      {/* 3. Today's Plan */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-[#111c2d] font-['Geist'] tracking-tight">
            Today's Plan
          </h3>
          <button
            onClick={onOpenAddTask}
            className="text-xs font-semibold text-[#3525cd] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add Task
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {todayTasks.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-[#dee8ff] text-center text-xs text-[#505f76]">
              No tasks scheduled for today. Click "+ Add Task" above to add your coursework.
            </div>
          ) : (
            todayTasks.map((task) => {
              const isCompleted = task.completed;
              const isSpecialHighlight = focusTask?.id === task.id && !isCompleted;

              return (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`rounded-2xl p-4 border flex items-center gap-3.5 shadow-[0_4px_20px_0_rgba(79,70,229,0.03)] cursor-pointer transition-all duration-200 ${
                    isCompleted
                      ? 'bg-white/70 border-[#dee8ff]/50 opacity-65'
                      : isSpecialHighlight
                      ? 'bg-[#4f46e5]/5 border-[#3525cd]/35'
                      : 'bg-white border-[#c7c4d8]/30 hover:border-[#3525cd]/40'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-[#3525cd] text-white'
                        : 'border-2 border-[#c7c4d8] hover:border-[#3525cd]'
                    }`}
                  >
                    {isCompleted && (
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    )}
                  </button>

                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold text-[#111c2d] truncate ${
                        isCompleted ? 'line-through text-[#777587]' : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-[#505f76] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      <span>{task.durationMinutes}m</span>
                      {task.subject && (
                        <>
                          <span className="text-[#c7c4d8]">•</span>
                          <span>{task.subject}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Priority Status Dot */}
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      task.priority === 'high'
                        ? 'bg-[#ba1a1a]'
                        : task.priority === 'medium'
                        ? 'bg-emerald-500'
                        : 'bg-blue-400'
                    }`}
                    title={`${task.priority} priority`}
                  />
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 4. Dynamic AI Study Advisor */}
      <section>
        <div className="bg-[#f0f3ff] rounded-3xl p-5 sm:p-6 border border-[#c3c0ff]/60 relative overflow-hidden shadow-xs">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#4f46e5]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#3525cd] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <span className="text-sm font-bold text-[#3525cd] font-['Geist']">
              AI Study Advisor
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#464555] mb-4 leading-relaxed font-['Inter']">
            {stats.isOverloaded
              ? `"Your workload is currently overloaded at ${stats.todayRequiredHours} hours today against your target of ${stats.todayAvailableHours} hours. Consider completing high priority tasks first or shifting lower priority assignments in the Rescue Center."`
              : stats.totalCount === 0
              ? `"Welcome! Add your courses and upcoming assignment deadlines to get personalized AI scheduling recommendations."`
              : `"Your workload is balanced today at ${stats.todayRequiredHours} hours (${stats.workloadPercentage}% of daily target). Maintain focus on your current tasks for optimal productivity."`}
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => onOpenAIAdvisor('schedule')}
              className="w-full sm:flex-1 h-11 bg-[#3525cd] text-white font-semibold text-xs sm:text-sm rounded-xl active:scale-[0.98] hover:bg-[#2b1eb3] transition-all cursor-pointer font-['Geist'] shadow-sm flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              Build My Schedule
            </button>
            <button
              onClick={() => onOpenAIAdvisor('recommendations')}
              className="w-full sm:flex-1 h-11 border border-[#c7c4d8] bg-white/70 text-[#505f76] font-semibold text-xs sm:text-sm rounded-xl active:scale-[0.98] hover:bg-white transition-all cursor-pointer font-['Geist'] flex items-center justify-center gap-1.5"
            >
              View Recommendations
            </button>
          </div>
        </div>
      </section>

      {/* 5. Dynamic Weekly Workload */}
      <section className="mb-4">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c7c4d8]/30 shadow-[0_4px_20px_0_rgba(79,70,229,0.04)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-[#505f76] uppercase tracking-wider font-['Geist']">
              Weekly Workload
            </h3>
            <span className="text-xs text-[#505f76]">
              Today:{' '}
              <strong
                className={`font-semibold ${
                  stats.isOverloaded ? 'text-[#ba1a1a]' : 'text-[#3525cd]'
                }`}
              >
                {stats.weeklyWorkload.find((w) => w.isToday)?.fullDay || 'Today'} (
                {stats.workloadPercentage}%)
              </strong>
            </span>
          </div>

          <div className="flex items-end justify-between h-28 gap-2 px-1">
            {stats.weeklyWorkload.map((day, idx) => {
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-full h-20 bg-[#dee8ff]/40 rounded-t-lg flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        day.isToday && stats.isOverloaded
                          ? 'bg-[#ba1a1a]/85'
                          : day.isToday
                          ? 'bg-[#3525cd]/85'
                          : day.status === 'high'
                          ? 'bg-[#ba1a1a]/60'
                          : day.status === 'low'
                          ? 'bg-emerald-500/85'
                          : 'bg-[#dee8ff]'
                      }`}
                      style={{ height: `${Math.max(8, day.percentage)}%` }}
                      title={`${day.fullDay}: ${day.hours}h (${day.percentage}%)`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-['Geist'] ${
                      day.isToday
                        ? 'text-[#111c2d] font-bold'
                        : 'text-[#505f76] font-medium'
                    }`}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
