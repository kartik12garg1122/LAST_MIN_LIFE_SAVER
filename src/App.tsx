import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  ScheduleItem,
  DayWorkload,
  UserProfile,
  TabType,
} from './types';
import {
  INITIAL_SCHEDULE,
  INITIAL_WEEKLY_WORKLOAD,
  PRESET_USERS,
} from './data/initialData';

import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  supabaseSignOut,
  fetchSupabaseProfile,
  updateSupabaseProfile,
  fetchSupabaseTasks,
  createSupabaseTask,
  updateSupabaseTask,
  deleteSupabaseTask,
} from './utils/supabaseData';

import {
  getUserProfileByEmail,
  getUserTasksByEmail,
  saveUserProfile,
  saveUserTasksByEmail,
} from './utils/userStore';

import { LandingPage } from './screens/LandingPage';
import { AuthModal } from './components/AuthModal';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { ScheduleView } from './views/ScheduleView';
import { RescueCenterView } from './views/RescueCenterView';
import { SettingsView } from './views/SettingsView';

import { FocusSessionModal } from './components/FocusSessionModal';
import { TaskModal } from './components/TaskModal';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { ScheduleModal } from './components/ScheduleModal';
import { RescuePlanModal } from './components/RescuePlanModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    return (localStorage.getItem('sls_current_tab') as TabType) || 'dashboard';
  });

  // User Profile & Tasks state
  const [user, setUser] = useState<UserProfile>(() => PRESET_USERS[0]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => INITIAL_SCHEDULE);
  const [workload, setWorkload] = useState<DayWorkload[]>(() => INITIAL_WEEKLY_WORKLOAD);
  const [isRescueBalanced, setIsRescueBalanced] = useState<boolean>(false);

  // Modal states
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [aiAdvisorInitialMode, setAIAdvisorInitialMode] = useState<'schedule' | 'recommendations'>('recommendations');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRescuePlanModalOpen, setIsRescuePlanModalOpen] = useState(false);

  // 1. Supabase Session Listener (Source of Truth)
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Fallback for offline or local preview before env vars are populated
      const localEmail = localStorage.getItem('sls_active_email_v2') || PRESET_USERS[0].email;
      setUser(getUserProfileByEmail(localEmail));
      setTasks(getUserTasksByEmail(localEmail));
      setIsAuthenticated(localStorage.getItem('sls_is_authenticated') === 'true');
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUserId(session.user.id);
        setIsAuthenticated(true);
        loadSupabaseUserData(session.user.id, session.user.email || '');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUserId(session.user.id);
        setIsAuthenticated(true);
        await loadSupabaseUserData(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        // Only clear auth if the user was actually signed in via Supabase
        // (don't kick out local/demo users who never had a real session)
        setSupabaseUserId((prev) => {
          if (prev !== null) {
            setIsAuthenticated(false);
          }
          return null;
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSupabaseUserData = async (userId: string, email: string) => {
    try {
      const fetchedProfile = await fetchSupabaseProfile(userId);
      if (fetchedProfile) {
        setUser(fetchedProfile);
      } else {
        const fallback = getUserProfileByEmail(email);
        setUser({ ...fallback, id: userId });
        await updateSupabaseProfile(userId, fallback);
      }

      const fetchedTasks = await fetchSupabaseTasks(userId);
      if (fetchedTasks && fetchedTasks.length > 0) {
        setTasks(fetchedTasks);
      } else {
        // If Supabase table currently has 0 tasks for user, seed initial tasks if desired
        const fallbackTasks = getUserTasksByEmail(email);
        setTasks(fallbackTasks);
        for (const t of fallbackTasks) {
          await createSupabaseTask(userId, t);
        }
      }
    } catch (e) {
      console.error('Error loading Supabase user data:', e);
    }
  };

  useEffect(() => {
    localStorage.setItem('sls_current_tab', currentTab);
  }, [currentTab]);

  // Auth Handlers
  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleSuccessLogin = async (email: string, name?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!isSupabaseConfigured()) {
      setUser(getUserProfileByEmail(cleanEmail, name));
      setTasks(getUserTasksByEmail(cleanEmail));
      setIsAuthenticated(true);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      // Full Supabase session — load cloud data
      setSupabaseUserId(session.user.id);
      setIsAuthenticated(true);
      await loadSupabaseUserData(session.user.id, cleanEmail);
    } else {
      // No Supabase session (e.g. demo user or rate-limited signup) — use local data
      setUser(getUserProfileByEmail(cleanEmail, name));
      setTasks(getUserTasksByEmail(cleanEmail));
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabaseSignOut();
    }
    setSupabaseUserId(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sls_is_authenticated');
  };

  // Task Operations (Supabase + React state sync)
  const handleToggleTask = async (taskId: string) => {
    const targetTask = tasks.find((t) => String(t.id) === String(taskId));
    if (!targetTask) return;

    const nextCompleted = !targetTask.completed;
    if (nextCompleted) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#3525cd', '#4f46e5', '#10b981', '#fbbf24'],
        });
      } catch (e) {
        // ignore
      }
    }

    // Update React state immediately
    setTasks((prev) =>
      prev.map((t) =>
        String(t.id) === String(taskId)
          ? { ...t, completed: nextCompleted, progress: nextCompleted ? 100 : t.progress || 0 }
          : t
      )
    );

    // Sync to Supabase
    if (supabaseUserId && isSupabaseConfigured()) {
      await updateSupabaseTask(taskId, { completed: nextCompleted, progress: nextCompleted ? 100 : 0 }, supabaseUserId);
    } else {
      saveUserTasksByEmail(user.email, tasks);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Edit existing task
      setTasks((prev) =>
        prev.map((t) => (String(t.id) === String(taskData.id) ? ({ ...t, ...taskData } as Task) : t))
      );

      if (supabaseUserId && isSupabaseConfigured()) {
        await updateSupabaseTask(taskData.id, taskData, supabaseUserId);
      }
    } else {
      // Create new task
      const tempId = 'task-' + Date.now();
      const newTask: Task = {
        id: tempId,
        title: taskData.title || 'New Assignment',
        subject: taskData.subject || 'General',
        dueDate: taskData.dueDate || 'Tomorrow 10 PM',
        durationMinutes: taskData.durationMinutes || 45,
        priority: taskData.priority || 'high',
        completed: false,
        progress: 0,
        notes: taskData.notes || '',
        isToday: taskData.isToday ?? true,
      };

      if (supabaseUserId && isSupabaseConfigured) {
        const createdSupabaseTask = await createSupabaseTask(supabaseUserId, newTask);
        if (createdSupabaseTask) {
          setTasks((prev) => [createdSupabaseTask, ...prev]);
          return;
        }
      }

      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleDeleteTask = async (taskId: string | number) => {
    setTasks((prev) => prev.filter((t) => String(t.id) !== String(taskId)));

    if (supabaseUserId && isSupabaseConfigured) {
      await deleteSupabaseTask(taskId, supabaseUserId);
    }
  };

  const handleUpdateUser = async (updated: Partial<UserProfile>) => {
    const newUser = { ...user, ...updated };
    setUser(newUser);

    if (supabaseUserId && isSupabaseConfigured) {
      await updateSupabaseProfile(supabaseUserId, updated);
    } else {
      saveUserProfile(newUser);
    }
  };

  const handleStartWorking = (task: Task) => {
    setFocusTask(task);
    setIsFocusModalOpen(true);
  };

  const handleUpdateTaskProgress = (taskId: string, newProgress: number) => {
    setTasks((prev) =>
      prev.map((t) => (String(t.id) === String(taskId) ? { ...t, progress: newProgress } : t))
    );
  };

  const handleCompleteTaskFromFocus = (taskId: string) => {
    handleToggleTask(taskId);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenAIAdvisor = (mode: 'schedule' | 'recommendations') => {
    setAIAdvisorInitialMode(mode);
    setIsAIAdvisorOpen(true);
  };

  const handleApplyScheduleUpdates = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3525cd', '#10b981'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleAddScheduleItem = (newItem: ScheduleItem) => {
    setSchedule((prev) => [...prev, newItem].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const handleDeleteScheduleItem = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  const handleApplyRescuePlan = () => {
    setIsRescueBalanced(true);
    setTasks((prev) => {
      let shifted = false;
      return prev.map((t) => {
        if (!shifted && !t.completed && t.priority !== 'high') {
          shifted = true;
          return { ...t, dueDate: 'Thursday 10:00 AM', isToday: false };
        }
        return t;
      });
    });

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3525cd', '#10b981', '#6366f1'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleResetData = () => {
    setTasks([]);
    setIsRescueBalanced(false);
  };

  // Unauthenticated experience: render LandingPage + AuthModal
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onOpenLogin={handleOpenLogin} onOpenSignup={handleOpenSignup} />
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccessLogin={handleSuccessLogin}
        />
      </>
    );
  }

  // Authenticated workspace experience
  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex flex-col md:flex-row antialiased font-['Inter']">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        user={user}
        tasks={tasks}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onLogout={handleLogout}
      />

      {/* Main Container Area */}
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen">
        {/* Sticky Top Header */}
        <Header
          user={user}
          currentTab={currentTab}
          onLogout={handleLogout}
        />

        {/* View Switcher */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              workload={workload}
              user={user}
              onToggleTask={handleToggleTask}
              onStartWorking={handleStartWorking}
              onOpenAIAdvisor={handleOpenAIAdvisor}
              onNavigateToTab={setCurrentTab}
              onOpenAddTask={handleOpenAddTask}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleOpenEditTask}
              onOpenAddTask={handleOpenAddTask}
              onStartWorking={handleStartWorking}
            />
          )}

          {currentTab === 'schedule' && (
            <ScheduleView
              schedule={schedule}
              onOpenSmartSchedule={() => handleOpenAIAdvisor('schedule')}
              onOpenAddEvent={() => setIsScheduleModalOpen(true)}
              onDeleteScheduleItem={handleDeleteScheduleItem}
            />
          )}

          {currentTab === 'rescue' && (
            <RescueCenterView
              tasks={tasks}
              workload={workload}
              user={user}
              isBalanced={isRescueBalanced}
              onOpenRescuePlan={() => setIsRescuePlanModalOpen(true)}
              onStartWorking={handleStartWorking}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              onUpdateUser={handleUpdateUser}
              onResetData={handleResetData}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Mobile Glass Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          rescueWarning={!isRescueBalanced}
        />
      </div>

      {/* Interactive Modals & Drawers */}
      <FocusSessionModal
        task={focusTask}
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        onUpdateProgress={handleUpdateTaskProgress}
        onCompleteTask={handleCompleteTaskFromFocus}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        initialTask={editingTask}
      />

      <AIAdvisorModal
        isOpen={isAIAdvisorOpen}
        onClose={() => setIsAIAdvisorOpen(false)}
        tasks={tasks}
        schedule={schedule}
        onApplyScheduleUpdates={handleApplyScheduleUpdates}
        initialMode={aiAdvisorInitialMode}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onAddScheduleItem={handleAddScheduleItem}
      />

      <RescuePlanModal
        isOpen={isRescuePlanModalOpen}
        onClose={() => setIsRescuePlanModalOpen(false)}
        onApplyRescuePlan={handleApplyRescuePlan}
        tasks={tasks}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={handleSuccessLogin}
      />
    </div>
  );
}
