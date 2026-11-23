
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const REMEMBER_EMAIL_KEY = "boys-commissioner-email";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem(
      REMEMBER_EMAIL_KEY
    );

    if (savedEmail) {
      setEmail(savedEmail);
    }

    let active = true;

    async function checkSession() {
      const { data } = await supabase.auth.getUser();

      if (!active) return;

      if (data.user) {
        router.replace("/commissioner");
        router.refresh();
      } else {
        setCheckingSession(false);
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem(
        REMEMBER_EMAIL_KEY,
        email.trim()
      );
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    setPassword("");
    router.replace("/commissioner");
    router.refresh();
  }

  if (checkingSession) {
    return (
      <main className="shell">
        <div className="kicker">
          THE BOYS • COMMISSIONER
        </div>
        <h1>CHECKING YOUR SESSION...</h1>
        <p className="muted">
          Taking you to Commissioner HQ if
          you're already signed in.
        </p>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • COMMISSIONER
      </div>

      <h1>COMMISSIONER LOGIN</h1>

      <p className="muted">
        Sign in to manage The Boys League HQ.
        Your Supabase session can stay active
        between visits.
      </p>

      <form
        onSubmit={handleLogin}
        className="card"
        style={{ maxWidth: 520 }}
      >
        <label htmlFor="email">
          Email Address
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
          autoComplete="email"
        />

        <label htmlFor="password">
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
          autoComplete="current-password"
        />

        <label
          htmlFor="rememberMe"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
            marginBottom: 18,
            cursor: "pointer",
          }}
        >
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) =>
              setRememberMe(e.target.checked)
            }
            style={{
              width: 18,
              height: 18,
            }}
          />

          <span>
            Remember my email on this device
          </span>
        </label>

        <button
          type="submit"
          className="button"
          disabled={loading}
        >
          {loading
            ? "SIGNING IN..."
            : "SIGN IN TO COMMISSIONER HQ"}
        </button>

        {message && (
          <p
            role="alert"
            style={{
              marginTop: 14,
              color: "#b91c1c",
            }}
          >
            {message}
          </p>
        )}

        <p
          className="muted"
          style={{
            marginTop: 18,
            fontSize: 12,
          }}
        >
          Your password is never saved by
          this form. Supabase manages your
          authenticated session securely.
        </p>
      </form>
    </main>
  );
}
