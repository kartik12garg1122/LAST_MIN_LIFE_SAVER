import { Task, ScheduleItem } from '../types';

/**
 * Schedule Engine: Dynamically builds a user-specific daily study timeline
 * from the authenticated user's actual pending tasks (from Supabase).
 */
export function generateScheduleFromTasks(
  tasks: Task[],
  customEvents: ScheduleItem[] = []
): ScheduleItem[] {
  // Filter active (incomplete) tasks
  const pendingTasks = tasks.filter((t) => !t.completed);

  if (pendingTasks.length === 0 && customEvents.length === 0) {
    return [];
  }

  // Sort tasks by priority (high > medium > low) and estimated duration
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    const priorityScore = { high: 3, medium: 2, low: 1 };
    const scoreA = priorityScore[a.priority] || 1;
    const scoreB = priorityScore[b.priority] || 1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (b.durationMinutes || 0) - (a.durationMinutes || 0);
  });

  const scheduleItems: ScheduleItem[] = [];

  // Base starting time for study focus blocks (09:00)
  let currentHour = 9;
  let currentMinute = 0;

  const formatTime = (h: number, m: number): string => {
    const hh = String(h % 24).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const addMinutes = (mins: number) => {
    currentMinute += mins;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  };

  sortedTasks.forEach((task, idx) => {
    const startTimeStr = formatTime(currentHour, currentMinute);
    const duration = task.durationMinutes || 45;

    scheduleItems.push({
      id: `sch-task-${task.id}`,
      time: startTimeStr,
      durationMinutes: duration,
      title: task.title,
      location: task.subject ? `Subject: ${task.subject}` : 'Focus Session',
      type: 'study',
      badgeText:
        task.priority === 'high'
          ? `High Priority • ${duration}m`
          : `${duration} mins`,
      iconName: task.priority === 'high' ? 'priority_high' : 'menu_book',
    });

    addMinutes(duration);

    // Insert a 15-minute recovery break between consecutive study blocks
    if (idx < sortedTasks.length - 1) {
      const breakTimeStr = formatTime(currentHour, currentMinute);
      scheduleItems.push({
        id: `sch-break-${idx}`,
        time: breakTimeStr,
        durationMinutes: 15,
        title: 'Rest & Recovery Break',
        location: '15 min micro-break',
        type: 'break',
        iconName: 'coffee',
      });
      addMinutes(15);
    }
  });

  // Combine with custom user-created schedule items
  const allItems = [...scheduleItems, ...customEvents];
  allItems.sort((a, b) => a.time.localeCompare(b.time));

  return allItems;
}
