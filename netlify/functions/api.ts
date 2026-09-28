import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(express.json());

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return null;

  return new GoogleGenAI({ apiKey });
}

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

// Local fallback
function generateLocalAdvice(prompt: string, tasks: any[]): string {
  const pending = (tasks || []).filter((t: any) => !t.completed);

  if (pending.length === 0) {
    return "You're all caught up! No pending tasks right now.";
  }

  const highPri = pending.filter(
    (t: any) => t.priority === "high"
  );

  const topTask = highPri[0] || pending[0];

  return `You have ${pending.length} pending task(s). Start with **${
    topTask.title
  }** because it is your most important task.`;
}

// AI Advisor
app.post("/api/ai/advisor", async (req, res) => {
  try {
    const { prompt, tasks, schedule } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: generateLocalAdvice(prompt, tasks),
      });
    }

    const taskSummary =
      (tasks || []).length > 0
        ? tasks
            .map(
              (t: any) =>
                `- ${t.title || t.subject} (${t.subject || ""}, due: ${
                  t.dueDate || "TBD"
                }, priority: ${t.priority || "medium"}, progress: ${
                  t.progress || 0
                }%)`
            )
            .join("\n")
        : "No tasks currently logged.";

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Student question: "${prompt}"

Current tasks:
${taskSummary}

Current schedule:
${JSON.stringify(schedule || [])}

Give concise, specific advice based on the student's actual tasks.`,
      config: {
        temperature: 0.6,
      },
    });

    res.json({
      reply:
        response.text ||
        generateLocalAdvice(prompt, tasks),
    });
  } catch (error: any) {
    console.error("Advisor error:", error);

    res.json({
      reply: generateLocalAdvice(
        req.body?.prompt,
        req.body?.tasks
      ),
    });
  }
});

// Smart Schedule
app.post("/api/ai/smart-schedule", async (req, res) => {
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
      contents: `Given these student tasks:
${JSON.stringify(tasks)}

Current schedule:
${JSON.stringify(schedule)}

Generate a smart study schedule for today.

Return ONLY a JSON array.
Each item must contain:
id,
time,
title,
location,
durationMinutes,
type,
badgeText,
iconName.`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    res.json({
      schedule: JSON.parse(response.text || "[]"),
    });
  } catch (error: any) {
    console.error("Smart schedule error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

// Rescue Plan
app.post("/api/ai/rescue-plan", async (req, res) => {
  try {
    const {
      tasks,
      schedule,
      userContext,
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        summary: "AI not configured.",
        adjustments: [],
        targetOutcome: "Unknown",
      });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Tasks:
${JSON.stringify(tasks)}

Schedule:
${JSON.stringify(schedule)}

User context:
${JSON.stringify(userContext || {})}

Create a realistic rescue plan.`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    res.json(
      JSON.parse(response.text || "{}")
    );
  } catch (error: any) {
    console.error("Rescue plan error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});

export const handler = serverless(app);