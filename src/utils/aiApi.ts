import { Task, ScheduleItem } from '../types';

export async function askGeminiAdvisor(
  prompt: string,
  tasks: Task[],
  schedule: ScheduleItem[]
): Promise<string> {
  const response = await fetch('/api/ai/advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, tasks, schedule }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.reply || 'Failed to reach AI Advisor');
  }
  return data.reply;
}

export async function generateSmartSchedule(
  tasks: Task[],
  schedule: ScheduleItem[]
): Promise<ScheduleItem[]> {
  const response = await fetch('/api/ai/smart-schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks, schedule }),
  });
  if (!response.ok) {
    throw new Error('Failed to generate smart schedule');
  }
  const data = await response.json();
  return data.schedule || [];
}

export interface RescuePlanAdjustment {
  title: string;
  description: string;
  iconName: string;
  impact: string;
}

export interface RescuePlanResponse {
  summary: string;
  adjustments: RescuePlanAdjustment[];
  targetOutcome: string;
}

export async function generateRescuePlan(
  tasks: Task[],
  schedule: ScheduleItem[],
  userContext?: any
): Promise<RescuePlanResponse> {
  const response = await fetch('/api/ai/rescue-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks, schedule, userContext }),
  });
  if (!response.ok) {
    throw new Error('Failed to generate rescue plan');
  }
  return response.json();
}
