// Cloudflare Pages Function — AI Chat endpoint for Brilliant Desk Tuitions
// Replaces the TanStack Router chat.ts that used process.env (doesn't work on Cloudflare)
// Uses context.env (Cloudflare Pages) + native fetch (no npm packages)

type ChatMessage = { role: "user" | "assistant"; content: string };

const BASE_FACTS = `FACTS ABOUT THE CENTRE (only source of truth):
- Name: Brilliant Desk Tuitions, running since 2017.
- Location: Hongasandra, Bengaluru, Karnataka 560068. Google Maps link is on the Contact page.
- Classes: 1 to 10. Boards: State (KSEEB), CBSE and ICSE.
- Batches: 1-5 primary, 6-8 middle school, 9-10 board prep. Taught separately, max 8 students per batch.
- Subjects: Mathematics, Science, Social Science, Kannada, Hindi, English and exam-writing practice.
- Weekly hand-corrected written tests; doubt-clearing sessions.
- Free downloads on the Study Material page: previous year papers, notes and model papers (PDF).
- Phone / WhatsApp: 099025 43544. Email: brilliantdesktuitions@gmail.com.
- Admissions open for the new academic year; limited seats; a free demo class can be arranged.
- Website pages: Home, About, Profile (teacher profile), Study Material, Contact (enquiry form + map).

NOT KNOWN: exact fees, discounts, transport, hostel, online classes, exact seat counts, results/marks of individual students. For any of these, ask the visitor to WhatsApp 099025 43544 or use the enquiry form on the Contact page.`;

const STYLE = `HOW TO ANSWER:
- Answer only from the facts above. Never invent fees, timings, names, results or policies.
- Be specific: quote the exact timing, class, board or subject asked about instead of a vague reply.
- Keep it to 1-3 short sentences, warm and simple English (the visitor may be a parent).
- If the answer is not in the facts, say you don't have that detail and give the WhatsApp number 099025 43544.
- If the visitor sounds ready to join, invite them to the free demo class via the Contact page enquiry form or WhatsApp.
- Reply in the same language the visitor uses (English, Kannada or Hindi).
- Plain text only, no markdown headings or asterisks.`;

// Fetch live data from Supabase
async function rest(env: Record<string, string>, path: string) {
  // Support both VITE_ prefixed (Cloudflare) and non-prefixed env var names
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return [];
    return (await res.json()) as Array<Record<string, unknown>>;
  } catch {
    return [];
  }
}

async function liveContext(env: Record<string, string>) {
  const [timings, profile, materials] = await Promise.all([
    rest(env, "class_timings?select=day,time&order=sort_order"),
    rest(env, "teacher_profile?select=full_name,qualification,teaching_subjects,experience,rewards,syllabus&limit=1"),
    rest(env, "study_materials?select=title,category,class_level&order=created_at.desc&limit=40"),
  ]);

  const lines: string[] = [];
  if (timings.length) {
    lines.push(
      "CURRENT CLASS TIMINGS (live from the website):\n" +
        timings.map((t) => `- ${t["day"]}: ${t["time"]}`).join("\n"),
    );
  }
  const p = profile[0];
  if (p) {
    lines.push(
      `TEACHER: ${p["full_name"]}${p["qualification"] ? `, ${p["qualification"]}` : ""}.` +
        (Array.isArray(p["teaching_subjects"]) && p["teaching_subjects"].length
          ? ` Subjects: ${(p["teaching_subjects"] as string[]).join(", ")}.`
          : "") +
        (Array.isArray(p["syllabus"]) && p["syllabus"].length
          ? ` Syllabus: ${(p["syllabus"] as string[]).join(", ")}.`
          : "") +
        (p["experience"] ? ` Experience: ${p["experience"]}.` : "") +
        (p["rewards"] ? ` Awards: ${p["rewards"]}.` : ""),
    );
  }
  if (materials.length) {
    lines.push(
      "STUDY MATERIAL CURRENTLY AVAILABLE (free PDF downloads on the Study Material page):\n" +
        materials
          .map((m) => `- Class ${m["class_level"]} · ${m["category"]} · ${m["title"]}`)
          .join("\n"),
    );
  } else {
    lines.push(
      "STUDY MATERIAL: no PDFs uploaded yet — tell visitors to check the Study Material page soon.",
    );
  }
  return lines.join("\n\n");
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestPost(context: {
  request: Request;
  env: Record<string, string>;
}) {
  const { request, env } = context;

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as { messages?: ChatMessage[] };
    const history = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    if (history.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Read API key from Cloudflare env (NOT process.env)
    const lovableKey = env.LOVABLE_API_KEY;
    const openaiKey = env.OPENAI_API_KEY;
    const key = lovableKey || openaiKey;
    if (!key || (openaiKey && openaiKey.includes("..."))) {
      return new Response(
        JSON.stringify({
          error:
            "The assistant is not configured on this deployment. Please WhatsApp 099025 43544.",
        }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const endpoint = lovableKey
      ? "https://ai.gateway.lovable.dev/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model = lovableKey
      ? "google/gemini-3.6-flash"
      : env.OPENAI_MODEL || "gpt-4o-mini";

    const live = await liveContext(env);
    const system = `You are the admissions assistant on the Brilliant Desk Tuitions website.\n\n${BASE_FACTS}\n\n${live}\n\n${STYLE}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          ...history.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content ?? "").slice(0, 2000),
          })),
        ],
      }),
    });

    if (res.status === 429) {
      return new Response(
        JSON.stringify({ error: "Too many messages right now. Please try again in a minute." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }
    if (res.status === 402) {
      return new Response(
        JSON.stringify({ error: "The assistant is temporarily unavailable. Please WhatsApp 099025 43544." }),
        { status: 402, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }
    if (!res.ok) {
      const detail = await res.text();
      console.error("AI gateway error", res.status, detail);
      return new Response(
        JSON.stringify({ error: "Sorry, I could not answer just now." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    return new Response(
      JSON.stringify({
        reply:
          reply ||
          "Sorry, I did not catch that. You can WhatsApp us on 099025 43544 for a quick reply.",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: "Sorry, I could not answer just now." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
}

// GET status check
export async function onRequestGet(context: {
  env: Record<string, string>;
}) {
  const { env } = context;
  const key = env.OPENAI_API_KEY;
  const configured = key && key.startsWith("sk-") && !key.includes("...");
  return new Response(
    JSON.stringify({
      status: configured ? "configured" : "not-configured",
      model: env.OPENAI_MODEL || "gpt-4o-mini",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
