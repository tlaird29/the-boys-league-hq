
"use client";

import Link from "next/link";
import { useState } from "react";

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailId, setEmailId] = useState("");

  async function sendTestEmail() {
    setLoading(true);
    setMessage("");
    setError("");
    setEmailId("");

    try {
      const response = await fetch(
        "/api/commissioner/test-email",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Email test failed."
        );
      }

      setMessage(
        result.message || "Test email submitted."
      );

      if (result.emailId) {
        setEmailId(result.emailId);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • COMMISSIONER HQ
      </div>

      <h1>EMAIL DELIVERY TEST</h1>

      <p className="muted">
        Test the Resend email connection without
        waiting until Wednesday or creating
        a newsletter draft.
      </p>

      <section
        className="card"
        style={{ maxWidth: 650, marginTop: 24 }}
      >
        <div className="label">
          RESEND CONNECTION
        </div>

        <h2 style={{ marginTop: 12 }}>
          🏈 Send a Test Email
        </h2>

        <p className="muted">
          This sends a test message to the
          commissioner email configured in Vercel.
          It does not publish anything.
        </p>

        <button
          className="button"
          type="button"
          disabled={loading}
          onClick={sendTestEmail}
          style={{ marginTop: 16 }}
        >
          {loading
            ? "SENDING TEST EMAIL..."
            : "✉️ SEND TEST EMAIL"}
        </button>

        {message && (
          <div
            role="status"
            style={{
              marginTop: 20,
              padding: 16,
              background: "#e5f5ec",
              color: "#16583d",
              borderRadius: 8,
            }}
          >
            <strong>EMAIL REQUEST ACCEPTED</strong>
            <p>{message}</p>
            <p>
              Check your inbox, Spam folder,
              and Resend sending history.
            </p>

            {emailId && (
              <p
                style={{
                  fontSize: 12,
                  overflowWrap: "anywhere",
                }}
              >
                Resend Email ID: {emailId}
              </p>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              marginTop: 20,
              padding: 16,
              background: "#fff0f0",
              color: "#a12626",
              borderRadius: 8,
            }}
          >
            <strong>EMAIL TEST FAILED</strong>
            <p>{error}</p>
          </div>
        )}
      </section>

      <section
        className="card"
        style={{ maxWidth: 650, marginTop: 20 }}
      >
        <div className="label">
          TROUBLESHOOTING
        </div>

        <h2>What happens next?</h2>

        <p>
          <strong>If successful:</strong>{" "}
          Resend accepted the email. Check its
          delivery status in your Resend dashboard.
        </p>

        <p>
          <strong>If unsuccessful:</strong>{" "}
          The error message will help us identify
          the problem.
        </p>

        <p className="muted">
          If you use onboarding@resend.dev,
          the recipient must be the email
          address registered with Resend.
        </p>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link
          href="/commissioner"
          className="button"
        >
          ← BACK TO COMMISSIONER HQ
        </Link>
      </div>
    </main>
  );
}
