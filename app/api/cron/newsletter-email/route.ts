
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/yahoo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE_URL =
  "https://the-boys-league-hq.vercel.app";

type Section = {
  id: string;
  title: string;
  body: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => {
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

function validSections(value: unknown): value is Section[] {
  const ids = [
    "intro",
    "matchup-1",
    "matchup-2",
    "matchup-3",
    "matchup-4",
    "matchup-5",
    "awards",
    "closing",
  ];

  return (
    Array.isArray(value) &&
    value.length === ids.length &&
    value.every((section, index) =>
      section !== null &&
      typeof section === "object" &&
      section.id === ids[index] &&
      typeof section.title === "string" &&
      typeof section.body === "string" &&
      section.body.trim().length > 0
    )
  );
}

function buildArticle(sections: Section[]) {
  const headline =
    sections[0].title.trim() ||
    "THE WEDNESDAY REPORT";

  const paragraphs = sections.flatMap(section =>
    section.body
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(Boolean)
  );

  const articleHtml = paragraphs
    .map(
      paragraph => `
        <p style="
          font-family:Georgia,'Times New Roman',serif;
          font-size:17px;
          line-height:1.85;
          color:#211f19;
          margin:0 0 22px;
          white-space:pre-wrap;
        ">${escapeHtml(paragraph)}</p>
      `
    )
    .join("");

  return { headline, articleHtml };
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
      { error: "Email configuration is missing." },
      { status: 503 }
    );
  }

  try {
    const database = db();

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
        message: "No pending newsletter to email.",
      });
    }

    if (!validSections(draft.sections)) {
      return NextResponse.json(
        {
          error:
            "Newsletter is incomplete. " +
            "Commissioner review is required.",
        },
        { status: 409 }
      );
    }

    // Automated email delivery is intentionally
    // disabled until a verified Yahoo data source
    // is connected to draft generation.
    //
    // This prevents existing fictional or manual
    // test drafts from being emailed as verified
    // weekly league coverage.
    if (
      process.env.NEWSLETTER_VERIFIED_DELIVERY !==
      "enabled"
    ) {
      return NextResponse.json({
        ok: true,
        ready: false,
        message:
          "Email template is ready. " +
          "Verified delivery remains disabled " +
          "until Yahoo integration is complete.",
      });
    }

    const { data: claimed, error: claimError } =
      await database
        .from("weekly_newsletter_drafts")
        .update({
          notification_status: "sending",
        })
        .eq("id", draft.id)
        .eq("status", "draft")
        .eq("notification_status", "pending")
        .select("id")
        .maybeSingle();

    if (claimError) throw claimError;

    if (!claimed) {
      return NextResponse.json({
        ok: true,
        message: "Draft is already being processed.",
      });
    }

    const { headline, articleHtml } =
      buildArticle(draft.sections);

    const editorUrl =
      `${SITE_URL}/commissioner/newsletters` +
      `?year=${draft.year}&week=${draft.week}`;

    const html = `
      <div style="
        background:#e9e5d9;
        padding:24px 12px;
        font-family:Arial,sans-serif;
      ">
        <div style="
          max-width:720px;
          margin:0 auto;
          background:#f4f0e4;
          border:1px solid #c6beac;
          padding:28px;
        ">
          <div style="
            text-align:center;
            font-size:12px;
            font-weight:800;
            letter-spacing:2px;
            color:#164d3c;
          ">
            THE BOYS LEAGUE HQ
          </div>

          <h1 style="
            text-align:center;
            font-family:Georgia,serif;
            font-size:48px;
            color:#211f19;
            margin:16px 0;
          ">
            The Boys
          </h1>

          <div style="
            text-align:center;
            border-top:4px double #38352d;
            border-bottom:2px solid #38352d;
            padding:12px 0;
            font-size:12px;
            font-weight:800;
            letter-spacing:1px;
          ">
            SEASON ${draft.year}
            &bull; WEEK ${draft.week}
            &bull; WEDNESDAY REPORT
          </div>

          <div style="
            background:#e4eee7;
            padding:18px;
            margin:24px 0;
            border:1px solid #bdd2c2;
          ">
            <h2 style="
              margin:0 0 10px;
              color:#164d3c;
              font-size:20px;
            ">
              Commissioner Approval Required
            </h2>

            <p style="
              margin:0 0 16px;
              line-height:1.6;
            ">
              Your weekly article is ready.
              Read the complete draft below.
              Open Commissioner HQ to make
              changes or approve publication.
            </p>

            <a href="${editorUrl}" style="
              display:inline-block;
              background:#164d3c;
              color:#ffffff;
              text-decoration:none;
              padding:15px 22px;
              border-radius:5px;
              font-weight:800;
            ">
              REVIEW &amp; APPROVE ARTICLE
            </a>
          </div>

          <h2 style="
            font-family:Georgia,serif;
            text-align:center;
            font-size:34px;
            line-height:1.2;
            color:#211f19;
            margin:32px 0 28px;
          ">
            ${escapeHtml(headline)}
          </h2>

          <div>
            ${articleHtml}
          </div>

          <div style="
            border-top:4px double #38352d;
            padding-top:24px;
            margin-top:30px;
            text-align:center;
          ">
            <p style="
              font-size:14px;
              line-height:1.6;
            ">
              This article has not been published.
              Your approval is required before
              it appears on The Boys Write-Up.
            </p>

            <a href="${editorUrl}" style="
              display:inline-block;
              background:#164d3c;
              color:#ffffff;
              text-decoration:none;
              padding:15px 22px;
              border-radius:5px;
              font-weight:800;
            ">
              OPEN NEWSLETTER EDITOR
            </a>

            <p style="
              margin-top:28px;
              font-size:11px;
              font-weight:800;
              letter-spacing:1px;
            ">
              THE BOYS &bull; EST. 2020
              &bull; ALL RECEIPTS PRESERVED
            </p>
          </div>
        </div>
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
            `Article Ready for Approval`,
          html,
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!response.ok) {
      const details = await response.text();

      console.error(
        "Newsletter email failed:",
        response.status,
        details
      );

      // Restore pending status so a failed
      // delivery can be retried.
      await database
        .from("weekly_newsletter_drafts")
        .update({
          notification_status: "pending",
        })
        .eq("id", draft.id)
        .eq("notification_status", "sending");

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
      message: "Commissioner approval email sent.",
      year: draft.year,
      week: draft.week,
    });
  } catch (error) {
    console.error(
      "Newsletter email automation failed:",
      error
    );

    return NextResponse.json(
      {
        error: "Newsletter email check failed.",
      },
      { status: 500 }
    );
  }
}
