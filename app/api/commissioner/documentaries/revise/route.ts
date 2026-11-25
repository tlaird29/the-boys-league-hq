import "server-only";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

import {
  commissioner,
} from "../../../../../lib/server-auth";

import {
  buildDocumentaryDemoDraft,
  isDocumentaryDemoId,
} from "../../../../../lib/documentary-demo-draft";

import {
  validateDocumentaryScript,
} from "../../../../../lib/documentary-script-validation";

import type {
  DocumentaryScript,
} from "../../../../../lib/documentary-script-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function respond(
  body: unknown,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(
  request: NextRequest
) {
  const user = await commissioner();

  if (!user) {
    return respond({
      ok: false,
      error: "Unauthorized.",
    }, 401);
  }

  if (
    request.headers.get("origin") !==
      request.nextUrl.origin ||
    request.headers.get("sec-fetch-site") ===
      "cross-site"
  ) {
    return respond({
      ok: false,
      error: "Invalid request origin.",
    }, 403);
  }

  try {
    const body = await request.json();

    if (
      typeof body?.draftId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        .test(body.draftId) ||
      !Number.isInteger(body.version) ||
      body.version < 1
    ) {
      return respond({
        ok: false,
        error: "Invalid draft or version.",
      }, 400);
    }

    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        "Storage is not configured."
      );
    }

    const db = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: previous,
      error: readError,
    } = await db
      .from("documentary_demo_drafts")
      .select("*")
      .eq("id", body.draftId)
      .eq("owner_id", user.id)
      .eq("version", body.version)
      .eq("fictional", true)
      .eq("status", "revision-requested")
      .maybeSingle();

    if (
      readError ||
      !previous ||
      !isDocumentaryDemoId(
        previous.preview_id
      )
    ) {
      return respond({
        ok: false,
        error: "Revision unavailable.",
      }, 409);
    }

    const demo =
      buildDocumentaryDemoDraft(
        previous.preview_id
      );

    const original =
      validateDocumentaryScript(
        previous.script,
        demo.brief
      );

    if (
      !original.verified ||
      !original.review
    ) {
      return respond({
        ok: false,
        error: "Previous script is invalid.",
      }, 422);
    }

    const nextVersion =
      previous.version + 1;

    const script: DocumentaryScript =
      JSON.parse(
        JSON.stringify(
          original.review.script
        )
      );

    const baseTitle =
      previous.preview_id === "dominant"
        ? "THE REIGN OF TERROR"
        : "AGAINST ALL ODDS";

    script.title =
      `${baseTitle} — CUT ${nextVersion}`;

    script.subtitle =
      `Fictional editorial demonstration, version ${nextVersion}`;

    script.scenes = script.scenes.map(
      (scene, index) => ({
        ...scene,

        headline:
          index === 0
            ? `THE STORY BEGINS — CUT ${nextVersion}`
            : scene.headline,

        visualDirection:
          index === 0
            ? `Editorial cut ${nextVersion}. Open with a cinematic title reveal and transition into the verified fictional season evidence.`
            : scene.visualDirection,

        transition:
          index === 0
            ? nextVersion % 2 === 0
              ? "fade"
              : "cut"
            : scene.transition,
      })
    );

    const validation =
      validateDocumentaryScript(
        script,
        demo.brief
      );

    if (
      !validation.verified ||
      !validation.review
    ) {
      return respond({
        ok: false,
        error:
          "Revised demonstration failed validation.",
        issues: validation.issues,
      }, 422);
    }

    const {
      data: saved,
      error: saveError,
    } = await db.rpc(
      "revise_documentary_demo",
      {
        p_owner_id: user.id,
        p_draft_id: previous.id,
        p_version: previous.version,
        p_script:
          validation.review.script,
      }
    );

    if (saveError || !saved) {
      return respond({
        ok: false,
        error:
          "Revision could not be saved. Refresh and try again.",
      }, 409);
    }

    return respond({
      ok: true,
      draft: saved,
      fictional: true,
      revisionMode: "editorial-demo",
      notesAppliedByAI: false,
      aiRequests: 0,
      yahooRequests: 0,
      readyForRendering: false,
      readyForPublication: false,
    }, 201);

  } catch (error) {
    console.error(
      "Documentary revision failed:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return respond({
      ok: false,
      error:
        "Unable to create documentary revision.",
    }, 500);
  }
}