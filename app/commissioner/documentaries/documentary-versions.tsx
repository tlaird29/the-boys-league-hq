"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  loadDemoReviews,
  type DemoReviewData,
  type DemoDraft,
} from "../../../lib/documentary-review-client";

const buttonStyle = {
  background: "#173d30",
  border: "1px solid #48d6a8",
  borderRadius: 7,
  padding: "10px 16px",
  color: "#edf7f1",
  fontWeight: 700,
  cursor: "pointer",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString(
    "en-US",
    {
      timeZone: "America/Boise",
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

export default function DocumentaryVersions() {
  const [data, setData] =
    useState<DemoReviewData>({
      drafts: [],
      history: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      setData(
        await loadDemoReviews()
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load versions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function revise(
    draft: DemoDraft
  ) {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch(
        "/api/commissioner/documentaries/revise",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            draftId: draft.id,
            version: draft.version,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        result.ok !== true
      ) {
        throw new Error(
          result.error ||
          "Revision failed."
        );
      }

      window.location.reload();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Revision failed."
      );

      setBusy(false);
    }
  }

  return (
    <section
      style={{
        background: "#10251e",
        border: "1px solid #315747",
        borderRadius: 12,
        padding: 22,
        marginTop: 24,
        color: "#edf7f1",
      }}
    >
      <div
        style={{
          color: "#48d6a8",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 2,
        }}
      >
        EDITORIAL CONTROL
      </div>

      <h2>SCRIPT VERSION HISTORY</h2>

      <p style={{ opacity: 0.75 }}>
        Previous scripts remain preserved.
        New editorial cuts require fresh
        commissioner approval.
      </p>

      <p style={{ opacity: 0.75 }}>
        Fictional demonstration only.
        Revision notes are retained, but
        AI-directed rewriting is disabled.
        Demo revisions change editorial
        presentation, not the narration.
      </p>

      <button
        type="button"
        style={buttonStyle}
        disabled={busy || loading}
        onClick={() => void refresh()}
      >
        REFRESH VERSION HISTORY
      </button>

      {loading && (
        <p>Loading script versions...</p>
      )}

      {error && (
        <p
          role="alert"
          style={{ color: "#ffaaaa" }}
        >
          {error}
        </p>
      )}

      {(
        [
          "dominant",
          "comeback",
        ] as const
      ).map(previewId => {
        const versions = data.drafts
          .filter(
            item =>
              item.preview_id === previewId
          )
          .sort(
            (a, b) =>
              b.version - a.version
          );

        const latest = versions[0];

        return (
          <section
            key={previewId}
            style={{
              marginTop: 24,
              borderTop:
                "1px solid #315747",
              paddingTop: 18,
            }}
          >
            <h3>
              {previewId === "dominant"
                ? "DOMINANT CHAMPION"
                : "CHAMPIONSHIP COMEBACK"}
            </h3>

            {!latest && !loading && (
              <p style={{ opacity: 0.65 }}>
                No saved script versions.
              </p>
            )}

            {latest?.status ===
              "revision-requested" && (
              <div
                style={{
                  padding: 16,
                  background: "#0b1b15",
                  border:
                    "1px solid #c9a64b",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <strong
                  style={{
                    color: "#e9c875",
                  }}
                >
                  REVISION REQUESTED
                </strong>

                <p
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {latest.revision_notes}
                </p>

                <button
                  type="button"
                  style={buttonStyle}
                  disabled={busy || loading}
                  onClick={() =>
                    void revise(latest)
                  }
                >
                  {busy
                    ? "CREATING..."
                    : `CREATE DEMO VERSION ${latest.version + 1}`}
                </button>
              </div>
            )}

            {versions.map(draft => (
              <details
                key={draft.id}
                style={{
                  background: "#0b1b15",
                  border:
                    "1px solid #315747",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  VERSION {draft.version}
                  {" • "}
                  {draft.status
                    .replace(/-/g, " ")
                    .toUpperCase()}

                  {draft.id === latest?.id
                    ? " • CURRENT"
                    : " • ARCHIVED"}
                </summary>

                <h3>
                  {draft.script.title}
                </h3>

                <p>
                  {draft.script.subtitle}
                </p>

                <p
                  style={{
                    opacity: 0.65,
                    fontSize: 12,
                  }}
                >
                  Created:{" "}
                  {formatDate(
                    draft.created_at
                  )}
                </p>

                {draft.revision_notes && (
                  <div>
                    <strong>
                      Revision notes
                    </strong>

                    <p
                      style={{
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {draft.revision_notes}
                    </p>
                  </div>
                )}

                {draft.script.scenes.map(
                  (scene, index) => (
                    <article
                      key={scene.id}
                      style={{
                        borderTop:
                          "1px solid #315747",
                        paddingTop: 12,
                        marginTop: 12,
                      }}
                    >
                      <strong>
                        Scene {index + 1}
                        {" — "}
                        {scene.headline}
                      </strong>

                      <p
                        style={{
                          lineHeight: 1.7,
                        }}
                      >
                        {scene.narration}
                      </p>

                      <p
                        style={{
                          opacity: 0.7,
                        }}
                      >
                        {scene.visualDirection}
                      </p>
                    </article>
                  )
                )}

                <h4>VERSION ACTIVITY</h4>

                {data.history
                  .filter(
                    item =>
                      item.draft_id ===
                      draft.id
                  )
                  .map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: "8px 0",
                        borderTop:
                          "1px solid #315747",
                      }}
                    >
                      <strong>
                        {item.action
                          .replace(/-/g, " ")
                          .toUpperCase()}
                      </strong>

                      <p
                        style={{
                          fontSize: 12,
                          opacity: 0.65,
                        }}
                      >
                        {formatDate(
                          item.created_at
                        )}
                      </p>

                      {item.notes && (
                        <p>
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </details>
            ))}
          </section>
        );
      })}
    </section>
  );
}