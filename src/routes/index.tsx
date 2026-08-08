import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Calculator, FlaskConical, Globe2, Languages, PenLine, Quote, Star } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ReviewForm } from "@/components/site/ReviewForm";
import { SITE } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brilliant Desk Tuitions — Classes 1 to 10 Tuition in Bengaluru" },
      {
        name: "description",
        content:
          "Since 2017, Brilliant Desk Tuitions coaches Classes 1-10 in State (KSEEB), CBSE and ICSE syllabus. Small batches, weekly tests, free notes and previous year papers.",
      },
      { property: "og:title", content: "Brilliant Desk Tuitions — Classes 1 to 10" },
      {
        property: "og:description",
        content: "State, CBSE and ICSE tuition for Classes 1-10 in Bengaluru. Parent and student reviews inside.",
      },
    ],
  }),
  component: Home,
});

const SUBJECTS = [
  { icon: Calculator, name: "Mathematics", note: "Concept drills, shortcut-free clarity" },
  { icon: FlaskConical, name: "Science", note: "Physics, Chemistry & Biology basics" },
  { icon: Globe2, name: "Social Science", note: "Maps, timelines and answer framing" },
  { icon: Languages, name: "Kannada & Hindi", note: "Grammar, writing and recitation" },
  { icon: BookOpen, name: "English", note: "Reading, grammar and composition" },
  { icon: PenLine, name: "Exam Writing", note: "Presentation and time management" },
];

function Home() {
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-16">
        <div>
          <span className="eyebrow">Bengaluru · {SITE.since}</span>
          <h1 className="mt-6 max-w-3xl text-[clamp(34px,4.6vw,54px)] leading-[1.06]">
            Steady coaching for <em className="not-italic text-pen">Classes 1 to 10</em>, in the
            exact syllabus your child writes.
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg text-muted-foreground">
            State (KSEEB), CBSE and ICSE — taught in small batches with weekly tests, written
            practice and a parent update every week.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="rounded-lg bg-pen px-6 py-3.5 font-semibold text-paper transition-colors hover:bg-pen/90"
            >
              Book a free demo class
            </Link>
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-exam-green px-6 py-3.5 font-semibold text-paper transition-opacity hover:opacity-90"
            >
              WhatsApp {SITE.phone}
            </a>
            <Link
              to="/materials"
              className="rounded-lg border border-ink px-6 py-3.5 font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Free study material
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-8">
            {[
              { n: "8+", l: "Years teaching" },
              { n: "1–10", l: "Classes covered" },
              { n: "3", l: "Boards supported" },
            ].map((s) => (
              <div key={s.l}>
                <b className="block font-display text-2xl">{s.n}</b>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {s.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Quotation */}
      <section className="bg-ink px-6 py-16 text-paper">
        <div className="mx-auto flex max-w-4xl gap-5">
          <Quote className="h-9 w-9 flex-none text-marigold" />
          <div>
            <p className="font-display text-2xl leading-snug md:text-3xl">
              "Education is not the filling of a pail, but the lighting of a fire."
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-paper/60">
              — W. B. Yeats
            </p>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-11 max-w-xl">
          <span className="sec-eyebrow">Subjects</span>
          <h2 className="text-[clamp(26px,3.4vw,36px)]">Everything on the report card</h2>
          <p className="mt-3 text-muted-foreground">
            Primary to Class 10, taught to the exact board pattern your child writes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((s) => (
            <div key={s.name} className="paper-card p-6">
              <s.icon className="mb-3 h-8 w-8 text-marigold-deep" />
              <h3 className="font-sans text-[17px] font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About snippet */}
      <section className="bg-paper-2 px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="sec-eyebrow">About the tuition</span>
            <h2 className="text-[clamp(26px,3.4vw,36px)]">A desk, a plan, and steady progress</h2>
            <p className="mt-4 text-muted-foreground">
              Brilliant Desk Tuitions started in 2017 with one classroom in Bengaluru and a simple
              promise — no child sits at the back. Batches stay small, every test is corrected by
              hand, and parents hear from us every single week.
            </p>
            <Link to="/about" className="mt-6 inline-block font-semibold text-pen underline-offset-4 hover:underline">
              Read the full story →
            </Link>
          </div>
          <ul className="grid gap-4">
            {[
              "Separate batches for Classes 1–5, 6–8 and 9–10.",
              "Syllabus-matched teaching for KSEEB, CBSE and ICSE.",
              "Weekly written tests with corrected answer scripts.",
              "Free notes, previous year papers and model papers online.",
              "Extra doubt-clearing hours before the board exams.",
            ].map((p) => (
              <li key={p} className="flex gap-3 text-[15px] text-ink-soft">
                <span className="font-bold text-pen">—</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-ink px-6 py-20 text-paper">
        <div className="mx-auto max-w-6xl">
          <div className="mb-11 max-w-xl">
            <span className="sec-eyebrow text-marigold">Reviews</span>
            <h2 className="text-[clamp(26px,3.4vw,36px)]">What parents and students say</h2>
            <p className="mt-3 text-paper/70">
              Honest words from families who sat with us through a full academic year.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-paper/15 bg-paper/[0.06] p-6 text-[14.5px]"
              >
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-marigold text-marigold" />
                  ))}
                </div>
                <p className="text-paper/85">{r.quote}</p>
                <p className="mt-4 text-sm font-semibold text-marigold">{r.student_name}</p>
                {r.detail && <p className="text-xs text-paper/55">{r.detail}</p>}
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-paper/60">Reviews will appear here soon.</p>
            )}
          </div>

          <div className="mt-10 max-w-2xl">
            <ReviewForm />
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="paper-card flex flex-col items-start justify-between gap-6 p-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl">Admissions open for the new academic year</h2>
            <p className="mt-2 text-muted-foreground">
              Classes 1 to 10 · State, CBSE and ICSE · Limited seats per batch.
            </p>
          </div>
          <Link
            to="/contact"
            className="rounded-lg bg-pen px-6 py-3.5 font-semibold text-paper hover:bg-pen/90"
          >
            Talk to the teacher
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
