import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  commissioner,
} from "../../../../lib/server-auth";

import {
  isDocumentaryDemoId,
} from "../../../../lib/documentary-demo-draft";

import {
  listDocumentaryDrafts,
  createDocumentaryDraft,
  reviewDocumentaryDraft,
} from "../../../../lib/documentary-draft-storage";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

function response(
  body: unknown,
  status = 200
) {
  return NextResponse.json(
    body,
    {
      status,

      headers: {
        "Cache-Control":
          "private, no-store",
      },
    }
  );
}

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function validUuid(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      .test(value)
  );
}

export async function GET() {
  const user =
    await commissioner();

  if (!user) {
    return response(
      {
        ok: false,
        error: "Unauthorized.",
      },
      401
    );
  }

  try {
    const result =
      await listDocumentaryDrafts(
        user.id
      );

    return response({
      ok: true,
      ...result,
    });

  } catch (error) {
    console.error(
      "Documentary list failed:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return response(
      {
        ok: false,

        error:
          "Unable to load documentary drafts.",
      },
      500
    );
  }
}

export async function POST(
  request: NextRequest
) {
  const user =
    await commissioner();

  if (!user) {
    return response(
      {
        ok: false,
        error: "Unauthorized.",
      },
      401
    );
  }

  const origin =
    request.headers.get("origin");

  const fetchSite =
    request.headers.get(
      "sec-fetch-site"
    );

  if (
    origin !== request.nextUrl.origin ||
    fetchSite === "cross-site"
  ) {
    return response(
      {
        ok: false,
        error: "Invalid request origin.",
      },
      403
    );
  }

  const contentType =
    request.headers.get(
      "content-type"
    ) ?? "";

  if (
    !contentType
      .toLowerCase()
      .startsWith("application/json")
  ) {
    return response(
      {
        ok: false,
        error: "JSON request required.",
      },
      415
    );
  }

  let body: unknown;

  try {
    const raw =
      await request.text();

    if (raw.length > 16000) {
      return response(
        {
          ok: false,
          error: "Request too large.",
        },
        413
      );
    }

    body = JSON.parse(raw);

  } catch {
    return response(
      {
        ok: false,
        error: "Invalid JSON request.",
      },
      400
    );
  }

  if (!isObject(body)) {
    return response(
      {
        ok: false,
        error: "Invalid request.",
      },
      400
    );
  }

  try {
    if (body.action === "create") {
      if (
        !isDocumentaryDemoId(
          body.previewId
        )
      ) {
        return response(
          {
            ok: false,

            error:
              "Invalid fictional preview.",
          },
          400
        );
      }

      const result =
        await createDocumentaryDraft(
          user.id,
          body.previewId
        );

      return response(
        {
          ok: true,
          ...result,
        },
        result.created ? 201 : 200
      );
    }

    if (
      body.action === "revision-requested" ||
      body.action === "demo-approved"
    ) {
      if (
        !validUuid(body.draftId) ||
        typeof body.version !== "number" ||
        !Number.isInteger(body.version) ||
        body.version < 1
      ) {
        return response(
          {
            ok: false,

            error:
              "Invalid draft ID or version.",
          },
          400
        );
      }

      if (
        body.notes !== undefined &&
        typeof body.notes !== "string"
      ) {
        return response(
          {
            ok: false,

            error:
              "Invalid revision notes.",
          },
          400
        );
      }

      const notes =
        typeof body.notes === "string"
          ? body.notes.trim()
          : "";

      if (
        body.action === "revision-requested" &&
        (
          notes.length === 0 ||
          notes.length > 3000
        )
      ) {
        return response(
          {
            ok: false,

            error:
              "Revision notes must contain 1–3000 characters.",
          },
          400
        );
      }

      if (
        body.action === "demo-approved" &&
        body.reviewed !== true
      ) {
        return response(
          {
            ok: false,

            error:
              "Confirm the script review before approval.",
          },
          400
        );
      }

      const result =
        await reviewDocumentaryDraft({
          ownerId: user.id,

          draftId: body.draftId,

          version: body.version,

          action: body.action,

          notes,

          reviewed:
            body.reviewed === true,
        });

      return response({
        ok: true,
        ...result,
      });
    }

    return response(
      {
        ok: false,
        error: "Unsupported action.",
      },
      400
    );

  } catch (error) {
    console.error(
      "Documentary action failed:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    return response(
      {
        ok: false,

        error:
          "Documentary action could not be completed. Refresh and try again.",
      },
      500
    );
  }
}