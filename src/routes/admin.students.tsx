import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { BOARDS, CLASS_LEVELS, MONTHS, SITE } from "@/lib/site";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/students")({
  component: AdminStudents,
});

type Student = {
  id: string;
  roll_no: number;
  name: string;
  grade: string;
  board: string;
  phone: string | null;
};

type Payment = {
  id: string;
  student_id: string;
  year: number;
  month: number;
  paid: boolean;
  paid_date: string | null;
  amount: number | null;
};

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

function AdminStudents() {
  const qc = useQueryClient();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").order("roll_no");
      if (error) throw error;
      return data as Student[];
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments", year],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*").eq("year", year);
      if (error) throw error;
      return data as Payment[];
    },
  });

  const monthPayment = (studentId: string) =>
    payments.find((p) => p.student_id === studentId && p.month === month);

  const toggle = useMutation({
    mutationFn: async (student: Student) => {
      const existing = monthPayment(student.id);
      const nextPaid = !existing?.paid;
      const row = {
        student_id: student.id,
        year,
        month,
        paid: nextPaid,
        paid_date: nextPaid ? new Date().toISOString().slice(0, 10) : null,
      };
      const { error } = await supabase
        .from("payments")
        .upsert(row, { onConflict: "student_id,year,month" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments", year] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Student removed.");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = students.map((s) => {
    const p = monthPayment(s.id);
    return {
      id: String(s.roll_no).padStart(3, "0"),
      name: s.name,
      grade: `Class ${s.grade}`,
      board: s.board,
      status: p?.paid ? "Paid" : "Pending",
      date: p?.paid_date ? new Date(p.paid_date).toLocaleDateString("en-IN") : "—",
    };
  });

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(SITE.name, 14, 16);
    doc.setFontSize(11);
    doc.text(`Fee payment list — ${MONTHS[month - 1]} ${year}`, 14, 23);
    autoTable(doc, {
      startY: 29,
      head: [["ID", "Student name", "Class", "Board", "Payment status", "Payment date"]],
      body: rows.map((r) => [r.id, r.name, r.grade, r.board, r.status, r.date]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [26, 26, 24] },
    });
    doc.save(`fees-${MONTHS[month - 1]}-${year}.pdf`);
  };

  const exportYearPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text(SITE.name, 14, 16);
    doc.setFontSize(11);
    doc.text(`Full payment record — ${year}`, 14, 23);
    autoTable(doc, {
      startY: 29,
      head: [["ID", "Student", "Class", "Board", ...MONTHS.map((m) => m.slice(0, 3))]],
      body: students.map((s) => [
        String(s.roll_no).padStart(3, "0"),
        s.name,
        `Class ${s.grade}`,
        s.board,
        ...MONTHS.map((_, i) =>
          payments.find((p) => p.student_id === s.id && p.month === i + 1)?.paid ? "P" : "-",
        ),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 26, 24] },
    });
    doc.save(`fees-full-year-${year}.pdf`);
  };

  const exportExcel = () => {
    const header = ["ID", "Student Name", "Class", "Board", ...MONTHS, "Months Paid"];
    const lines = students.map((s) => {
      const marks = MONTHS.map((_, i) => {
        const p = payments.find((x) => x.student_id === s.id && x.month === i + 1);
        return p?.paid ? (p.paid_date ?? "Paid") : "Pending";
      });
      const paidCount = marks.filter((m) => m !== "Pending").length;
      return [
        String(s.roll_no).padStart(3, "0"),
        s.name,
        `Class ${s.grade}`,
        s.board,
        ...marks,
        String(paidCount),
      ];
    });
    const csv = [header, ...lines]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `fees-full-year-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const paidCount = students.filter((s) => monthPayment(s.id)?.paid).length;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Students & monthly fees</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {paidCount} of {students.length} paid for {MONTHS[month - 1]} {year}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-9 rounded-md border border-input bg-card px-3 text-sm"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="h-9 rounded-md border border-input bg-card px-3 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <AddStudentDialog onAdded={() => qc.invalidateQueries({ queryKey: ["students"] })} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={exportPdf} className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-marigold">
          <Download className="h-4 w-4" /> This month (PDF)
        </button>
        <button onClick={exportYearPdf} className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-marigold">
          <Download className="h-4 w-4" /> Full year (PDF)
        </button>
        <button onClick={exportExcel} className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-marigold">
          <FileSpreadsheet className="h-4 w-4" /> Full year (Excel/CSV)
        </button>
      </div>

      <div className="paper-card mt-5 overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-paper-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Student name</th>
              <th className="px-4 py-3">Class / grade</th>
              <th className="px-4 py-3">Target board</th>
              <th className="px-4 py-3">Payment status</th>
              <th className="px-4 py-3">Payment date</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No students yet — add your first student.
                </td>
              </tr>
            )}
            {students.map((s) => {
              const p = monthPayment(s.id);
              const paid = !!p?.paid;
              return (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-4 py-3 font-mono text-xs">{String(s.roll_no).padStart(3, "0")}</td>
                  <td className="px-4 py-3 font-semibold">{s.name}</td>
                  <td className="px-4 py-3">Class {s.grade}</td>
                  <td className="px-4 py-3">{s.board}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        paid
                          ? "bg-[oklch(0.95_0.03_155)] text-exam-green"
                          : "bg-[oklch(0.96_0.06_75)] text-marigold-deep"
                      }`}
                    >
                      {paid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p?.paid_date ? new Date(p.paid_date).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle.mutate(s)}
                      className="rounded-lg border border-ink px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-ink hover:text-paper"
                    >
                      {paid ? "Mark as Pending" : "Mark as Paid"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          aria-label={`Remove ${s.name}`}
                          className="text-destructive transition-opacity hover:opacity-70"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {s.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This deletes the student and their whole payment history. This cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove.mutate(s.id)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AddStudentDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "1", board: BOARDS[0] as string, phone: "" });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("students").insert({
        name: form.name,
        grade: form.grade,
        board: form.board,
        phone: form.phone || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Student added.");
      setForm({ name: "", grade: "1", board: BOARDS[0] as string, phone: "" });
      setOpen(false);
      onAdded();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-lg bg-pen px-4 py-2 text-sm font-semibold text-paper hover:bg-pen/90">
          <Plus className="h-4 w-4" /> Add student
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add student</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sname">Student name</Label>
            <Input id="sname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sg">Class / grade</Label>
              <select
                id="sg"
                className="h-9 rounded-md border border-input bg-card px-3 text-sm"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              >
                {CLASS_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sb">Target board</Label>
              <select
                id="sb"
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
            <Label htmlFor="sp">Parent phone (optional)</Label>
            <Input id="sp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <button
            disabled={add.isPending || !form.name}
            onClick={() => add.mutate()}
            className="rounded-lg bg-pen px-5 py-2.5 font-semibold text-paper hover:bg-pen/90 disabled:opacity-60"
          >
            {add.isPending ? "Adding…" : "Add student"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
