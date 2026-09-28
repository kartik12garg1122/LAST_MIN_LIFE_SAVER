import { UserProfile, Task } from '../types';
import {
  PRESET_USERS,
  INITIAL_TASKS_USER_A,
  INITIAL_TASKS_USER_B,
  INITIAL_TASKS_USER_C,
  getAvatarForUser,
} from '../data/initialData';

const USERS_STORAGE_KEY = 'sls_users_db_v2';
const ACTIVE_USER_EMAIL_KEY = 'sls_active_email_v2';

/**
 * Initializes and retrieves all registered user profiles from localStorage.
 */
export function getAllUsers(): Record<string, UserProfile> {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse users database', e);
    }
  }

  // Seed with Preset Users A, B, C
  const initialDb: Record<string, UserProfile> = {};
  PRESET_USERS.forEach((u) => {
    initialDb[u.email.toLowerCase()] = u;
  });
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialDb));

  // Seed tasks for preset users
  localStorage.setItem(`sls_tasks_${PRESET_USERS[0].email.toLowerCase()}`, JSON.stringify(INITIAL_TASKS_USER_A));
  localStorage.setItem(`sls_tasks_${PRESET_USERS[1].email.toLowerCase()}`, JSON.stringify(INITIAL_TASKS_USER_B));
  localStorage.setItem(`sls_tasks_${PRESET_USERS[2].email.toLowerCase()}`, JSON.stringify(INITIAL_TASKS_USER_C));

  return initialDb;
}

/**
 * Gets active user email or defaults to User A.
 */
export function getActiveUserEmail(): string {
  return localStorage.getItem(ACTIVE_USER_EMAIL_KEY) || PRESET_USERS[0].email;
}

/**
 * Sets active user email.
 */
export function setActiveUserEmail(email: string): void {
  localStorage.setItem(ACTIVE_USER_EMAIL_KEY, email.toLowerCase());
}

/**
 * Gets a specific user profile by email or creates a default profile if not found.
 */
export function getUserProfileByEmail(email: string, nameInput?: string): UserProfile {
  const users = getAllUsers();
  const normalized = email.toLowerCase().trim();

  if (users[normalized]) {
    return users[normalized];
  }

  // Create new user profile with sensible defaults
  const displayName = nameInput || normalized.split('@')[0] || 'Student';
  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    email: normalized,
    name: displayName,
    role: 'Undergraduate',
    program: 'Computer Science',
    cgpa: '8.50',
    gpa: '8.50',
    avatarUrl: getAvatarForUser(displayName, normalized),
    dailyStudyTargetHours: 5,
    dailyTarget: 5,
  };

  users[normalized] = newUser;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Also seed default tasks for this new user
  const newTasks: Task[] = [
    {
      id: `task-${Date.now()}-1`,
      title: `${displayName}'s First Assignment`,
      subject: 'Core Subject',
      dueDate: 'Tomorrow 10 PM',
      durationMinutes: 60,
      priority: 'high',
      completed: false,
      progress: 25,
      notes: 'Welcome! Add or complete tasks to track your dynamic productivity and workload.',
      isToday: true,
    },
    {
      id: `task-${Date.now()}-2`,
      title: 'Course Reading & Review',
      subject: 'General',
      dueDate: 'Today 8 PM',
      durationMinutes: 45,
      priority: 'medium',
      completed: true,
      progress: 100,
      notes: 'Initial course review completed.',
      isToday: true,
    },
  ];
  saveUserTasksByEmail(normalized, newTasks);

  return newUser;
}

/**
 * Saves/updates a user profile.
 */
export function saveUserProfile(user: UserProfile): void {
  const users = getAllUsers();
  const normalized = user.email.toLowerCase().trim();
  users[normalized] = {
    ...user,
    gpa: user.cgpa || user.gpa || '8.50',
    cgpa: user.cgpa || user.gpa || '8.50',
    dailyTarget: user.dailyStudyTargetHours || user.dailyTarget || 5,
    dailyStudyTargetHours: user.dailyStudyTargetHours || user.dailyTarget || 5,
  };
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Sync to API asynchronously
  fetch('/api/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalized, profile: users[normalized] }),
  }).catch(() => {
    // ignore API errors if offline
  });
}

/**
 * Retrieves tasks for a given user email.
 */
export function getUserTasksByEmail(email: string): Task[] {
  const normalized = email.toLowerCase().trim();
  const key = `sls_tasks_${normalized}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse user tasks', e);
    }
  }

  // Fallback if preset
  if (normalized === PRESET_USERS[0].email.toLowerCase()) return INITIAL_TASKS_USER_A;
  if (normalized === PRESET_USERS[1].email.toLowerCase()) return INITIAL_TASKS_USER_B;
  if (normalized === PRESET_USERS[2].email.toLowerCase()) return INITIAL_TASKS_USER_C;

  return [];
}

/**
 * Saves tasks for a given user email.
 */
export function saveUserTasksByEmail(email: string, tasks: Task[]): void {
  const normalized = email.toLowerCase().trim();
  const key = `sls_tasks_${normalized}`;
  localStorage.setItem(key, JSON.stringify(tasks));

  // Sync to API asynchronously
  fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalized, tasks }),
  }).catch(() => {
    // ignore API errors if offline
  });
}
