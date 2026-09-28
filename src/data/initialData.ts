import { Task, ScheduleItem, DayWorkload, UserProfile } from '../types';

export function getAvatarForUser(name: string, email: string): string {
  const cleanName = name || 'Student';
  const encodedName = encodeURIComponent(cleanName);
  
  // Deterministic color selection based on email string
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bgColors = ['3525cd', '059669', 'd97706', '7c3aed', 'dc2626', '2563eb', '0891b2'];
  const colorIndex = Math.abs(hash) % bgColors.length;
  const bg = bgColors[colorIndex];

  return `https://ui-avatars.com/api/?name=${encodedName}&background=${bg}&color=fff&bold=true&size=128`;
}

export const PRESET_USERS: UserProfile[] = [
  {
    id: 'user-a',
    email: 'alex@student.edu',
    name: 'Alex Morgan',
    role: 'Undergraduate',
    program: 'Computer Science',
    cgpa: '9.20',
    gpa: '9.20',
    avatarUrl: getAvatarForUser('Alex Morgan', 'alex@student.edu'),
    dailyStudyTargetHours: 5,
    dailyTarget: 5,
  },
  {
    id: 'user-b',
    email: 'sarah@student.edu',
    name: 'Sarah Chen',
    role: 'Undergraduate',
    program: 'Data Science',
    cgpa: '8.65',
    gpa: '8.65',
    avatarUrl: getAvatarForUser('Sarah Chen', 'sarah@student.edu'),
    dailyStudyTargetHours: 3,
    dailyTarget: 3,
  },
  {
    id: 'user-c',
    email: 'jordan@student.edu',
    name: 'Jordan Lee',
    role: 'Undergraduate',
    program: 'Software Engineering',
    cgpa: '7.90',
    gpa: '7.90',
    avatarUrl: getAvatarForUser('Jordan Lee', 'jordan@student.edu'),
    dailyStudyTargetHours: 8,
    dailyTarget: 8,
  },
];

export const INITIAL_USER: UserProfile = PRESET_USERS[0];

export const INITIAL_TASKS_USER_A: Task[] = [
  {
    id: 'task-a-1',
    title: 'DBMS Assignment',
    subject: 'DBMS',
    dueDate: 'Tomorrow 10 PM',
    durationMinutes: 60,
    priority: 'high',
    completed: false,
    progress: 70,
    notes: 'Complete SQL normalization and transaction management problems for Lab 2 submission.',
    isToday: true,
  },
  {
    id: 'task-a-2',
    title: 'DSA Binary Trees',
    subject: 'DSA',
    dueDate: 'Tomorrow 8 PM',
    durationMinutes: 90,
    priority: 'high',
    completed: false,
    progress: 30,
    notes: 'Implement AVL tree rotations, Red-Black tree insertion, and BFS traversal test cases.',
    isToday: true,
  },
  {
    id: 'task-a-3',
    title: 'OS Notes',
    subject: 'OS',
    dueDate: 'Tomorrow 2 PM',
    durationMinutes: 45,
    priority: 'medium',
    completed: false,
    progress: 0,
    notes: 'Review process synchronization, semaphores, and classic deadlock prevention problems.',
    isToday: true,
  },
  {
    id: 'task-a-4',
    title: 'SQL Practice',
    subject: 'DBMS',
    dueDate: 'Today 8:00 PM',
    durationMinutes: 30,
    priority: 'medium',
    completed: true,
    progress: 100,
    notes: 'LeetCode database queries: joins, subqueries, and window functions.',
    isToday: true,
  },
  {
    id: 'task-a-5',
    title: 'Math Quiz Preparation',
    subject: 'Calculus',
    dueDate: 'In 2 days',
    durationMinutes: 30,
    priority: 'high',
    completed: false,
    progress: 10,
    notes: 'Multiple integrals and vector calculus theorem practice.',
    isToday: false,
  },
];

export const INITIAL_TASKS_USER_B: Task[] = [
  {
    id: 'task-b-1',
    title: 'Data Visualization Dashboard',
    subject: 'Data Science',
    dueDate: 'Today 6 PM',
    durationMinutes: 120,
    priority: 'high',
    completed: false,
    progress: 40,
    notes: 'Build interactive charts with Recharts and clean pandas dataframe backend.',
    isToday: true,
  },
  {
    id: 'task-b-2',
    title: 'Machine Learning Quiz Review',
    subject: 'Machine Learning',
    dueDate: 'Tomorrow 10 AM',
    durationMinutes: 60,
    priority: 'high',
    completed: false,
    progress: 20,
    notes: 'Gradient descent, cross-validation, and confusion matrix metrics.',
    isToday: true,
  },
  {
    id: 'task-b-3',
    title: 'Statistics Homework 4',
    subject: 'Statistics',
    dueDate: 'In 3 days',
    durationMinutes: 45,
    priority: 'medium',
    completed: true,
    progress: 100,
    notes: 'Hypothesis testing, p-values, and confidence intervals.',
    isToday: true,
  },
];

export const INITIAL_TASKS_USER_C: Task[] = [
  {
    id: 'task-c-1',
    title: 'Software Architecture Case Study',
    subject: 'Software Eng',
    dueDate: 'Today 11 PM',
    durationMinutes: 180,
    priority: 'high',
    completed: false,
    progress: 15,
    notes: 'Microservices breakdown and event-driven queue analysis.',
    isToday: true,
  },
  {
    id: 'task-c-2',
    title: 'Compiler Design Syntax Trees',
    subject: 'Compilers',
    dueDate: 'Tomorrow 5 PM',
    durationMinutes: 90,
    priority: 'high',
    completed: false,
    progress: 50,
    notes: 'LL(1) parsing table generation and AST node visitor pattern.',
    isToday: true,
  },
  {
    id: 'task-c-3',
    title: 'Web Security Audit Lab',
    subject: 'Security',
    dueDate: 'In 2 days',
    durationMinutes: 60,
    priority: 'medium',
    completed: false,
    progress: 0,
    notes: 'XSS mitigation and JWT signature verification testing.',
    isToday: false,
  },
  {
    id: 'task-c-4',
    title: 'Agile Sprint Planning Notes',
    subject: 'Software Eng',
    dueDate: 'Today 3 PM',
    durationMinutes: 30,
    priority: 'low',
    completed: true,
    progress: 100,
    notes: 'User stories estimation and backlog grooming.',
    isToday: true,
  },
];

export const INITIAL_TASKS: Task[] = INITIAL_TASKS_USER_A;

export const INITIAL_SCHEDULE: ScheduleItem[] = [];

export const INITIAL_WEEKLY_WORKLOAD: DayWorkload[] = [
  { day: 'M', fullDay: 'Monday', percentage: 30, hours: 2.5, status: 'normal' },
  { day: 'T', fullDay: 'Tuesday', percentage: 50, hours: 4.0, status: 'normal' },
  { day: 'W', fullDay: 'Wednesday', percentage: 75, hours: 4.5, isToday: true, status: 'normal' },
  { day: 'T', fullDay: 'Thursday', percentage: 60, hours: 3.5, status: 'normal' },
  { day: 'F', fullDay: 'Friday', percentage: 20, hours: 1.5, status: 'low' },
  { day: 'S', fullDay: 'Saturday', percentage: 10, hours: 1.0, status: 'low' },
  { day: 'S', fullDay: 'Sunday', percentage: 10, hours: 1.0, status: 'low' },
];
