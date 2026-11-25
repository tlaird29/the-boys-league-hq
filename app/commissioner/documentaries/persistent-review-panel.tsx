"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  loadDemoReviews,
  submitDemoAction,
  type DemoReviewData,
  type DemoAction,
} from "../../../lib/documentary-review-client";

type PreviewId =
  | "dominant"
  | "comeback";

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

function formatStatus(value: string) {
  return value
    .replace(/-/g, " ")
    .toUpperCase();
}

export default function PersistentReviewPanel() {
  const [data, setData] =
    useState<DemoReviewData>({
      drafts: [],
      history: [],
    });

  const [selected, setSelected] =
    useState<PreviewId>("dominant");

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [reviewed, setReviewed] =
    useState(false);

  async function refresh() {
    const result =
      await loadDemoReviews();

    setData(result);
  }

  useEffect(() => {
    let active = true;

    loadDemoReviews()
      .then(result => {
        if (active) {
          setData(result);
        }
      })
      .catch(error => {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load drafts."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const draft = data.drafts
    .filter(
      item =>
        item.preview_id === selected
    )
    .sort(
      (a, b) => b.version - a.version
    )[0];

  const history = data.history
    .filter(item =>
      data.drafts.some(
        saved =>
          saved.id === item.draft_id &&
          saved.preview_id === selected
      )
    );

  const canReview =
    draft?.status === "awaiting-review";

  function changePreview(id: PreviewId) {
    setSelected(id);
    setNotes("");
    setReviewed(false);
    setMessage("");
    setError("");
  }

  async function execute(
    action: DemoAction
  ) {
    if (busy) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const saved =
        await submitDemoAction(action);

      setData(previous => ({
        ...previous,

        drafts: [
          saved,
          ...previous.drafts.filter(
            item => item.id !== saved.id
          ),
        ],
      }));

      setReviewed(false);
      setNotes("");

      setMessage(
        action.action === "create"
          ? "Documentary draft saved."
          : action.action === "demo-approved"
            ? "Demo approval saved permanently."
            : "Revision request saved."
      );

      try {
        await refresh();
      } catch {
        setError(
          "Action saved, but history could not refresh."
        );
      }

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Documentary action failed."
      );

    } finally {
      setBusy(false);
    }
  }

  const panelStyle = {
    background: "#10251e",
    border: "1px solid #315747",
    borderRadius: 12,
    padding: 22,
    marginTop: 24,
    color: "#edf7f1",
  };

  const buttonStyle = {
    background: "#173d30",
    border: "1px solid #48d6a8",
    borderRadius: 7,
    padding: "10px 16px",
    color: "#edf7f1",
    cursor: "pointer",
    fontWeight: 700,
  };

  return (
    <section style={panelStyle}>

      <div
        style={{
          color: "#48d6a8",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 2,
        }}
      >
        COMMISSIONER CONTROL
      </div>

      <h2>
        PERSISTENT DOCUMENTARY REVIEW
      </h2>

      <p style={{ opacity: 0.75 }}>
        Save fictional documentary drafts,
        approve scripts and record revision
        requests in the database.
        No video production or publication
        is authorized.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {(
          [
            "dominant",
            "comeback",
          ] as const
        ).map(id => (
          <button
            key={id}
            type="button"
            disabled={busy}
            onClick={() =>
              changePreview(id)
            }
            style={{
              ...buttonStyle,
              background:
                selected === id
                  ? "#197655"
                  : "#173d30",
            }}
          >
            {id === "dominant"
              ? "Dominant Champion"
              : "Championship Comeback"}
          </button>
        ))}
      </div>

      {loading && (
        <p>Loading saved drafts...</p>
      )}

      {error && (
        <p
          role="alert"
          style={{ color: "#ffaaaa" }}
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          style={{ color: "#48d6a8" }}
        >
          {message}
        </p>
      )}

      {!loading && !draft && (
        <div>
          <p>
            No saved draft for this preview.
          </p>

          <button
            type="button"
            style={buttonStyle}
            disabled={busy}
            onClick={() =>
              execute({
                action: "create",
                previewId: selected,
              })
            }
          >
            {busy
              ? "SAVING..."
              : "CREATE SAVED DRAFT"}
          </button>
        </div>
      )}

      {draft && (
        <>
          <div
            style={{
              borderTop:
                "1px solid #315747",
              paddingTop: 20,
            }}
          >
            <div
              style={{
                color: "#48d6a8",
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              VERSION {draft.version}
              {" • "}
              {formatStatus(draft.status)}
            </div>

            <h2>{draft.script.title}</h2>

            <p>{draft.script.subtitle}</p>

            <p style={{ opacity: 0.65 }}>
              Saved:{" "}
              {formatDate(draft.created_at)}
            </p>

            {draft.approved_at && (
              <p
                style={{
                  color: "#48d6a8",
                }}
              >
                Approved:{" "}
                {formatDate(
                  draft.approved_at
                )}
              </p>
            )}
          </div>

          <h3>SAVED SCRIPT</h3>

          {draft.script.scenes.map(
            (scene, index) => (
              <article
                key={scene.id}
                style={{
                  background: "#0b1b15",
                  border:
                    "1px solid #315747",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#48d6a8",
                  }}
                >
                  SCENE {index + 1}
                  {" • "}
                  {scene.durationSeconds}s
                </div>

                <h3>{scene.headline}</h3>

                <p
                  style={{
                    lineHeight: 1.7,
                  }}
                >
                  {scene.narration}
                </p>

                <details>
                  <summary>
                    Production direction
                  </summary>

                  <p>
                    Graphic: {scene.graphic}
                  </p>

                  <p>
                    Transition:{" "}
                    {scene.transition}
                  </p>

                  <p>
                    {scene.visualDirection}
                  </p>

                  <p>
                    Evidence:{" "}
                    {scene.evidenceIds.join(
                      ", "
                    )}
                  </p>
                </details>
              </article>
            )
          )}

          {canReview && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop:
                  "1px solid #315747",
              }}
            >
              <h3>COMMISSIONER DECISION</h3>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <input
                  type="checkbox"
                  checked={reviewed}
                  disabled={busy}
                  onChange={event =>
                    setReviewed(
                      event.target.checked
                    )
                  }
                />

                <span>
                  I have reviewed the saved
                  fictional script displayed
                  above.
                </span>
              </label>

              <textarea
                value={notes}
                disabled={busy}
                maxLength={3000}
                rows={5}
                placeholder={
                  "Describe requested changes..."
                }
                onChange={event =>
                  setNotes(
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "#0b1b15",
                  border:
                    "1px solid #315747",
                  borderRadius: 8,
                  color: "#edf7f1",
                  padding: 12,
                  resize: "vertical",
                }}
              />

              <p
                style={{
                  fontSize: 12,
                  opacity: 0.65,
                }}
              >
                {notes.length}/3000 characters
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  disabled={
                    busy || !reviewed
                  }
                  style={{
                    ...buttonStyle,
                    background: "#197655",
                    opacity:
                      busy || !reviewed
                        ? 0.45
                        : 1,
                  }}
                  onClick={() =>
                    execute({
                      action: "demo-approved",
                      draftId: draft.id,
                      version: draft.version,
                      reviewed: true,
                    })
                  }
                >
                  APPROVE DEMO SCRIPT
                </button>

                <button
                  type="button"
                  disabled={
                    busy ||
                    !notes.trim()
                  }
                  style={{
                    ...buttonStyle,
                    borderColor: "#c9a64b",
                    color: "#e9c875",
                    opacity:
                      busy ||
                      !notes.trim()
                        ? 0.45
                        : 1,
                  }}
                  onClick={() =>
                    execute({
                      action:
                        "revision-requested",
                      draftId: draft.id,
                      version: draft.version,
                      notes: notes.trim(),
                      reviewed: false,
                    })
                  }
                >
                  REQUEST REVISION
                </button>
              </div>
            </div>
          )}

          {!canReview && (
            <div
              style={{
                border:
                  "1px solid #315747",
                borderRadius: 8,
                padding: 16,
                marginTop: 20,
              }}
            >
              <strong>
                {formatStatus(draft.status)}
              </strong>

              <p>
                This version is locked
                against additional review
                actions.
              </p>

              {draft.revision_notes && (
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {draft.revision_notes}
                </p>
              )}

              <p style={{ opacity: 0.7 }}>
                New script versions will be
                supported in the next batch.
              </p>
            </div>
          )}
        </>
      )}

      <div
        style={{
          borderTop: "1px solid #315747",
          marginTop: 28,
          paddingTop: 18,
        }}
      >
        <h3>REVIEW HISTORY</h3>

        {history.length === 0 && (
          <p style={{ opacity: 0.65 }}>
            No saved review activity.
          </p>
        )}

        {history.map(item => (
          <div
            key={item.id}
            style={{
              padding: "12px 0",
              borderBottom:
                "1px solid #315747",
            }}
          >
            <strong>
              {formatStatus(item.action)}
            </strong>

            <div
              style={{
                fontSize: 12,
                opacity: 0.65,
                marginTop: 5,
              }}
            >
              {formatDate(item.created_at)}
            </div>

            {item.notes && (
              <p
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        style={{
          ...buttonStyle,
          marginTop: 18,
        }}
        disabled={busy || loading}
        onClick={async () => {
          setBusy(true);
          setError("");
          setReviewed(false);

          try {
            await refresh();
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "Refresh failed."
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        REFRESH SAVED REVIEWS
      </button>

    </section>
  );
}