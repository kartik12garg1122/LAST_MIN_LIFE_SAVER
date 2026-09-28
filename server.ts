import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load .env first, then .env.local overrides (Vite convention)
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const __filename_env = typeof __filename !== 'undefined' ? __filename : '';
const __dirname_env = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper for lazy Gemini AI instance
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }

  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Smart local fallback: generates useful advice from task data when AI is unavailable
  function generateLocalAdvice(prompt: string, tasks: any[]): string {
    const pending = (tasks || []).filter((t: any) => !t.completed);
    const highPri = pending.filter((t: any) => t.priority === 'high');
    const totalMinutes = pending.reduce((sum: number, t: any) => sum + (t.durationMinutes || 45), 0);
    const hours = Math.round(totalMinutes / 60 * 10) / 10;

    if (pending.length === 0) {
      return `You're all caught up! 🎉 No pending tasks right now. If you want to get ahead, consider reviewing recent material or adding new assignments to stay on track.`;
    }

    const taskList = pending.slice(0, 4).map((t: any) =>
      `**${t.title}** (${t.subject || 'General'}, due: ${t.dueDate || 'TBD'})`
    ).join(', ');

    const topTask = highPri[0] || pending[0];
    const userQ = prompt.toLowerCase();

    let advice = '';
    if (userQ.includes('add') || userQ.includes('new') || userQ.includes('subject') || userQ.includes('programming')) {
      advice = `Great idea! To fit a new subject in, I'd suggest scheduling it after your current high-priority work. `;
      advice += `Right now you have ${pending.length} pending task${pending.length > 1 ? 's' : ''} (${taskList}). `;
      advice += `Complete **${topTask.title}** first since it's your most urgent item, then dedicate a focused 45-60 minute block to the new subject.`;
    } else if (userQ.includes('sequence') || userQ.includes('order') || userQ.includes('schedule') || userQ.includes('plan')) {
      advice = `Here's your recommended sequence: Start with **${topTask.title}** (${topTask.subject || 'General'}) — it's ${topTask.priority === 'high' ? 'high priority and ' : ''}due ${topTask.dueDate || 'soon'}. `;
      if (pending.length > 1) {
        advice += `Follow up with ${pending.slice(1, 3).map((t: any) => `**${t.title}**`).join(', then ')}. `;
      }
      advice += `Total estimated workload: ~${hours} hours. Break it into 45-min focus sessions with 10-min breaks.`;
    } else {
      advice = `You have **${pending.length} pending task${pending.length > 1 ? 's' : ''}** totaling ~${hours} hours of work. `;
      if (highPri.length > 0) {
        advice += `🔴 Top priority: **${topTask.title}** (${topTask.subject || 'General'}, due: ${topTask.dueDate || 'TBD'}). Start here with a focused 45-min session. `;
      }
      if (pending.length > 1) {
        advice += `Then move to: ${pending.slice(1, 3).map((t: any) => `**${t.title}**`).join(', ')}. `;
      }
      advice += `Use the Pomodoro technique: 45 min focus → 10 min break → repeat. You've got this! 💪`;
    }
    return advice;
  }

  // AI Study Advisor route
  app.post('/api/ai/advisor', async (req, res) => {
    try {
      const { prompt, tasks, schedule } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({ reply: generateLocalAdvice(prompt, tasks) });
      }

      const systemInstruction = `You are the "Student Life Saver" — a smart, friendly AI academic mentor for university students.
Your job: give SPECIFIC, ACTIONABLE advice tailored to the student's actual tasks, deadlines, and situation.
RULES:
- NEVER give generic advice like "focus on high priority tasks" without referencing the real task names.
- Always mention specific subject names, deadlines, and time estimates from the context provided.
- Be concise (2-3 short paragraphs max), encouraging, and direct — like a smart friend who knows your schedule.
- Suggest exact time blocks (e.g. "spend 90 mins on Data Structures tonight"), not vague suggestions.
- If tasks are provided, build your answer around them specifically.
- If the student asks about adding a subject/task, acknowledge it directly and advise how to fit it in.`;

      // Build a rich context string from real task data
      const taskSummary = (tasks || []).length > 0
        ? (tasks as any[]).map((t: any) =>
            `- ${t.title || t.subject} (${t.subject || ''}, due: ${t.dueDate || 'TBD'}, priority: ${t.priority || 'medium'}, progress: ${t.progress || 0}%)`
          ).join('\n')
        : 'No tasks currently logged.';

      // Try multiple models in order — if one is overloaded/slow, fall through to the next
      const FALLBACK_MODELS = [
        GEMINI_MODEL,
        'gemini-3.7-flash',
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-2.5-flash',
      ];

      const contentPayload = {
        contents: `Student's question: "${prompt}"

Their current tasks:
${taskSummary}

Current schedule slots: ${(schedule || []).length} items logged.

Give specific, helpful advice based on their ACTUAL tasks above. Reference task names and deadlines directly.`,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      };

      // Helper: wrap a promise with a timeout
      const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), ms)
          ),
        ]);
      };

      let lastError: any = null;
      for (const model of FALLBACK_MODELS) {
        try {
          console.log(`Trying model: ${model}...`);
          const response = await withTimeout(
            ai.models.generateContent({ model, ...contentPayload }),
            12000 // 12 second timeout per model
          );
          const reply = response.text || 'Please check your tasks and try again.';
          console.log(`Success with model: ${model}`);
          return res.json({ reply });
        } catch (err: any) {
          lastError = err;
          const isRetryable = err?.status === 503 || err?.status === 429 ||
            err?.message?.includes('UNAVAILABLE') || err?.message?.includes('overloaded') ||
            err?.message?.includes('no longer available') || err?.message === 'TIMEOUT';
          console.warn(`Model ${model} failed (${err?.message === 'TIMEOUT' ? 'timeout' : err?.status || 'unknown'}): ${isRetryable ? 'trying next...' : 'not retryable'}`);
          if (!isRetryable) break;
        }
      }

      // All AI models failed — use smart local fallback instead of returning an error
      console.warn('All AI models unavailable, using local fallback');
      return res.json({ reply: generateLocalAdvice(prompt, tasks) });
    } catch (err: any) {
      console.error('Error in /api/ai/advisor:', err?.message || err);
      res.status(500).json({
        reply: generateLocalAdvice(req.body?.prompt, req.body?.tasks),
        error: 'AI service temporarily unavailable, showing local advice',
      });
    }
  });

  // Smart Schedule Generator route
  app.post('/api/ai/smart-schedule', async (req, res) => {
    try {
      const { tasks, schedule } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          schedule: [],
        });
      }

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Given these student tasks: ${JSON.stringify(tasks)} and schedule: ${JSON.stringify(schedule)}, generate a smart study schedule for today.
Return a JSON array of schedule items. Each item must be an object with: id (string), time (string HH:MM), title (string), location (string), durationMinutes (number), type (string: 'study', 'break', 'class', etc), badgeText (string, e.g. 'High Priority', '45 mins'), iconName (string, e.g. 'menu_book', 'coffee', 'priority_high'). Make sure times are sequential and logical.`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      res.json({ schedule: JSON.parse(response.text || '[]') });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Rescue Plan route
  app.post('/api/ai/rescue-plan', async (req, res) => {
    try {
      const { tasks, schedule, userContext } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          summary: "AI not configured.",
          adjustments: [],
          targetOutcome: "Unknown"
        });
      }

      const systemInstruction = `You are a Rescue Plan AI. Analyze the student's tasks and schedule.
Determine what needs to be postponed, condensed, or prioritized to create a sustainable plan for a student falling behind.
Return a JSON object exactly matching this schema:
{
  "summary": "A brief explanation of the time deficit and overall strategy",
  "adjustments": [
    { "title": "Adjustment Title", "description": "Details", "iconName": "schedule", "impact": "+30m Saved" }
  ],
  "targetOutcome": "Target workload string, e.g. '4.8 hours (100% sustainable)'"
}`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Tasks: ${JSON.stringify(tasks)}\nSchedule: ${JSON.stringify(schedule)}\nContext: ${JSON.stringify(userContext || {})}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite development or production static middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Life Saver server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
