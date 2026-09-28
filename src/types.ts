export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  dueTime?: string;
  durationMinutes: number;
  priority: TaskPriority;
  completed: boolean;
  progress?: number; // 0 - 100
  notes?: string;
  isToday?: boolean;
}

export type ScheduleItemType = 'class' | 'break' | 'lab' | 'study' | 'lecture' | 'custom';

export interface ScheduleItem {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  location?: string;
  durationMinutes?: number;
  type: ScheduleItemType;
  badgeText?: string;
  iconName?: string;
  isCompleted?: boolean;
}

export interface DayWorkload {
  day: string; // 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S'
  fullDay: string;
  percentage: number;
  hours: number;
  isToday?: boolean;
  status: 'normal' | 'high' | 'low';
}

export interface UserProfile {
  id?: string;
  email: string;
  name: string;
  role: string;
  program: string;
  cgpa: string;
  gpa: string;
  avatarUrl: string;
  dailyStudyTargetHours: number;
  dailyTarget?: number;
}

export type TabType = 'dashboard' | 'tasks' | 'rescue' | 'schedule' | 'settings';
