import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { openStoredFile } from "@/lib/storage";
import { BOARDS, CLASS_LEVELS, MATERIAL_CATEGORIES } from "@/lib/site";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/materials")({
  component: AdminMaterials,
});

function AdminMaterials() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    category: MATERIAL_CATEGORIES[0].value as string,
    class_level: "10",
    board: BOARDS[0] as string,
    subject: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const { data: items = [] } = useQuery({
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

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a PDF file first.");
      const path = `${form.category}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("materials").upload(path, file);
      if (upErr) throw upErr;
      const { error } = await supabase.from("study_materials").insert({ ...form, file_url: path });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Uploaded — it's live on the study material page.");
      setForm({ ...form, title: "", subject: "" });
      setFile(null);
      qc.invalidateQueries({ queryKey: ["materials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (m: { id: string; file_url: string }) => {
      await supabase.storage.from("materials").remove([m.file_url]);
      const { error } = await supabase.from("study_materials").delete().eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed.");
      qc.invalidateQueries({ queryKey: ["materials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 lg:grid-cols-[380px_1fr]">
      <form
        className="paper-card h-fit p-6"
        onSubmit={(e) => {
          e.preventDefault();
          upload.mutate();
        }}
      >
        <h1 className="font-display text-2xl">Upload material</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          PDFs appear instantly on the public study material page.
        </p>
        <div className="mt-5 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="t">Title</Label>
            <Input id="t" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c">Section</Label>
            <select
              id="c"
              className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {MATERIAL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cl">Class</Label>
              <select
                id="cl"
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
                value={form.class_level}
                onChange={(e) => setForm({ ...form, class_level: e.target.value })}
              >
                {CLASS_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bd">Board</Label>
              <select
                id="bd"
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
                value={form.board}
                onChange={(e) => setForm({ ...form, board: e.target.value })}
              >
                {BOARDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sj">Subject</Label>
            <Input id="sj" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-line bg-paper-2 px-4 py-3 text-sm">
            <Upload className="h-4 w-4 flex-none text-pen" />
            <span className="truncate">{file ? file.name : "Choose PDF file"}</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="submit"
            disabled={upload.isPending}
            className="rounded-lg bg-pen px-5 py-3 font-semibold text-paper hover:bg-pen/90 disabled:opacity-60"
          >
            {upload.isPending ? "Uploading…" : "Upload material"}
          </button>
        </div>
      </form>

      <div className="paper-card overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-paper-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No files uploaded yet.
                </td>
              </tr>
            )}
            {items.map((m) => (
              <tr key={m.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">
                  {m.title}
                  {m.subject && <span className="block text-xs font-normal text-muted-foreground">{m.subject}</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {MATERIAL_CATEGORIES.find((c) => c.value === m.category)?.label ?? m.category}
                </td>
                <td className="px-4 py-3">
                  {m.class_level}
                  {m.board ? ` · ${m.board}` : ""}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <button
                      aria-label={`Open ${m.title}`}
                      onClick={() => openStoredFile("materials", m.file_url).catch(() => toast.error("Could not open file."))}
                    >
                      <Download className="h-4 w-4 text-pen" />
                    </button>
                    <button
                      aria-label={`Delete ${m.title}`}
                      onClick={() => remove.mutate({ id: m.id, file_url: m.file_url })}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
