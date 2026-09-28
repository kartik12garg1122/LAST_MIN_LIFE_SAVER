import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  rescueWarning?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  rescueWarning = true,
}) => {
  const tabs: { id: TabType; label: string; icon: string; badge?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'tasks', label: 'Tasks', icon: 'checklist' },
    { id: 'rescue', label: 'Rescue', icon: 'emergency', badge: rescueWarning },
    { id: 'schedule', label: 'Schedule', icon: 'calendar_month' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 px-3 pb-6 pt-2 bg-[#f9f9ff]/90 backdrop-blur-lg border-t border-[#dee8ff] shadow-[0_-4px_20px_0_rgba(79,70,229,0.06)] rounded-t-3xl flex justify-around items-center">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-2 px-3.5 transition-all duration-200 cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-[#4f46e5] text-white rounded-2xl shadow-sm'
                : 'text-[#505f76] hover:text-[#3525cd] hover:bg-[#dee8ff]/40 rounded-xl'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? 'fill' : ''
                }`}
              >
                {tab.icon}
              </span>
              {tab.badge && !isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white animate-ping" />
              )}
              {tab.badge && !isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white" />
              )}
            </div>
            <span
              className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                isActive ? 'font-semibold text-white' : 'text-[#505f76]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
