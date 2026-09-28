import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

function generateLocalAdvice(prompt: string, tasks: any[]) {
  const pendingTasks = Array.isArray(tasks)
    ? tasks.filter((task: any) => !task.completed)
    : [];

  if (pendingTasks.length === 0) {
    return "You currently have no pending tasks. Review your upcoming schedule and use the available time for revision.";
  }

  const taskNames = pendingTasks
    .slice(0, 5)
    .map((task: any) => task.title || task.name || 'Untitled task')
    .join(', ');

  return `Start with your highest-priority pending task. Your current pending tasks include: ${taskNames}. Break the work into smaller sessions and complete the most urgent task first.`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const { prompt, tasks = [], schedule = [] } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        reply: generateLocalAdvice(prompt || '', tasks)
      });
    }

    const ai = new GoogleGenAI({
      apiKey
    });

    const content = `
You are an AI Study Advisor for a college student.

Student request:
${prompt || 'Help me plan my pending tasks.'}

Pending tasks:
${JSON.stringify(tasks)}

Current schedule:
${JSON.stringify(schedule)}

Give practical, concise study advice.
Prioritize urgent and overdue tasks.
Break large tasks into manageable steps.
Consider the student's available schedule.
Do not invent tasks that are not provided.
`;

    let lastError: any = null;

    for (const model of FALLBACK_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: content,
          config: {
            temperature: 0.4
          }
        });

        return res.json({
          reply:
            response.text ||
            generateLocalAdvice(prompt || '', tasks)
        });
      } catch (err: any) {
        lastError = err;

        const message = err?.message || '';

        const retryable =
          err?.status === 429 ||
          err?.status === 503 ||
          message.includes('UNAVAILABLE') ||
          message.includes('overloaded') ||
          message.includes('no longer available');

        if (!retryable) {
          break;
        }
      }
    }

    console.error('Gemini failed:', lastError);

    return res.json({
      reply: generateLocalAdvice(prompt || '', tasks),
      error: 'AI temporarily unavailable; showing local advice.'
    });

  } catch (err: any) {
    console.error('Advisor error:', err);

    return res.status(500).json({
      reply: generateLocalAdvice(
        req.body?.prompt || '',
        req.body?.tasks || []
      )
    });
  }
}