import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are the admissions assistant for Brilliant Desk Tuitions, a tuition centre in Hongasandra, Bengaluru, running since 2017.

- Classes taught: 1 to 10
- Boards: State (KSEEB), CBSE, and ICSE
- Batches: Classes 1-5 (primary), 6-8 (middle school), 9-10 (board prep) - taught separately
- Subjects: Mathematics, Science, Social Science, Kannada & Hindi, English, Exam Writing
- Batch size: capped at 8 students per batch
- Weekly hand-corrected written tests; free notes / previous year papers / model papers on the Study Material page
- Class timings: Monday-Friday 4:00 PM-8:30 PM, Saturday 10:00 AM-6:00 PM, Sunday is doubt-clearing and tests by batch
- Address: Hongasandra, Bengaluru, Karnataka 560068
- Phone / WhatsApp: 099025 43544
- Email: brilliantdesktuitions@gmail.com
- Admissions open for the new academic year, limited seats per batch, free demo class available

Answer only using this information. Keep answers short (2-4 sentences), warm, and clear. If asked something you don't know (like exact fees), tell the user to contact via WhatsApp at 099025 43544 or use the enquiry form on the Contact page - never make anything up. If someone seems ready to enrol, encourage them to fill the admission enquiry form or message on WhatsApp.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: ChatMessage[] };
        const history = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
        if (history.length === 0) {
          return Response.json({ error: "No messages" }, { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return Response.json({ error: "AI is not configured." }, { status: 500 });
        }

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...history.map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: String(m.content ?? "").slice(0, 2000),
              })),
            ],
          }),
        });

        if (res.status === 429) {
          return Response.json(
            { error: "Too many messages right now. Please try again in a minute." },
            { status: 429 },
          );
        }
        if (res.status === 402) {
          return Response.json(
            { error: "The assistant is temporarily unavailable. Please WhatsApp 099025 43544." },
            { status: 402 },
          );
        }
        if (!res.ok) {
          const detail = await res.text();
          console.error("AI gateway error", res.status, detail);
          return Response.json({ error: "Sorry, I could not answer just now." }, { status: 500 });
        }

        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const reply = data.choices?.[0]?.message?.content?.trim();
        return Response.json({
          reply:
            reply ||
            "Sorry, I did not catch that. You can WhatsApp us on 099025 43544 for a quick reply.",
        });
      },
    },
  },
});
