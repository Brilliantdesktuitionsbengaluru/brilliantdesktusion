import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { openStoredFile } from "@/lib/storage";
import { CLASS_LEVELS, MATERIAL_CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: "Free Study Material — PYQs, Notes & Model Papers | Brilliant Desk" },
      {
        name: "description",
        content:
          "Download free Class 1-10 study material from Brilliant Desk Tuitions: previous year question papers, chapter notes and model papers for KSEEB, CBSE and ICSE.",
      },
      { property: "og:title", content: "Free Study Material — Brilliant Desk Tuitions" },
      { property: "og:description", content: "Previous year papers, notes and model papers as free PDFs." },
    ],
  }),
  component: Materials,
});

function Materials() {
  const [tab, setTab] = useState<string>("pyq");
  const [cls, setCls] = useState<string>("all");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("study_materials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = items.filter(
    (m) => m.category === tab && (cls === "all" || m.class_level === cls),
  );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <span className="eyebrow">Free for everyone</span>
        <h1 className="mt-6 max-w-3xl text-[clamp(30px,4vw,46px)] leading-tight">
          Study material for Classes 1 to 10.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Previous year question papers, chapter notes and model papers — uploaded by the teacher
          and updated through the year. No login needed.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex flex-wrap gap-2">
            {MATERIAL_CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setTab(c.value)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  tab === c.value
                    ? "bg-ink text-paper"
                    : "border border-line bg-card text-ink-soft hover:border-marigold"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <select
            className="h-9 rounded-md border border-input bg-card px-3 text-sm"
            value={cls}
            onChange={(e) => setCls(e.target.value)}
          >
            <option value="all">All classes</option>
            {CLASS_LEVELS.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && filtered.length === 0 && (
            <p className="text-muted-foreground">
              Nothing uploaded in this section yet — please check back soon.
            </p>
          )}
          {filtered.map((m) => (
            <div key={m.id} className="paper-card flex items-center justify-between gap-4 p-6">
              <div className="flex gap-4">
                <FileText className="mt-1 h-6 w-6 flex-none text-pen" />
                <div>
                  <span className="inline-block rounded-full border border-[oklch(0.88_0.04_155)] bg-[oklch(0.95_0.03_155)] px-2.5 py-0.5 font-mono text-[11px] text-exam-green">
                    Class {m.class_level}
                    {m.board ? ` · ${m.board}` : ""}
                  </span>
                  <h3 className="mt-1.5 font-sans text-[15.5px] font-semibold">{m.title}</h3>
                  {m.subject && <p className="text-sm text-muted-foreground">{m.subject}</p>}
                </div>
              </div>
              <button
                aria-label={`Download ${m.title}`}
                onClick={() =>
                  openStoredFile("materials", m.file_url).catch(() =>
                    toast.error("Could not open this file."),
                  )
                }
                className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
