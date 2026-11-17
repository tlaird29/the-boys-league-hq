
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      setMessage("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const supabase = createClient(url, key);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/commissioner");
    router.refresh();
  }

  return (
    <main className="shell">
      <div className="kicker">THE BOYS • COMMISSIONER</div>
      <h1>COMMISSIONER LOGIN</h1>

      <p className="muted">
        Sign in to access the league management dashboard.
      </p>

      <form onSubmit={handleLogin} className="card">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          className="button"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {message && <p role="alert">{message}</p>}
      </form>
    </main>
  );
}
