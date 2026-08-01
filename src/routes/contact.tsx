import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ClassTimings } from "@/components/site/ClassTimings";
import { SITE, BOARDS, CLASS_LEVELS } from "@/lib/site";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Brilliant Desk Tuitions — Address, Phone & Map" },
      {
        name: "description",
        content:
          "Call, WhatsApp or visit Brilliant Desk Tuitions in Bengaluru. Class timings, location map and an enquiry form for Classes 1-10 admissions.",
      },
      { property: "og:title", content: "Contact Brilliant Desk Tuitions" },
      { property: "og:description", content: "Address, class timings, phone, WhatsApp and location map." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", grade: "", board: "", message: "" });

  const waLink = () => {
    const text = `Hello ${SITE.name},%0A%0AName: ${form.name}%0APhone: ${form.phone}%0AClass: ${form.grade}%0ABoard: ${form.board}%0A%0A${form.message}`;
    return `https://wa.me/${SITE.whatsapp}?text=${text}`;
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <span className="eyebrow">Contact</span>
        <h1 className="mt-6 max-w-3xl text-[clamp(30px,4vw,46px)] leading-tight">
          Come by the centre, or send us a message.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Admission enquiries, demo classes and fee details — the teacher replies personally.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="paper-card p-6">
            <div className="flex gap-4">
              <MapPin className="h-6 w-6 flex-none text-pen" />
              <div>
                <p className="font-semibold">Tuition address</p>
                {SITE.addressLines.map((l) => (
                  <p key={l} className="text-sm text-muted-foreground">
                    {l}
                  </p>
                ))}
                <a
                  href={SITE.mapsShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-pen underline-offset-4 hover:underline"
                >
                  Open location in Google Maps →
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <a href={`tel:+${SITE.whatsapp}`} className="paper-card p-6">
              <Phone className="mb-3 h-6 w-6 text-pen" />
              <p className="font-semibold">Call</p>
              <p className="font-mono text-sm text-muted-foreground">{SITE.phone}</p>
            </a>
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" className="paper-card p-6">
              <MessageCircle className="mb-3 h-6 w-6 text-exam-green" />
              <p className="font-semibold">WhatsApp</p>
              <p className="font-mono text-sm text-muted-foreground">{SITE.phone}</p>
            </a>
            <a href={`mailto:${SITE.email}`} className="paper-card p-6 sm:col-span-2">
              <Mail className="mb-3 h-6 w-6 text-pen" />
              <p className="font-semibold">Email</p>
              <p className="text-sm break-all text-muted-foreground">{SITE.email}</p>
            </a>
          </div>

          <ClassTimings />

        </div>

        <div className="space-y-4">
          <form
            className="paper-card p-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name || !form.phone) {
                toast.error("Please add your name and phone number.");
                return;
              }
              window.open(waLink(), "_blank");
              toast.success("Opening WhatsApp with your enquiry.");
            }}
          >
            <h2 className="text-xl">Admission enquiry</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill this in and it opens WhatsApp with your details ready to send.
            </p>
            <div className="mt-5 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Student / parent name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="grade">Class</Label>
                  <select
                    id="grade"
                    className="h-9 rounded-md border border-input bg-card px-3 text-sm"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  >
                    <option value="">Select class</option>
                    {CLASS_LEVELS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="board">Syllabus</Label>
                  <select
                    id="board"
                    className="h-9 rounded-md border border-input bg-card px-3 text-sm"
                    value={form.board}
                    onChange={(e) => setForm({ ...form, board: e.target.value })}
                  >
                    <option value="">Select board</option>
                    {BOARDS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-pen px-6 py-3 font-semibold text-paper hover:bg-pen/90"
              >
                <Send className="h-4 w-4" /> Send enquiry
              </button>
            </div>
          </form>

          <div className="paper-card overflow-hidden">
            <iframe
              title="Brilliant Desk Tuitions location map"
              src={SITE.mapsEmbedUrl}
              className="h-[320px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
