import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock3, FileText, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data } = useQuery({
    queryKey: ["admin-overview", year, month],
    queryFn: async () => {
      const [students, payments, materials] = await Promise.all([
        supabase.from("students").select("id"),
        supabase.from("payments").select("student_id, paid").eq("year", year).eq("month", month),
        supabase.from("study_materials").select("id"),
      ]);
      const total = students.data?.length ?? 0;
      const paid = payments.data?.filter((p) => p.paid).length ?? 0;
      return { total, paid, pending: total - paid, materials: materials.data?.length ?? 0 };
    },
  });

  const cards = [
    { label: "Students enrolled", value: data?.total ?? 0, icon: Users, tone: "text-pen" },
    { label: "Paid this month", value: data?.paid ?? 0, icon: CheckCircle2, tone: "text-exam-green" },
    { label: "Pending this month", value: data?.pending ?? 0, icon: Clock3, tone: "text-marigold-deep" },
    { label: "Study material files", value: data?.materials ?? 0, icon: FileText, tone: "text-pen" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="paper-card p-6">
            <c.icon className={`h-6 w-6 ${c.tone}`} />
            <p className="mt-4 font-display text-4xl">{c.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link to="/admin/students" className="paper-card block p-6 hover:border-marigold">
          <h2 className="font-display text-xl">Students & monthly fees</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add students, mark each month as paid or pending, and export the full payment list to
            PDF or Excel.
          </p>
        </Link>
        <Link to="/admin/materials" className="paper-card block p-6 hover:border-marigold">
          <h2 className="font-display text-xl">Study material uploads</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload PYQs, notes and model papers as PDFs — they appear instantly on the public
            material page.
          </p>
        </Link>
      </div>
    </section>
  );
}
