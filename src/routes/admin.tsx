import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { FileUp, LayoutDashboard, Users } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Teacher Dashboard — Brilliant Desk Tuitions" },
      {
        name: "description",
        content: "Private teacher dashboard for managing students, monthly fee payments and study material uploads.",
      },
      { property: "og:title", content: "Teacher Dashboard — Brilliant Desk Tuitions" },
      { property: "og:description", content: "Manage students, payments and study material." },
    ],
  }),
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/students", label: "Students & fees", icon: Users, exact: false },
  { to: "/admin/materials", label: "Study material", icon: FileUp, exact: false },
];

function AdminLayout() {
  const { loading, session, isAdmin } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-5xl px-6 py-24 text-muted-foreground">Checking access…</div>
      </SiteLayout>
    );
  }

  if (!session || !isAdmin) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="font-display text-3xl">Teacher access only</h1>
          <p className="mt-3 text-muted-foreground">
            This dashboard is private. Please sign in with the teacher account.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-block rounded-lg bg-pen px-6 py-3 font-semibold text-paper hover:bg-pen/90"
          >
            Go to teacher login
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 pb-6 pt-14">
        <span className="eyebrow">Teacher dashboard</span>
        <div className="mt-5 flex flex-wrap gap-2 border-b border-line pb-4">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-ink text-paper" : "border border-line bg-card text-ink-soft hover:border-marigold"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      <Outlet />
    </SiteLayout>
  );
}
