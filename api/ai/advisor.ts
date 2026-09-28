import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

function fallback(prompt: string, tasks: any[]) {
  const pending = Array.isArray(tasks)
    ? tasks.filter((t: any) => !t.completed)
    : [];

  if (pending.length === 0) {
    return `I don't see any pending tasks. Based on your request "${prompt}", review your upcoming schedule and decide what needs attention first.`;
  }

  const names = pending
    .slice(0, 5)
    .map((t: any) => t.title || t.name || 'Untitled task')
    .join(', ');

  return `Your pending tasks are: ${names}. Start with the most urgent task and break it into smaller work sessions.`;
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
    const {
      prompt = '',
      tasks = [],
      schedule = []
    } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is missing in Vercel environment variables'
      });
    }

    const ai = new GoogleGenAI({
      apiKey
    });

    const content = `
You are the AI Study Advisor inside Student Life Saver.

Student request:
${prompt}

Pending tasks:
${JSON.stringify(tasks, null, 2)}

Current schedule:
${JSON.stringify(schedule, null, 2)}

Give specific, practical advice based ONLY on the information provided.

Rules:
- Directly answer the student's request.
- Prioritize urgent and overdue tasks.
- Mention actual task names when available.
- Give concrete next steps.
- Do not invent tasks, deadlines, or schedule information.
- Keep the response concise.
`;

    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: content,
        config: {
          temperature: 0.4
        }
      });

      const reply = response.text?.trim();

      if (!reply) {
        return res.status(500).json({
          error: 'Gemini returned an empty response'
        });
      }

      return res.status(200).json({
        reply
      });

    } catch (err: any) {
      console.error('Gemini error:', err);

      return res.status(500).json({
        error: 'Gemini request failed',
        details: err?.message || 'Unknown Gemini error',
        model: MODEL
      });
    }

  } catch (err: any) {
    console.error('Advisor error:', err);

    return res.status(500).json({
      error: 'Advisor error',
      details: err?.message || 'Unknown error'
    });
  }
}