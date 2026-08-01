import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type Timing = { id: string; day: string; time: string; sort_order: number };

export function useClassTimings() {
  return useQuery({
    queryKey: ["class-timings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_timings")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Timing[];
    },
  });
}

export function ClassTimings() {
  const { isAdmin } = useAuth();
  const { data: timings = [] } = useClassTimings();

  return (
    <div className="paper-card p-6">
      <div className="flex gap-4">
        <Clock className="h-6 w-6 flex-none text-pen" />
        <div className="w-full">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">Class timings</p>
            {isAdmin && <EditTimingsDialog timings={timings} />}
          </div>
          <div className="mt-2 grid gap-1.5">
            {timings.map((h) => (
              <div
                key={h.id}
                className="flex justify-between gap-4 border-b border-dotted border-line pb-1.5 text-sm"
              >
                <span className="text-ink-soft">{h.day}</span>
                <span className="font-mono text-right text-muted-foreground">{h.time}</span>
              </div>
            ))}
            {timings.length === 0 && (
              <p className="text-sm text-muted-foreground">Timings will be updated shortly.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditTimingsDialog({ timings }: { timings: Timing[] }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<{ day: string; time: string }[]>([]);
  const qc = useQueryClient();

  useEffect(() => {
    if (open) setRows(timings.map((t) => ({ day: t.day, time: t.time })));
  }, [open, timings]);

  const save = useMutation({
    mutationFn: async () => {
      const clean = rows.filter((r) => r.day.trim() && r.time.trim());
      const { error: delErr } = await supabase
        .from("class_timings")
        .delete()
        .not("id", "is", null);
      if (delErr) throw delErr;
      if (clean.length) {
        const { error } = await supabase.from("class_timings").insert(
          clean.map((r, i) => ({ day: r.day.trim(), time: r.time.trim(), sort_order: i + 1 })),
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Class timings updated.");
      qc.invalidateQueries({ queryKey: ["class-timings"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-pen px-3 py-1.5 text-xs font-semibold text-paper hover:bg-pen/90">
          <Pencil className="h-3.5 w-3.5" /> Edit timings
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit class timings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {rows.map((r, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-line p-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Row {i + 1}
                </Label>
                <button
                  onClick={() => setRows(rows.filter((_, j) => j !== i))}
                  className="text-destructive"
                  aria-label="Remove row"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Input
                placeholder="Day (e.g. Monday – Friday)"
                value={r.day}
                onChange={(e) =>
                  setRows(rows.map((x, j) => (j === i ? { ...x, day: e.target.value } : x)))
                }
              />
              <Input
                placeholder="Timing (e.g. 4:00 PM – 8:30 PM)"
                value={r.time}
                onChange={(e) =>
                  setRows(rows.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))
                }
              />
            </div>
          ))}
          <button
            onClick={() => setRows([...rows, { day: "", time: "" }])}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-line px-4 py-2.5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Add a row
          </button>
        </div>
        <DialogFooter>
          <button
            disabled={save.isPending}
            onClick={() => save.mutate()}
            className="rounded-lg bg-pen px-5 py-2.5 font-semibold text-paper hover:bg-pen/90 disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : "Save timings"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
