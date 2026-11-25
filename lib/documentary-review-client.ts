import type {
  DocumentaryScript,
} from "./documentary-script-types";

export type PreviewId =
  | "dominant"
  | "comeback";

export type DemoDraft = {
  id: string;
  preview_id: PreviewId;
  season: number;
  version: number;
  script: DocumentaryScript;
  status:
    | "awaiting-review"
    | "revision-requested"
    | "demo-approved";
  fictional: true;
  revision_notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DemoHistory = {
  id: string;
  draft_id: string;
  action:
    | "created"
    | "revision-requested"
    | "demo-approved";
  notes: string | null;
  created_at: string;
};

export type DemoReviewData = {
  drafts: DemoDraft[];
  history: DemoHistory[];
};

export type DemoAction =
  | {
      action: "create";
      previewId: PreviewId;
    }
  | {
      action:
        | "revision-requested"
        | "demo-approved";
      draftId: string;
      version: number;
      notes?: string;
      reviewed: boolean;
    };

const ENDPOINT =
  "/api/commissioner/documentaries";

async function readResponse(
  response: Response
) {
  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok || !data?.ok) {
    throw new Error(
      data?.error ||
      "Documentary request failed."
    );
  }

  return data;
}

export async function loadDemoReviews():
  Promise<DemoReviewData> {

  const response = await fetch(
    ENDPOINT,
    {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    }
  );

  const data =
    await readResponse(response);

  if (
    !Array.isArray(data.drafts) ||
    !Array.isArray(data.history)
  ) {
    throw new Error(
      "Invalid documentary response."
    );
  }

  return {
    drafts: data.drafts,
    history: data.history,
  };
}

export async function submitDemoAction(
  action: DemoAction
): Promise<DemoDraft> {
  const response = await fetch(
    ENDPOINT,
    {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(action),
    }
  );

  const data =
    await readResponse(response);

  if (
    !data.draft ||
    data.draft.fictional !== true
  ) {
    throw new Error(
      "Invalid fictional draft response."
    );
  }

  return data.draft;
}