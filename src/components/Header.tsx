import React from 'react';
import { UserProfile, TabType } from '../types';

interface HeaderProps {
  user: UserProfile;
  currentTab: TabType;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentTab,
  onLogout,
}) => {
  const getHeaderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: `Good evening, ${user.name || 'Student'} 👋`,
          subtitle: "Here's what needs your attention today.",
          showAvatar: true,
        };
      case 'tasks':
        return {
          title: 'My Tasks',
          subtitle: 'Everything you need to get done.',
          showAvatar: true,
        };
      case 'rescue':
        return {
          title: 'Rescue Center',
          subtitle: 'Catch problems before they become missed deadlines.',
          showAvatar: false,
          icon: 'psychology',
        };
      case 'schedule':
        return {
          title: 'Your Schedule',
          subtitle: 'Optimized timeline for peak focus and breaks.',
          showAvatar: true,
        };
      case 'settings':
        return {
          title: 'Settings & Profile',
          subtitle: 'Manage your academic preferences and AI tuning.',
          showAvatar: true,
        };
      default:
        return {
          title: 'Student Life Saver',
          subtitle: 'Academic productivity system',
          showAvatar: true,
        };
    }
  };

  const content = getHeaderContent();

  return (
    <header className="bg-[#f9f9ff]/90 backdrop-blur-md sticky top-0 z-30 flex justify-between items-center w-full px-4 sm:px-6 py-3.5 border-b border-[#e7eeff]">
      <div className="flex items-center gap-3">
        {content.showAvatar ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#dee8ff] shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#4f46e5]/10 flex items-center justify-center text-[#3525cd]">
            <span className="material-symbols-outlined text-[24px]">
              {content.icon || 'school'}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#3525cd] tracking-tight font-['Geist']">
            {content.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#505f76] line-clamp-1 font-['Inter']">
            {content.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2.5 rounded-full text-[#505f76] hover:bg-[#ffdad6]/40 hover:text-[#ba1a1a] transition-all active:scale-95 duration-200 cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
