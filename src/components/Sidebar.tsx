import React from 'react';
import { UserProfile, TabType, Task } from '../types';
import { BrandLogo } from './BrandLogo';
import { calculateDashboardStats } from '../utils/analytics';

interface SidebarProps {
  user: UserProfile;
  tasks: Task[];
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  tasks,
  currentTab,
  onChangeTab,
  onLogout,
}) => {
  const stats = calculateDashboardStats(tasks, user);

  const navItems: { id: TabType; label: string; icon: string; badge?: boolean; desc?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', desc: 'Daily overview & focus' },
    { id: 'tasks', label: 'My Tasks', icon: 'checklist', desc: 'Assignments & progress' },
    {
      id: 'rescue',
      label: 'Rescue Center',
      icon: 'psychology',
      badge: stats.isOverloaded,
      desc: 'Workload & deficit balance',
    },
    { id: 'schedule', label: 'Weekly Schedule', icon: 'event_note', desc: 'Lectures, labs & breaks' },
    { id: 'settings', label: 'Settings & Profile', icon: 'settings', desc: 'Preferences & AI advisor' },
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[280px] bg-white border-r border-[#e7eeff] z-40 p-5 shadow-[0_4px_20px_0_rgba(79,70,229,0.03)]">
      {/* Brand Header */}
      <div className="pb-5 border-b border-[#f0f3ff]">
        <BrandLogo size="md" />
      </div>

      {/* Student Profile Card */}
      <div className="flex items-center gap-3.5 my-5 p-3 rounded-2xl bg-[#f9f9ff] border border-[#dee8ff]/60">
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#4f46e5]/20 shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-[#111c2d] truncate font-['Geist']">
            {user.name}
          </h2>
          <p className="text-xs text-[#505f76] truncate font-['Inter']">
            {user.role} • CGPA: <span className="font-semibold text-[#3525cd]">{user.cgpa || user.gpa}</span>
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 text-left cursor-pointer group ${
                isActive
                  ? 'bg-[#4f46e5]/10 text-[#3525cd] font-semibold border-r-4 border-[#3525cd] shadow-xs'
                  : 'text-[#505f76] hover:bg-[#f0f3ff] hover:text-[#111c2d]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${
                    isActive ? 'fill text-[#3525cd]' : 'text-[#505f76]'
                  }`}
                >
                  {item.icon}
                </span>
                <div>
                  <div className="text-sm tracking-tight">{item.label}</div>
                  <div className="text-[11px] text-[#777587] font-normal leading-tight">
                    {item.desc}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20 animate-pulse">
                  Alert
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Rescue Alert Widget in Desktop Sidebar */}
      {stats.isOverloaded && (
        <div className="mt-auto pt-4 border-t border-[#f0f3ff]">
          <div
            onClick={() => onChangeTab('rescue')}
            className="p-3.5 rounded-2xl bg-[#ffdad6]/60 border border-[#ba1a1a]/20 cursor-pointer hover:bg-[#ffdad6] transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#ba1a1a]">
                <span className="material-symbols-outlined text-[16px] fill">warning</span>
                Time Deficit
              </span>
              <span className="text-[10px] font-semibold uppercase bg-[#ba1a1a] text-white px-1.5 py-0.5 rounded-md">
                -{stats.timeDeficitHours}h
              </span>
            </div>
            <p className="text-[11px] text-[#54647a] leading-tight mb-2">
              Today is overloaded ({stats.todayRequiredHours}h vs {stats.todayAvailableHours}h target).
            </p>
            <span className="text-xs font-semibold text-[#3525cd] hover:underline flex items-center gap-1">
              Fix in Rescue Center &rarr;
            </span>
          </div>
        </div>
      )}

      {onLogout && (
        <div className="pt-3 mt-2 border-t border-[#f0f3ff]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#505f76] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 rounded-xl transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
