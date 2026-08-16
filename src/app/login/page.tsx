"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Identifiants invalides.");
      return;
    }

    // requireAdmin() côté serveur tranchera si ce compte est admin ou non.
    router.push("/");
    router.refresh();
  }

  return (
    <div className="auth-shell">
      <div>
        <div className="auth-brand">
          <div className="brand-mark" />
          <div className="auth-brand-text">
            <div className="display">Arira</div>
            <div className="sub">Espace admin</div>
          </div>
        </div>

        <div className="card auth-card">
          <h1 className="display">Connexion</h1>
          <p className="lede">Utilise ton compte Arira habituel — l&apos;accès est vérifié côté serveur.</p>
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="toi@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="auth-error">
                <span>⚠</span> {error}
              </p>
            )}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
