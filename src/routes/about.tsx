import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, HeartHandshake, Target, Users } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/lib/site";
import logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Brilliant Desk Tuitions — Our Story & Teaching Method" },
      {
        name: "description",
        content:
          "How Brilliant Desk Tuitions teaches Classes 1-10 in Bengaluru: small batches, board-matched syllabuses for KSEEB, CBSE and ICSE, weekly tests and parent updates.",
      },
      { property: "og:title", content: "About Brilliant Desk Tuitions" },
      {
        property: "og:description",
        content: "Small batches, board-matched teaching and weekly tests since 2017.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <span className="eyebrow">About us</span>
        <h1 className="mt-6 max-w-3xl text-[clamp(30px,4vw,46px)] leading-tight">
          A neighbourhood tuition centre that treats every mark like it matters.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          {SITE.name} has been coaching Bengaluru students since 2017 — Classes 1 to 10, across the
          State (KSEEB), CBSE and ICSE syllabuses.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 md:grid-cols-[1fr_0.8fr]">
        <div className="space-y-5 text-[15.5px] leading-relaxed text-ink-soft">
          <p>
            We began with a single room, six students and a blackboard. What has not changed since
            is the way we work: a fixed weekly plan, written practice on paper, and a teacher who
            knows exactly which chapter each child is stuck on.
          </p>
          <p>
            Primary students (Classes 1–5) build reading, handwriting and number sense. Middle
            school (6–8) moves to concept clarity and note-making. Classes 9 and 10 shift into full
            board preparation — chapter-wise tests, previous year papers and answer presentation.
          </p>
          <p>
            Every batch is capped at eight students, so nobody copies quietly from the last bench.
            Corrected answer scripts go home each week, and parents receive a short progress note
            with them.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {["KSEEB (State)", "CBSE", "ICSE"].map((b) => (
              <span key={b} className="rounded-lg border border-line bg-card px-4 py-2.5 text-sm">
                <b className="block font-display text-[15px]">{b}</b>
                <span className="text-muted-foreground">Classes 1 – 10</span>
              </span>
            ))}
          </div>
        </div>

        <div className="paper-card overflow-hidden">
          <img src={logo} alt="Brilliant Desk Tuitions logo" className="w-full object-cover" />
          <div className="p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-marigold-deep">
              {SITE.since}
            </p>
            <p className="mt-2 font-display text-xl">{SITE.name}</p>
            <p className="text-sm text-muted-foreground">{SITE.kannada}</p>
          </div>
        </div>
      </section>

      <section className="bg-paper-2 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <span className="sec-eyebrow">What we stand on</span>
          <h2 className="text-[clamp(26px,3.4vw,36px)]">Four things we never compromise</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, t: "Small batches", d: "Maximum eight students, so every doubt gets air time." },
              { icon: Target, t: "Board-matched", d: "Taught to the exact KSEEB, CBSE or ICSE pattern." },
              { icon: Award, t: "Weekly testing", d: "Hand-corrected scripts, no multiple-choice shortcuts." },
              { icon: HeartHandshake, t: "Parent contact", d: "A short honest progress update every week." },
            ].map((c) => (
              <div key={c.t} className="paper-card p-6">
                <c.icon className="mb-3 h-8 w-8 text-pen" />
                <h3 className="font-sans text-base font-semibold">{c.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="paper-card flex flex-col items-start justify-between gap-6 p-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl">Want to meet the teacher first?</h2>
            <p className="mt-2 text-muted-foreground">
              Visit the profile page or come by the centre for a free demo class.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/profile" className="rounded-lg border border-ink px-5 py-3 font-semibold hover:bg-ink hover:text-paper">
              Teacher profile
            </Link>
            <Link to="/contact" className="rounded-lg bg-pen px-5 py-3 font-semibold text-paper hover:bg-pen/90">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
