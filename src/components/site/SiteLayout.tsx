import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { SITE } from "@/lib/site";
import { useAuth } from "@/lib/useAuth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/profile", label: "Profile" },
  { to: "/materials", label: "Study Material" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { isAdmin, session } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-line bg-paper/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Brilliant Desk Tuitions logo"
              className="h-11 w-11 rounded-xl object-cover"
            />
            <span className="leading-tight">
              <span className="block font-display text-[19px] font-semibold">{SITE.name}</span>
              <span className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {SITE.since} · Bengaluru
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-[14.5px] font-medium md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`border-b-2 pb-1 text-ink-soft transition-colors hover:border-marigold ${
                  pathname === n.to ? "border-marigold" : "border-transparent"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper"
              >
                <LogIn className="h-4 w-4" /> {session ? "Account" : "Teacher Login"}
              </Link>
            )}
          </div>

          <button
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-line bg-paper px-6 py-4 md:hidden">
            <nav className="grid gap-3 text-[15px] font-medium">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}>
                  {n.label}
                </Link>
              ))}
              <Link to={isAdmin ? "/admin" : "/auth"} onClick={() => setOpen(false)}>
                {isAdmin ? "Teacher Dashboard" : "Teacher Login"}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-line bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <p className="font-display text-lg font-semibold">{SITE.name}</p>
                <p className="font-mono text-[11px] uppercase tracking-widest text-paper/60">
                  {SITE.since}
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm text-paper/70">{SITE.tagline}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-marigold">Pages</p>
            <div className="mt-4 grid gap-2 text-sm text-paper/80">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="hover:text-marigold">
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-marigold">Reach us</p>
            <div className="mt-4 grid gap-2 text-sm text-paper/80">
              <a href={`tel:+${SITE.whatsapp}`} className="hover:text-marigold">
                {SITE.phone}
              </a>
              <a
                href={`https://wa.me/${SITE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-marigold"
              >
                WhatsApp {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              <a href={SITE.mapsShareUrl} target="_blank" rel="noreferrer" className="hover:text-marigold">
                View location on Google Maps
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-paper/10 px-6 py-5 text-center font-mono text-[11px] uppercase tracking-widest text-paper/50">
          © {new Date().getFullYear()} {SITE.name}
        </div>
      </footer>
    </div>
  );
}
