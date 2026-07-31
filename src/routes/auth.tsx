import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Teacher Login — Brilliant Desk Tuitions" },
      {
        name: "description",
        content: "Private sign-in for the Brilliant Desk Tuitions teacher to manage students, payments and study material.",
      },
      { property: "og:title", content: "Teacher Login — Brilliant Desk Tuitions" },
      { property: "og:description", content: "Private teacher access to the admin dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate({ to: "/admin" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("login");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-6 pb-24 pt-20">
        <div className="paper-card p-8">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-marigold-deep">
            <ShieldCheck className="h-4 w-4" /> Teacher only
          </div>
          <h1 className="mt-3 font-display text-3xl">
            {mode === "login" ? "Sign in" : "Create teacher account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The student list, payments and material uploads are visible only after signing in.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={submit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-pen px-6 py-3 font-semibold text-paper hover:bg-pen/90 disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-4 text-sm text-pen underline-offset-4 hover:underline"
          >
            {mode === "login" ? "First time? Create the teacher account" : "Already have an account? Sign in"}
          </button>
        </div>
      </section>
    </SiteLayout>
  );
}
