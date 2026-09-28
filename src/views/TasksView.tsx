import React, { useState } from 'react';
import { Task, TaskPriority } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenAddTask: () => void;
  onStartWorking: (task: Task) => void;
}

type FilterType = 'all' | 'active' | 'completed' | 'high_priority' | 'due_soon';

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onOpenAddTask,
  onStartWorking,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'high_priority', label: 'High Priority' },
    { id: 'due_soon', label: 'Due Soon' },
  ];

  const filteredTasks = tasks.filter((task) => {
    // Search query filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Chip category filter
    if (activeFilter === 'active') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    if (activeFilter === 'high_priority') return task.priority === 'high';
    if (activeFilter === 'due_soon')
      return task.dueDate.toLowerCase().includes('today') || task.dueDate.toLowerCase().includes('tomorrow');

    return true;
  });

  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto pb-24 md:pb-10 font-['Inter']">
      {/* Search and Add Task Bar */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#505f76] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#c7c4d8] bg-white focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20 transition-all text-sm text-[#111c2d] outline-none shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#505f76] hover:text-[#111c2d]"
            >
              <span className="material-symbols-outlined text-[18px]">clear</span>
            </button>
          )}
        </div>

        <button
          onClick={onOpenAddTask}
          className="bg-[#3525cd] text-white font-semibold text-sm rounded-xl h-11 px-6 flex items-center justify-center gap-2 hover:bg-[#2b1eb3] transition-all active:scale-95 duration-200 shadow-[0_4px_20px_0_rgba(53,37,205,0.25)] cursor-pointer shrink-0 font-['Geist']"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Task
        </button>
      </div>

      {/* Filter Chips Carousel */}
      <div
        className="flex overflow-x-auto gap-2 py-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none' }}
      >
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-semibold text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#4f46e5] text-white shadow-xs'
                  : 'bg-[#f0f3ff] text-[#505f76] hover:bg-[#dee8ff] border border-[#c7c4d8]/30'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#dee8ff] p-8 shadow-xs">
            <span className="material-symbols-outlined text-5xl text-[#c7c4d8] mb-2">
              task_alt
            </span>
            <h3 className="text-base font-bold text-[#111c2d] font-['Geist']">No tasks found</h3>
            <p className="text-xs text-[#505f76] mt-1 max-w-xs mx-auto">
              Try adjusting your search query or filter, or create a new academic assignment.
            </p>
            <button
              onClick={onOpenAddTask}
              className="mt-4 px-4 py-2 bg-[#3525cd] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#2b1eb3]"
            >
              + Create New Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.completed;

            return (
              <div
                key={task.id}
                className={`bg-white border border-[#c7c4d8]/40 rounded-2xl p-5 shadow-[0_4px_20px_0_rgba(79,70,229,0.04)] hover:shadow-[0_8px_30px_0_rgba(79,70,229,0.08)] transition-all duration-300 group flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                  isCompleted ? 'opacity-70 bg-[#f9f9ff]' : ''
                }`}
              >
                <div className="flex gap-3.5 w-full items-start">
                  {/* Circular Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                      isCompleted
                        ? 'bg-[#3525cd] text-white'
                        : 'border-2 border-[#c7c4d8] hover:border-[#3525cd] text-transparent hover:text-[#3525cd]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>

                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <h3
                      className={`text-base font-semibold text-[#111c2d] font-['Geist'] tracking-tight ${
                        isCompleted ? 'line-through text-[#777587]' : ''
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-[#505f76] text-xs">
                      <span className="flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[15px]">book</span>
                        {task.subject}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">
                          calendar_today
                        </span>
                        {task.dueDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">timer</span>
                        {task.durationMinutes} min
                      </span>
                    </div>

                    {/* Priority Badge */}
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-['Geist'] ${
                          task.priority === 'high'
                            ? 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]'
                            : task.priority === 'medium'
                            ? 'bg-[#d0e1fb] text-[#0b1c30] border border-[#d0e1fb]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {task.priority === 'high'
                          ? 'High Priority'
                          : task.priority === 'medium'
                          ? 'Medium Priority'
                          : 'Low Priority'}
                      </span>

                      {!isCompleted && (
                        <button
                          onClick={() => onStartWorking(task)}
                          className="text-[11px] font-bold text-[#3525cd] hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                          Start Session
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex gap-1 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onEditTask(task)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#505f76] hover:bg-[#dee8ff] hover:text-[#3525cd] transition-colors cursor-pointer"
                    title="Edit Task"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#505f76] hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
