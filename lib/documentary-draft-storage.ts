import {
  createClient,
} from "@supabase/supabase-js";

import {
  buildDocumentaryDemoDraft,
  isDocumentaryDemoId,
  type DocumentaryDemoId,
} from "./documentary-demo-draft";

import {
  validateDocumentaryScript,
} from "./documentary-script-validation";

export type DocumentaryReviewAction =
  | "revision-requested"
  | "demo-approved";

function database() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Documentary storage is not configured."
    );
  }

  return createClient(
    url,
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function listDocumentaryDrafts(
  ownerId: string
) {
  const db = database();

  const { data, error } =
    await db
      .from("documentary_demo_drafts")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("fictional", true)
      .order("version", {
        ascending: false,
      });

  if (error) {
    throw new Error(
      "Unable to load documentary drafts."
    );
  }

  const {
    data: history,
    error: historyError,
  } = await db
    .from("documentary_demo_history")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", {
      ascending: false,
    });

  if (historyError) {
    throw new Error(
      "Unable to load documentary history."
    );
  }

  return {
    drafts: data ?? [],

    history: history ?? [],

    fictional: true,

    readyForRendering: false,

    readyForPublication: false,
  };
}

export async function createDocumentaryDraft(
  ownerId: string,
  previewId: DocumentaryDemoId
) {
  const demo =
    buildDocumentaryDemoDraft(
      previewId
    );

  const db = database();

  const { data, error } =
    await db.rpc(
      "create_documentary_demo",
      {
        p_owner_id: ownerId,
        p_preview_id: previewId,
        p_season: demo.season,
        p_script: demo.script,
      }
    );

  if (
    error ||
    !data ||
    typeof data !== "object" ||
    !data.draft
  ) {
    throw new Error(
      "Unable to create documentary draft."
    );
  }

  return {
    draft: data.draft,

    created: data.created === true,

    fictional: true,

    aiRequests: 0,

    yahooRequests: 0,

    readyForRendering: false,

    readyForPublication: false,
  };
}

export async function reviewDocumentaryDraft(
  input: {
    ownerId: string;
    draftId: string;
    version: number;
    action: DocumentaryReviewAction;
    notes?: string;
    reviewed: boolean;
  }
) {
  if (
    !Number.isInteger(input.version) ||
    input.version < 1
  ) {
    throw new Error(
      "Invalid draft version."
    );
  }

  if (
    input.action !== "revision-requested" &&
    input.action !== "demo-approved"
  ) {
    throw new Error(
      "Invalid review action."
    );
  }

  const notes =
    input.notes?.trim() ?? "";

  if (
    input.action === "revision-requested" &&
    (
      notes.length === 0 ||
      notes.length > 3000
    )
  ) {
    throw new Error(
      "Revision notes must contain 1–3000 characters."
    );
  }

  if (
    input.action === "demo-approved" &&
    input.reviewed !== true
  ) {
    throw new Error(
      "Confirm the script review before approval."
    );
  }

  const db = database();

  const { data: draft, error } =
    await db
      .from("documentary_demo_drafts")
      .select("*")
      .eq("id", input.draftId)
      .eq("owner_id", input.ownerId)
      .eq("version", input.version)
      .eq("fictional", true)
      .eq("status", "awaiting-review")
      .maybeSingle();

  if (error || !draft) {
    throw new Error(
      "Draft unavailable or already reviewed."
    );
  }

  if (
    !isDocumentaryDemoId(
      draft.preview_id
    )
  ) {
    throw new Error(
      "Invalid fictional preview."
    );
  }

  const demo =
    buildDocumentaryDemoDraft(
      draft.preview_id
    );

  const validation =
    validateDocumentaryScript(
      draft.script,
      demo.brief
    );

  if (
    !validation.verified ||
    !validation.review
  ) {
    throw new Error(
      "Stored script failed validation."
    );
  }

  const {
    data: updated,
    error: updateError,
  } = await db.rpc(
    "review_documentary_demo",
    {
      p_owner_id: input.ownerId,

      p_draft_id: input.draftId,

      p_version: input.version,

      p_action: input.action,

      p_notes:
        input.action === "revision-requested"
          ? notes
          : null,
    }
  );

  if (updateError || !updated) {
    throw new Error(
      "Review could not be saved. Refresh and try again."
    );
  }

  return {
    draft: updated,

    fictional: true,

    aiRequests: 0,

    yahooRequests: 0,

    renderingRequests: 0,

    readyForRendering: false,

    readyForPublication: false,
  };
}