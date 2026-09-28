import { Task, DayWorkload, UserProfile } from '../types';

export interface DashboardStats {
  productivityPercentage: number;
  completedCount: number;
  totalCount: number;
  highPriorityCount: number;
  workloadPercentage: number;
  todayRequiredHours: number;
  todayAvailableHours: number;
  timeDeficitHours: number;
  isOverloaded: boolean;
  weeklyWorkload: DayWorkload[];
  focusTask: Task | null;
  todayTasks: Task[];
}

/**
 * Pure analytics engine to calculate Productivity, Workload, Time Deficit,
 * and Weekly Workload dynamically based on the authenticated user's actual tasks and settings.
 */
export function calculateDashboardStats(tasks: Task[], user: UserProfile): DashboardStats {
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && !t.completed).length;

  // 1. Productivity Calculation
  // Productivity is calculated from overall completion rate weighted by task progress.
  let productivityPercentage = 0;
  if (totalCount > 0) {
    const totalProgressSum = tasks.reduce((sum, task) => {
      if (task.completed) return sum + 100;
      return sum + (task.progress || 0);
    }, 0);
    productivityPercentage = Math.round(totalProgressSum / totalCount);
  }

  // 2. Today's Workload Calculation
  const todayTasks = tasks.filter((t) => t.isToday !== false);
  const pendingTodayTasks = todayTasks.filter((t) => !t.completed);

  // Total estimated minutes for incomplete tasks scheduled for today
  const todayRequiredMinutes = pendingTodayTasks.reduce(
    (sum, t) => sum + (t.durationMinutes || 0),
    0
  );
  const todayRequiredHours = Math.round((todayRequiredMinutes / 60) * 10) / 10;

  const todayAvailableHours = user.dailyStudyTargetHours || user.dailyTarget || 5;

  let workloadPercentage = 0;
  if (todayAvailableHours > 0) {
    workloadPercentage = Math.min(
      100,
      Math.round((todayRequiredHours / todayAvailableHours) * 100)
    );
  }

  const timeDeficitHours =
    todayRequiredHours > todayAvailableHours
      ? Math.round((todayRequiredHours - todayAvailableHours) * 10) / 10
      : 0;

  const isOverloaded = todayRequiredHours > todayAvailableHours;

  // 3. Weekly Workload Calculation
  const daysOfWeek = [
    { day: 'M', fullDay: 'Monday' },
    { day: 'T', fullDay: 'Tuesday' },
    { day: 'W', fullDay: 'Wednesday' },
    { day: 'T', fullDay: 'Thursday' },
    { day: 'F', fullDay: 'Friday' },
    { day: 'S', fullDay: 'Saturday' },
    { day: 'S', fullDay: 'Sunday' },
  ];

  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // Mon = 0, Sun = 6

  const weeklyWorkload: DayWorkload[] = daysOfWeek.map((d, idx) => {
    const isToday = idx === currentDayIndex;

    let dayHours = 0;
    if (isToday) {
      dayHours = todayRequiredHours;
    } else {
      // Find incomplete tasks corresponding to this day or due string
      const dayTasks = tasks.filter((t) => {
        if (t.completed) return false;
        const due = (t.dueDate || '').toLowerCase();
        if (idx === (currentDayIndex + 1) % 7 && due.includes('tomorrow')) return true;
        if (due.includes(d.fullDay.toLowerCase())) return true;
        return false;
      });
      const minutes = dayTasks.reduce((s, t) => s + (t.durationMinutes || 0), 0);
      dayHours = Math.round((minutes / 60) * 10) / 10;
    }

    const pct =
      todayAvailableHours > 0
        ? Math.min(100, Math.round((dayHours / todayAvailableHours) * 100))
        : 0;

    let status: 'normal' | 'high' | 'low' = 'normal';
    if (pct > 80) status = 'high';
    else if (pct < 30) status = 'low';

    return {
      day: d.day,
      fullDay: d.fullDay,
      percentage: pct,
      hours: dayHours,
      isToday,
      status,
    };
  });

  // 4. Focus Task Selection
  // Select highest priority incomplete task, or first incomplete task
  const focusTask =
    tasks.find((t) => !t.completed && t.priority === 'high') ||
    tasks.find((t) => !t.completed) ||
    null;

  return {
    productivityPercentage,
    completedCount,
    totalCount,
    highPriorityCount,
    workloadPercentage,
    todayRequiredHours,
    todayAvailableHours,
    timeDeficitHours,
    isOverloaded,
    weeklyWorkload,
    focusTask,
    todayTasks,
  };
}
