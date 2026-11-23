
import { NextResponse } from "next/server";
import { commissioner } from "../../../../lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await commissioner();

  if (!user) {
    return NextResponse.json(
      { error: "Commissioner login required." },
      { status: 403 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL;
  const to = process.env.COMMISSIONER_EMAIL;

  if (!apiKey || !from || !to) {
    return NextResponse.json(
      {
        error:
          "Missing RESEND_API_KEY, " +
          "NEWSLETTER_FROM_EMAIL, or " +
          "COMMISSIONER_EMAIL in Vercel.",
      },
      { status: 503 }
    );
  }

  const html = `
    <div style="
      font-family:Arial,sans-serif;
      max-width:600px;
      margin:auto;
      padding:25px;
      color:#193b2f;
    ">
      <h1>THE BOYS LEAGUE HQ</h1>
      <h2>🏈 Email Test Successful!</h2>

      <p>
        Commissioner, your website successfully
        connected to Resend and submitted
        this test email.
      </p>

      <p>
        Your Wednesday newsletter approval
        emails will use this same email provider.
      </p>

      <p>
        This is only a test.
        No newsletter was published.
      </p>

      <p>
        <a href=
        "https://the-boys-league-hq.vercel.app/commissioner"
        >
          Open Commissioner HQ
        </a>
      </p>

      <h3>ICE TF UP! 🏈</h3>
    </div>
  `;

  try {
    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject:
            "🏈 The Boys League HQ — Email Test",
          html,
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    const result = await response.json().catch(
      () => ({})
    );

    if (!response.ok) {
      console.error(
        "Resend test failed:",
        response.status,
        result
      );

      const detail =
        typeof result.message === "string"
          ? result.message
          : "Resend rejected the email request.";

      return NextResponse.json(
        {
          error:
            `Resend error ${response.status}: ` +
            detail,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Resend accepted your test email! " +
        "Check your inbox and Resend sending logs.",
      emailId: result.id ?? null,
    });
  } catch (error) {
    console.error("Email test error:", error);

    return NextResponse.json(
      {
        error:
          "Could not connect to Resend. " +
          "Check your Vercel function logs.",
      },
      { status: 500 }
    );
  }
}
