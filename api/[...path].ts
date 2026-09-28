import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ===============================
// HEALTH CHECK
// ===============================

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

// ===============================
// LOCAL FALLBACK
// ===============================

function generateLocalAdvice(
  prompt: string,
  tasks: any[]
): string {
  const pending = (tasks || []).filter(
    (t: any) => !t.completed
  );

  const highPri = pending.filter(
    (t: any) => t.priority === "high"
  );

  const totalMinutes = pending.reduce(
    (sum: number, t: any) =>
      sum + (t.durationMinutes || 45),
    0
  );

  const hours =
    Math.round((totalMinutes / 60) * 10) / 10;

  if (pending.length === 0) {
    return "You're all caught up! No pending tasks right now.";
  }

  const taskList = pending
    .slice(0, 4)
    .map(
      (t: any) =>
        `**${t.title}** (${t.subject || "General"}, due: ${
          t.dueDate || "TBD"
        })`
    )
    .join(", ");

  const topTask = highPri[0] || pending[0];

  const userQ = (prompt || "").toLowerCase();

  let advice = "";

  if (
    userQ.includes("add") ||
    userQ.includes("new") ||
    userQ.includes("subject") ||
    userQ.includes("programming")
  ) {
    advice =
      `Great idea! To fit a new subject in, schedule it after your current high-priority work. `;

    advice += `You currently have ${pending.length} pending task${
      pending.length > 1 ? "s" : ""
    } (${taskList}). `;

    advice += `Complete **${topTask.title}** first, then dedicate a focused 45–60 minute block to the new subject.`;
  } else if (
    userQ.includes("sequence") ||
    userQ.includes("order") ||
    userQ.includes("schedule") ||
    userQ.includes("plan")
  ) {
    advice =
      `Start with **${topTask.title}** (${
        topTask.subject || "General"
      }) — it is ${
        topTask.priority === "high"
          ? "high priority and "
          : ""
      }due ${topTask.dueDate || "soon"}. `;

    if (pending.length > 1) {
      advice += `Follow up with ${pending
        .slice(1, 3)
        .map((t: any) => `**${t.title}**`)
        .join(", then ")}. `;
    }

    advice += `Total estimated workload: ~${hours} hours. Break it into 45-minute focus sessions with 10-minute breaks.`;
  } else {
    advice =
      `You have **${pending.length} pending task${
        pending.length > 1 ? "s" : ""
      }** totaling ~${hours} hours of work. `;

    if (highPri.length > 0) {
      advice +=
        `Top priority: **${topTask.title}** (${
          topTask.subject || "General"
        }, due: ${topTask.dueDate || "TBD"}). `;
    }

    if (pending.length > 1) {
      advice += `Then move to: ${pending
        .slice(1, 3)
        .map((t: any) => `**${t.title}**`)
        .join(", ")}. `;
    }

    advice +=
      "Use 45 minutes of focus followed by a 10-minute break.";
  }

  return advice;
}

// ===============================
// AI ADVISOR
// ===============================

app.post("/api/ai/advisor", async (req, res) => {
  try {
    const {
      prompt,
      tasks,
      schedule,
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: generateLocalAdvice(
          prompt,
          tasks
        ),
      });
    }

    const systemInstruction = `
You are the "Student Life Saver" — a smart,
friendly AI academic mentor for university students.

Give specific, actionable advice based on the student's
actual tasks, deadlines and schedule.

Never give generic advice when task information is available.

Mention specific task names, subjects and deadlines.

Be concise, encouraging and direct.

Suggest realistic time blocks.
`;

    const taskSummary =
      (tasks || []).length > 0
        ? tasks
            .map(
              (t: any) =>
                `- ${t.title || t.subject} (${
                  t.subject || ""
                }, due: ${t.dueDate || "TBD"}, priority: ${
                  t.priority || "medium"
                }, progress: ${t.progress || 0}%)`
            )
            .join("\n")
        : "No tasks currently logged.";

    const FALLBACK_MODELS = [
      GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
    ];

    const contentPayload = {
      contents: `Student's question: "${prompt}"

Their current tasks:

${taskSummary}

Current schedule:
${(schedule || []).length} items logged.

Give specific helpful advice based on their actual tasks.`,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    };

    let lastError: any = null;

    for (const model of FALLBACK_MODELS) {
      try {
        const response =
          await ai.models.generateContent({
            model,
            ...contentPayload,
          });

        const reply =
          response.text ||
          "Please check your tasks and try again.";

        return res.json({ reply });
      } catch (err: any) {
        lastError = err;

        const retryable =
          err?.status === 503 ||
          err?.status === 429 ||
          err?.message?.includes("UNAVAILABLE") ||
          err?.message?.includes("overloaded");

        if (!retryable) {
          break;
        }
      }
    }

    console.error(
      "Gemini failed:",
      lastError?.message
    );

    return res.json({
      reply: generateLocalAdvice(
        prompt,
        tasks
      ),
    });
  } catch (err: any) {
    console.error(
      "Advisor error:",
      err?.message || err
    );

    return res.json({
      reply: generateLocalAdvice(
        req.body?.prompt,
        req.body?.tasks
      ),
    });
  }
});

// ===============================
// SMART SCHEDULE
// ===============================

app.post(
  "/api/ai/smart-schedule",
  async (req, res) => {
    try {
      const {
        tasks,
        schedule,
      } = req.body;

      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          schedule: [],
        });
      }

      const response =
        await ai.models.generateContent({
          model: GEMINI_MODEL,

          contents: `
Given these student tasks:

${JSON.stringify(tasks)}

Current schedule:

${JSON.stringify(schedule)}

Generate a smart study schedule for today.

Return ONLY a JSON array.

Each item must contain:
id
time
title
location
durationMinutes
type
badgeText
iconName
`,

          config: {
            responseMimeType:
              "application/json",
            temperature: 0.2,
          },
        });

      return res.json({
        schedule: JSON.parse(
          response.text || "[]"
        ),
      });
    } catch (err: any) {
      console.error(
        "Smart schedule error:",
        err?.message || err
      );

      return res.status(500).json({
        error: err?.message || "AI error",
      });
    }
  }
);

// ===============================
// RESCUE PLAN
// ===============================

app.post(
  "/api/ai/rescue-plan",
  async (req, res) => {
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

      const systemInstruction = `
You are a Rescue Plan AI.

Analyze the student's tasks and schedule.

Determine what needs to be postponed,
condensed or prioritized.

Return JSON matching this structure:

{
  "summary": "string",
  "adjustments": [
    {
      "title": "string",
      "description": "string",
      "iconName": "schedule",
      "impact": "+30m Saved"
    }
  ],
  "targetOutcome": "string"
}
`;

      const response =
        await ai.models.generateContent({
          model: GEMINI_MODEL,

          contents: `
Tasks:
${JSON.stringify(tasks)}

Schedule:
${JSON.stringify(schedule)}

User context:
${JSON.stringify(
  userContext || {}
)}
`,

          config: {
            systemInstruction,
            responseMimeType:
              "application/json",
            temperature: 0.3,
          },
        });

      return res.json(
        JSON.parse(
          response.text || "{}"
        )
      );
    } catch (err: any) {
      console.error(
        "Rescue plan error:",
        err?.message || err
      );

      return res.status(500).json({
        error: err?.message || "AI error",
      });
    }
  }
);

export default app;