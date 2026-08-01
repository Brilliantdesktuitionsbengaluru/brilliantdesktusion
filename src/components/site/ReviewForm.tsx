import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ReviewForm() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ student_name: "", detail: "", quote: "", rating: 5 });

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        student_name: form.student_name.trim(),
        detail: form.detail.trim() || null,
        quote: form.quote.trim(),
        rating: form.rating,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thank you! Your review is now on the site.");
      setForm({ student_name: "", detail: "", quote: "", rating: 5 });
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (form.student_name.trim().length < 2 || form.quote.trim().length < 10) {
          toast.error("Please add your name and a review of at least 10 characters.");
          return;
        }
        submit.mutate();
      }}
      className="rounded-xl border border-paper/15 bg-paper/[0.06] p-6"
    >
      <h3 className="font-display text-xl">Write a review</h3>
      <p className="mt-1 text-sm text-paper/70">
        Parents and students are welcome to share their experience.
      </p>
      <div className="mt-5 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="rv-name" className="text-paper/80">
            Your name
          </Label>
          <Input
            id="rv-name"
            className="bg-paper text-ink"
            value={form.student_name}
            onChange={(e) => setForm({ ...form, student_name: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rv-detail" className="text-paper/80">
            Class / relation (optional)
          </Label>
          <Input
            id="rv-detail"
            placeholder="e.g. Parent of Class 8 student"
            className="bg-paper text-ink"
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-paper/80">Rating</Label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star`}
                onClick={() => setForm({ ...form, rating: n })}
              >
                <Star
                  className={
                    n <= form.rating
                      ? "h-6 w-6 fill-marigold text-marigold"
                      : "h-6 w-6 text-paper/40"
                  }
                />
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rv-quote" className="text-paper/80">
            Your review
          </Label>
          <Textarea
            id="rv-quote"
            rows={4}
            className="bg-paper text-ink"
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={submit.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-marigold px-6 py-3 font-semibold text-ink hover:bg-marigold/90 disabled:opacity-60"
        >
          <Send className="h-4 w-4" /> {submit.isPending ? "Posting…" : "Post review"}
        </button>
      </div>
    </form>
  );
}
