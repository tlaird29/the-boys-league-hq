
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/yahoo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE_URL = "https://the-boys-league-hq.vercel.app";

type Section = {
  id: string;
  title: string;
  body: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return replacements[char];
  });
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (
    !secret ||
    req.headers.get("authorization") !==
      `Bearer ${secret}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEWSLETTER_FROM_EMAIL;
  const to = process.env.COMMISSIONER_EMAIL;

  if (!apiKey || !from || !to) {
    return NextResponse.json(
      { error: "Email settings are missing." },
      { status: 503 }
    );
  }

  try {
    const database = db();

    // Look for an unpublished draft updated
    // within the last seven days.
    const cutoff = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: drafts, error } = await database
      .from("weekly_newsletter_drafts")
      .select(
        "id,year,week,sections,notification_status"
      )
      .eq("status", "draft")
      .eq("notification_status", "pending")
      .gte("updated_at", cutoff)
      .order("year", { ascending: false })
      .order("week", { ascending: false })
      .limit(1);

    if (error) throw error;

    const draft = drafts?.[0];

    if (!draft) {
      return NextResponse.json({
        ok: true,
        message: "No newsletter needs an email.",
      });
    }

    // Claim this draft to prevent overlapping
    // jobs from sending duplicate emails.
    const { data: claimed, error: claimError } =
      await database
        .from("weekly_newsletter_drafts")
        .update({ notification_status: "sending" })
        .eq("id", draft.id)
        .eq("status", "draft")
        .eq("notification_status", "pending")
        .select("id")
        .maybeSingle();

    if (claimError) throw claimError;

    if (!claimed) {
      return NextResponse.json({
        ok: true,
        message: "Draft already being processed.",
      });
    }

    const sections: Section[] = Array.isArray(
      draft.sections
    )
      ? draft.sections.filter(
          (section: Section) =>
            section &&
            typeof section.title === "string" &&
            typeof section.body === "string"
        )
      : [];

    const editorUrl =
      `${SITE_URL}/commissioner/newsletters` +
      `?year=${draft.year}&week=${draft.week}`;

    const preview = sections
      .map(
        (section) =>
          `<h3>${escapeHtml(section.title)}</h3>` +
          `<p style="white-space:pre-line">` +
          `${escapeHtml(section.body)}</p>`
      )
      .join("");

    const html = `
      <div style="
        font-family:Arial,sans-serif;
        max-width:650px;
        margin:auto;
        color:#202820;
      ">
        <h1>THE BOYS LEAGUE HQ</h1>
        <h2>
          Week ${draft.week}, ${draft.year}
          — Newsletter Ready for Review
        </h2>
        <p>
          Commissioner, your weekly newsletter
          is ready for review.
        </p>
        <p>
          Read the preview below, then open
          Commissioner HQ to edit, regenerate,
          or approve and publish.
        </p>
        <p>
          <a href="${editorUrl}"
             style="
               background:#164d3c;
               color:white;
               padding:14px 20px;
               display:inline-block;
               text-decoration:none;
               border-radius:6px;
             ">
            REVIEW NEWSLETTER
          </a>
        </p>
        <hr/>
        ${preview || "<p>No preview available.</p>"}
        <hr/>
        <p>
          Nothing publishes until you approve it.
          The previous edition stays live.
        </p>
        <p>ICE TF UP! 🏈</p>
      </div>
    `;

    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key":
            `boys-newsletter-${draft.id}`,
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject:
            `🏈 The Boys — Week ${draft.week} ` +
            `Newsletter Ready for Approval`,
          html,
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      console.error(
        "Resend failed:",
        response.status,
        details
      );

      return NextResponse.json(
        { error: "Email delivery failed." },
        { status: 502 }
      );
    }

    const sent = await response.json();

    const { error: updateError } = await database
      .from("weekly_newsletter_drafts")
      .update({
        notification_status: "sent",
        notification_sent_at:
          new Date().toISOString(),
        notification_message_id: sent.id ?? null,
      })
      .eq("id", draft.id)
      .eq("notification_status", "sending");

    if (updateError) throw updateError;

    return NextResponse.json({
      ok: true,
      message: "Commissioner email sent.",
      year: draft.year,
      week: draft.week,
    });
  } catch (error) {
    console.error("Newsletter email error:", error);

    return NextResponse.json(
      { error: "Newsletter email check failed." },
      { status: 500 }
    );
  }
}
