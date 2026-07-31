import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, BookMarked, Briefcase, GraduationCap, Pencil, Upload, User } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { getSignedUrl } from "@/lib/storage";
import { BOARDS } from "@/lib/site";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Teacher Profile — Brilliant Desk Tuitions" },
      {
        name: "description",
        content:
          "Meet the teacher behind Brilliant Desk Tuitions: qualification, subjects taught, awards, teaching experience and syllabus expertise.",
      },
      { property: "og:title", content: "Teacher Profile — Brilliant Desk Tuitions" },
      { property: "og:description", content: "Qualification, subjects, awards, experience and syllabus taught." },
    ],
  }),
  component: ProfilePage,
});

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  photo_url: string | null;
  qualification: string | null;
  teaching_subjects: string[];
  rewards: string | null;
  experience: string | null;
  syllabus: string[];
};

function ProfilePage() {
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();
  const [photo, setPhoto] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["teacher-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_profile")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  useEffect(() => {
    if (!profile?.photo_url) {
      setPhoto(null);
      return;
    }
    getSignedUrl("avatars", profile.photo_url)
      .then(setPhoto)
      .catch(() => setPhoto(null));
  }, [profile?.photo_url]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16">
        <div className="flex items-center justify-between gap-4">
          <span className="eyebrow">Teacher profile</span>
          {isAdmin && <EditProfileDialog profile={profile} userId={user!.id} onSaved={() => qc.invalidateQueries()} />}
        </div>

        <div className="paper-card mt-6 overflow-hidden">
          <div className="bg-ink px-8 py-10 text-center text-paper">
            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-marigold bg-paper/10">
              {photo ? (
                <img src={photo} alt={profile?.full_name || "Teacher"} className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-marigold" />
              )}
            </div>
            <h1 className="mt-5 font-display text-3xl">
              {profile?.full_name || "Profile not filled yet"}
            </h1>
            {profile?.qualification && (
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-marigold">
                {profile.qualification}
              </p>
            )}
          </div>

          <div className="grid gap-px bg-line sm:grid-cols-2">
            <Field icon={GraduationCap} label="Qualification" value={profile?.qualification} />
            <Field
              icon={BookMarked}
              label="Teaching subjects"
              value={profile?.teaching_subjects?.join(", ")}
            />
            <Field icon={Award} label="Rewards & recognition" value={profile?.rewards} />
            <Field icon={Briefcase} label="Experience" value={profile?.experience} />
          </div>

          <div className="border-t border-line bg-card p-8">
            <p className="font-mono text-[11px] uppercase tracking-widest text-marigold-deep">
              Teaching syllabus
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(profile?.syllabus?.length ? profile.syllabus : []).map((s) => (
                <span key={s} className="rounded-full border border-line bg-paper-2 px-4 py-1.5 text-sm font-medium">
                  {s}
                </span>
              ))}
              {!profile?.syllabus?.length && (
                <p className="text-sm text-muted-foreground">Not added yet.</p>
              )}
            </div>
          </div>
        </div>

        {!profile && isAdmin && (
          <p className="mt-4 text-sm text-muted-foreground">
            Use “Edit profile” above to add your details — they appear here for every visitor.
          </p>
        )}
      </section>
    </SiteLayout>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="bg-card p-6">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-marigold-deep">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="mt-2 whitespace-pre-line text-[15px] text-ink-soft">
        {value || <span className="text-muted-foreground">Not added yet.</span>}
      </p>
    </div>
  );
}

function EditProfileDialog({
  profile,
  userId,
  onSaved,
}: {
  profile: Profile | null | undefined;
  userId: string;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    qualification: "",
    teaching_subjects: "",
    rewards: "",
    experience: "",
    syllabus: [] as string[],
    photo_url: null as string | null,
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      full_name: profile?.full_name ?? "",
      qualification: profile?.qualification ?? "",
      teaching_subjects: profile?.teaching_subjects?.join(", ") ?? "",
      rewards: profile?.rewards ?? "",
      experience: profile?.experience ?? "",
      syllabus: profile?.syllabus ?? [],
      photo_url: profile?.photo_url ?? null,
    });
    setFile(null);
  }, [open, profile]);

  const save = useMutation({
    mutationFn: async () => {
      let photoPath = form.photo_url;
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${userId}/profile-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
          upsert: true,
        });
        if (upErr) throw upErr;
        photoPath = path;
      }

      const payload = {
        user_id: userId,
        full_name: form.full_name,
        qualification: form.qualification,
        teaching_subjects: form.teaching_subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        rewards: form.rewards,
        experience: form.experience,
        syllabus: form.syllabus,
        photo_url: photoPath,
      };

      if (profile) {
        const { error } = await supabase.from("teacher_profile").update(payload).eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("teacher_profile").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Profile saved.");
      setOpen(false);
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-lg bg-pen px-4 py-2.5 text-sm font-semibold text-paper hover:bg-pen/90">
          <Pencil className="h-4 w-4" /> Edit profile
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Profile photo</Label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line bg-paper-2 px-4 py-3 text-sm">
              <Upload className="h-4 w-4 text-pen" />
              {file ? file.name : "Choose an image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fn">Name</Label>
            <Input
              id="fn"
              className="text-center font-display text-lg"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="q">Qualification</Label>
            <Input id="q" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ts">Teaching subjects (comma separated)</Label>
            <Input
              id="ts"
              value={form.teaching_subjects}
              onChange={(e) => setForm({ ...form, teaching_subjects: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rw">Rewards</Label>
            <Textarea id="rw" rows={2} value={form.rewards} onChange={(e) => setForm({ ...form, rewards: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ex">Experience (previous working)</Label>
            <Textarea id="ex" rows={3} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Teaching syllabus (select all that apply)</Label>
            <div className="grid gap-2">
              {BOARDS.map((b) => (
                <label key={b} className="flex items-center gap-3 text-sm">
                  <Checkbox
                    checked={form.syllabus.includes(b)}
                    onCheckedChange={(c) =>
                      setForm({
                        ...form,
                        syllabus: c ? [...form.syllabus, b] : form.syllabus.filter((s) => s !== b),
                      })
                    }
                  />
                  {b}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <button
            disabled={save.isPending}
            onClick={() => save.mutate()}
            className="rounded-lg bg-pen px-5 py-2.5 font-semibold text-paper hover:bg-pen/90 disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : "Save profile"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
