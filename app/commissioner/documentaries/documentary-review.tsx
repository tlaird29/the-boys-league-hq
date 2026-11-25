"use client";

import {
  useState,
} from "react";

import type {
  buildCompleteDocumentaryBrief,
} from "../../../lib/documentary-complete-brief";

import type {
  DocumentaryScriptReview,
} from "../../../lib/documentary-script-types";

type DocumentaryBrief = NonNullable<
  ReturnType<
    typeof buildCompleteDocumentaryBrief
  >["brief"]
>;

type DocumentaryPreview = {
  id: string;
  label: string;
  brief: DocumentaryBrief | null;
  review: DocumentaryScriptReview | null;
  issues: string[];
  warnings: string[];
};

type Props = {
  previews: DocumentaryPreview[];
};

const SCENE_COLORS = [
  "#48d6a8",
  "#c9a64b",
  "#7da995",
  "#197655",
  "#a9c2b6",
  "#e9c875",
  "#458a71",
  "#85bda7",
  "#b78e42",
  "#48d6a8",
];

function formatTime(seconds: number) {
  const minutes =
    Math.floor(seconds / 60);

  const remainder =
    Math.floor(seconds % 60);

  return (
    `${minutes}:` +
    String(remainder).padStart(2, "0")
  );
}

function formatLabel(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, letter =>
      letter.toUpperCase()
    );
}

export default function DocumentaryReview({
  previews,
}: Props) {
  const [selectedId, setSelectedId] =
    useState(previews[0]?.id ?? "");

  const [selectedScene, setSelectedScene] =
    useState(0);

  const [notes, setNotes] =
    useState("");

  const [reviewed, setReviewed] =
    useState(false);

  const [status, setStatus] =
    useState<
      "review" |
      "revision-requested" |
      "demo-approved"
    >("review");

  const [submittedNotes, setSubmittedNotes] =
    useState("");

  const preview =
    previews.find(
      item => item.id === selectedId
    );

  const brief =
    preview?.brief;

  const review =
    preview?.review;

  const activeScene =
    review?.timeline[selectedScene];

  const allEvidence = brief
    ? [
        ...brief.selectedEvidence,
        ...brief.additionalEvidence,
      ]
    : [];

  function resetReview() {
    setSelectedScene(0);
    setNotes("");
    setReviewed(false);
    setStatus("review");
    setSubmittedNotes("");
  }

  function changePreview(id: string) {
    setSelectedId(id);
    resetReview();
  }

  function requestRevision() {
    if (!notes.trim() || !review) {
      return;
    }

    setSubmittedNotes(notes.trim());
    setStatus("revision-requested");
    setReviewed(false);
  }

  function approveDemo() {
    if (
      !reviewed ||
      !review ||
      status !== "review"
    ) {
      return;
    }

    setStatus("demo-approved");
  }

  return (
    <div className="documentary-hq">

      <section className="demo-notice">
        <strong>
          FICTIONAL PREVIEW MODE
        </strong>

        <p>
          These are demonstration seasons,
          not actual league results.
          AI generation, permanent approvals,
          audio production and publication
          are disabled.
        </p>
      </section>

      <div className="preview-selector">
        {previews.map(item => (
          <button
            key={item.id}
            type="button"
            className={
              selectedId === item.id
                ? "selector active"
                : "selector"
            }
            onClick={() =>
              changePreview(item.id)
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {!preview && (
        <section className="panel">
          No documentary previews available.
        </section>
      )}

      {preview && preview.issues.length > 0 && (
        <section className="panel issue-panel">
          <div className="eyebrow">
            VALIDATION ISSUES
          </div>

          <h2>Preview requires correction</h2>

          {preview.issues.map(
            (issue, index) => (
              <p key={index}>{issue}</p>
            )
          )}
        </section>
      )}

      {brief && (
        <>
          <section className="documentary-hero">
            <div className="eyebrow">
              THE BOYS ORIGINAL
              {" • "}
              FICTIONAL SEASON
            </div>

            <h2>
              {review?.script.title ??
                brief.proposedTitle ??
                "UNTITLED DOCUMENTARY"}
            </h2>

            <p>
              {review?.script.subtitle ??
                brief.centralStory.headline}
            </p>

            <div className="hero-footer">
              <span>
                1080P • 30 FPS
              </span>

              <span>
                NOT PUBLISHED
              </span>
            </div>
          </section>

          <div className="metrics">
            <div className="metric">
              <span>Duration</span>
              <strong>
                {review
                  ? formatTime(
                      review.totalSeconds
                    )
                  : "2:00"}
              </strong>
            </div>

            <div className="metric">
              <span>Scenes</span>
              <strong>
                {review?.timeline.length ??
                  "—"}
              </strong>
            </div>

            <div className="metric">
              <span>Spoken words</span>
              <strong>
                {review?.totalWords ??
                  "—"}
              </strong>
            </div>

            <div className="metric">
              <span>Available evidence</span>
              <strong>
                {allEvidence.length}
              </strong>
            </div>
          </div>

          <section className="panel">
            <div className="eyebrow">
              THE DEFINING STORY
            </div>

            <h2>
              {brief.centralStory.headline}
            </h2>

            <p>
              {brief.centralStory.fact}
            </p>

            <div className="tag">
              {formatLabel(
                brief.centralStory.type
              )}
            </div>
          </section>

          {review && (
            <>
              <section className="panel">
                <div className="eyebrow">
                  PRODUCTION TIMELINE
                </div>

                <h2>Scene-by-scene storyboard</h2>

                <div className="timeline">
                  {review.timeline.map(
                    (scene, index) => (
                      <button
                        key={scene.id}
                        type="button"
                        title={scene.headline}
                        aria-label={
                          `Select scene ${index + 1}`
                        }
                        aria-pressed={
                          selectedScene === index
                        }
                        className={
                          selectedScene === index
                            ? "timeline-segment selected"
                            : "timeline-segment"
                        }
                        style={{
                          flex:
                            scene.durationSeconds,
                          background:
                            SCENE_COLORS[
                              index %
                              SCENE_COLORS.length
                            ],
                        }}
                        onClick={() =>
                          setSelectedScene(index)
                        }
                      >
                        {index + 1}
                      </button>
                    )
                  )}
                </div>

                <div className="timeline-labels">
                  <span>0:00</span>
                  <span>1:00</span>
                  <span>2:00</span>
                </div>

                <div className="storyboard">
                  <div className="scene-list">
                    {review.timeline.map(
                      (scene, index) => (
                        <button
                          type="button"
                          key={scene.id}
                          className={
                            selectedScene === index
                              ? "scene-item active"
                              : "scene-item"
                          }
                          onClick={() =>
                            setSelectedScene(index)
                          }
                        >
                          <span className="scene-number">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>

                          <span>
                            <strong>
                              {scene.headline}
                            </strong>

                            <small>
                              {formatTime(
                                scene.startSeconds
                              )}
                              {" – "}
                              {formatTime(
                                scene.endSeconds
                              )}
                            </small>
                          </span>
                        </button>
                      )
                    )}
                  </div>

                  {activeScene && (
                    <div className="scene-detail">
                      <div className="scene-screen">
                        <div className="eyebrow">
                          SCENE {selectedScene + 1}
                          {" • "}
                          CONCEPT PREVIEW
                        </div>

                        <h3>
                          {activeScene.headline}
                        </h3>

                        <span>
                          {formatLabel(
                            activeScene.graphic
                          )}
                        </span>
                      </div>

                      <div className="scene-meta">
                        <span>
                          {activeScene.durationSeconds}s
                        </span>

                        <span>
                          {activeScene.narrationWords}
                          {" words"}
                        </span>

                        <span>
                          {activeScene.estimatedWordsPerMinute}
                          {" WPM"}
                        </span>
                      </div>

                      <h3>Spoken narration</h3>

                      <p className="narration">
                        {activeScene.narration}
                      </p>

                      <h3>Visual direction</h3>

                      <p>
                        {activeScene.visualDirection}
                      </p>

                      <p className="muted-text">
                        Transition:{" "}
                        {formatLabel(
                          activeScene.transition
                        )}
                      </p>

                      <h3>Supporting evidence</h3>

                      {activeScene.evidenceIds.map(
                        id => {
                          const evidence =
                            allEvidence.find(
                              item =>
                                item.id === id
                            );

                          return (
                            <div
                              className="evidence"
                              key={id}
                            >
                              <strong>
                                {evidence?.headline ??
                                  id}
                              </strong>

                              <p>
                                {evidence?.fact ??
                                  "Evidence unavailable."}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </section>

              <section className="panel">
                <div className="eyebrow">
                  COMPLETE SCRIPT
                </div>

                <h2>Full documentary narration</h2>

                <p className="muted-text">
                  This is the continuous spoken
                  script. Scene headlines and
                  production directions are not
                  included in the narration.
                </p>

                <div className="full-script">
                  {review.script.scenes.map(
                    scene => (
                      <p key={scene.id}>
                        {scene.narration}
                      </p>
                    )
                  )}
                </div>
              </section>
            </>
          )}

          <section className="panel">
            <div className="eyebrow">
              DOCUMENTARY INTELLIGENCE
            </div>

            <h2>Selected storylines</h2>

            <div className="evidence-grid">
              {brief.selectedEvidence.map(
                item => (
                  <div
                    className="evidence"
                    key={item.id}
                  >
                    <div className="tag">
                      {formatLabel(item.type)}
                    </div>

                    <h3>{item.headline}</h3>

                    <p>{item.fact}</p>
                  </div>
                )
              )}
            </div>

            <details className="details">
              <summary>
                Additional available evidence
                {" ("}
                {brief.additionalEvidence.length}
                {")"}
              </summary>

              {brief.additionalEvidence.map(
                item => (
                  <div
                    className="evidence"
                    key={item.id}
                  >
                    <strong>
                      {item.headline}
                    </strong>

                    <p>{item.fact}</p>
                  </div>
                )
              )}
            </details>
          </section>

          <section className="panel">
            <div className="eyebrow">
              DATA COVERAGE
            </div>

            <h2>Evidence availability</h2>

            <div className="coverage-grid">
              {Object.entries(
                brief.coverage
              ).map(([name, available]) => (
                <div
                  className="coverage-item"
                  key={name}
                >
                  <span>
                    {formatLabel(name)}
                  </span>

                  <strong
                    style={{
                      color: available
                        ? "#48d6a8"
                        : "#e9c875",
                    }}
                  >
                    {available
                      ? "Demo verified"
                      : "Not supplied"}
                  </strong>
                </div>
              ))}
            </div>

            {preview?.warnings.map(
              (warning, index) => (
                <p
                  key={index}
                  className="warning"
                >
                  {warning}
                </p>
              )
            )}
          </section>

          <section className="panel">
            <div className="eyebrow">
              COMMISSIONER REVIEW
            </div>

            <h2>Approve or request changes</h2>

            <p className="muted-text">
              This demonstration does not save
              approvals or submit revision
              requests to an AI service.
            </p>

            <label
              className="field-label"
              htmlFor="documentary-notes"
            >
              Revision instructions
            </label>

            <textarea
              id="documentary-notes"
              rows={5}
              maxLength={3000}
              value={notes}
              disabled={
                status !== "review"
              }
              onChange={event =>
                setNotes(event.target.value)
              }
              placeholder={
                "Change the opening, add more trash talk, highlight a playoff matchup..."
              }
            />

            <div className="character-count">
              {notes.length}/3000
            </div>

            <label className="review-checkbox">
              <input
                type="checkbox"
                checked={reviewed}
                disabled={
                  !review ||
                  status !== "review"
                }
                onChange={event =>
                  setReviewed(
                    event.target.checked
                  )
                }
              />

              <span>
                I have reviewed the fictional
                narration, supporting evidence
                and production timeline.
              </span>
            </label>

            <div className="review-actions">
              <button
                type="button"
                className="action secondary"
                disabled={
                  !review ||
                  !notes.trim() ||
                  status !== "review"
                }
                onClick={requestRevision}
              >
                REQUEST REVISION
              </button>

              <button
                type="button"
                className="action primary"
                disabled={
                  !review ||
                  !reviewed ||
                  status !== "review"
                }
                onClick={approveDemo}
              >
                APPROVE DEMO SCRIPT
              </button>
            </div>

            {status === "revision-requested" && (
              <div className="status-message">
                <strong>
                  Demo revision recorded
                </strong>

                <p>{submittedNotes}</p>

                <small>
                  No AI request was submitted.
                  These notes are temporary.
                </small>
              </div>
            )}

            {status === "demo-approved" && (
              <div className="status-message">
                <strong>
                  Demo approval complete
                </strong>

                <p>
                  The review interaction is
                  complete. No audio, rendering
                  or publication has started.
                </p>
              </div>
            )}

            {status !== "review" && (
              <button
                type="button"
                className="action secondary"
                style={{ marginTop: 16 }}
                onClick={resetReview}
              >
                RESET DEMO REVIEW
              </button>
            )}
          </section>
        </>
      )}

      <style jsx>{`
        .documentary-hq {
          margin-top: 24px;
          display: grid;
          gap: 20px;
          color: #f4f0e4;
        }

        .demo-notice {
          padding: 18px;
          border: 1px solid #8a753e;
          border-radius: 12px;
          background: #29271b;
          color: #e9c875;
        }

        .demo-notice p {
          margin: 8px 0 0;
          line-height: 1.6;
        }

        .preview-selector {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .selector,
        .action {
          border: 1px solid #476055;
          background: #20382e;
          color: #f4f0e4;
          border-radius: 8px;
          padding: 12px 18px;
          font-weight: 800;
          cursor: pointer;
        }

        .selector.active {
          background: #48d6a8;
          border-color: #48d6a8;
          color: #091711;
        }

        .documentary-hero {
          min-height: 240px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(24px, 5vw, 55px);
          border: 1px solid #476055;
          border-radius: 14px;
          background:
            linear-gradient(
              125deg,
              #091711 25%,
              #20382e 75%,
              #197655
            );
        }

        .documentary-hero h2 {
          font-size: clamp(36px, 6vw, 76px);
          line-height: 1;
          letter-spacing: -2px;
          margin: 22px 0 12px;
          color: #f4f0e4;
          font-weight: 950;
        }

        .documentary-hero p {
          color: #a9c2b6;
          font-size: 17px;
        }

        .eyebrow {
          color: #48d6a8;
          font-size: 11px;
          letter-spacing: 2px;
          font-weight: 900;
        }

        .hero-footer {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 10px;
          margin-top: 28px;
          font-size: 11px;
          font-weight: 800;
          color: #a9c2b6;
        }

        .metrics {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .metric,
        .panel {
          background: #14251f;
          border: 1px solid #476055;
          border-radius: 12px;
          padding: 22px;
          min-width: 0;
        }

        .metric {
          display: grid;
          gap: 8px;
        }

        .metric span {
          font-size: 12px;
          color: #a9c2b6;
        }

        .metric strong {
          font-size: 32px;
          color: #48d6a8;
          font-weight: 900;
        }

        .panel h2 {
          margin: 12px 0 16px;
          color: #f4f0e4;
        }

        .panel h3 {
          color: #f4f0e4;
          margin: 16px 0 8px;
        }

        .panel p {
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .tag {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 5px;
          background: #20382e;
          color: #48d6a8;
          font-size: 11px;
          font-weight: 800;
        }

        .timeline {
          display: flex;
          gap: 4px;
          height: 36px;
          margin-top: 22px;
        }

        .timeline-segment {
          border: 2px solid transparent;
          border-radius: 4px;
          color: #091711;
          font-weight: 900;
          cursor: pointer;
          min-width: 0;
        }

        .timeline-segment.selected {
          border-color: #ffffff;
        }

        .timeline-labels {
          display: flex;
          justify-content: space-between;
          margin: 8px 0 22px;
          color: #a9c2b6;
          font-size: 12px;
        }

        .storyboard {
          display: grid;
          grid-template-columns:
            minmax(180px, 1fr)
            minmax(0, 2fr);
          gap: 20px;
        }

        .scene-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .scene-item {
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          background: #20382e;
          color: #f4f0e4;
          border: 1px solid #476055;
          border-radius: 8px;
          padding: 14px;
          cursor: pointer;
        }

        .scene-item.active {
          border-color: #48d6a8;
          background: #264b3c;
        }

        .scene-item strong {
          display: block;
          font-size: 13px;
        }

        .scene-item small {
          display: block;
          margin-top: 5px;
          color: #a9c2b6;
        }

        .scene-number {
          color: #48d6a8;
          font-size: 21px;
          font-weight: 900;
        }

        .scene-detail {
          min-width: 0;
        }

        .scene-screen {
          aspect-ratio: 16 / 9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
          border-radius: 10px;
          background:
            linear-gradient(
              145deg,
              #091711,
              #20382e
            );
          border: 1px solid #476055;
        }

        .scene-screen h3 {
          font-size: clamp(22px, 4vw, 40px);
          text-transform: uppercase;
          margin: 18px 0;
        }

        .scene-screen span {
          color: #a9c2b6;
          font-size: 12px;
        }

        .scene-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin: 14px 0;
        }

        .scene-meta span {
          background: #20382e;
          border-radius: 5px;
          padding: 6px 10px;
          font-size: 12px;
          color: #a9c2b6;
        }

        .narration,
        .full-script {
          font-family: Georgia, serif;
          font-size: 17px;
          line-height: 1.85;
        }

        .full-script {
          background: #f4f0e4;
          color: #14251f;
          border-radius: 8px;
          padding: clamp(20px, 4vw, 40px);
        }

        .full-script p {
          margin: 0 0 20px;
          line-height: 1.85;
        }

        .full-script p:last-child {
          margin-bottom: 0;
        }

        .evidence-grid,
        .coverage-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .evidence {
          padding: 16px;
          border: 1px solid #476055;
          background: #20382e;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .evidence p {
          font-size: 13px;
          color: #d0ded6;
          margin-bottom: 0;
        }

        .details {
          margin-top: 20px;
        }

        .details summary {
          cursor: pointer;
          color: #48d6a8;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .coverage-item {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px;
          background: #20382e;
          border-radius: 8px;
          font-size: 13px;
        }

        .muted-text {
          color: #a9c2b6;
          font-size: 13px;
        }

        .warning {
          color: #e9c875;
          font-size: 13px;
        }

        .issue-panel {
          border-color: #a65d59;
        }

        .field-label {
          display: block;
          margin: 20px 0 10px;
          font-weight: 800;
        }

        textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 14px;
          border: 1px solid #476055;
          border-radius: 8px;
          background: #091711;
          color: #f4f0e4;
          font: inherit;
          resize: vertical;
        }

        .character-count {
          text-align: right;
          font-size: 11px;
          color: #a9c2b6;
          margin-top: 5px;
        }

        .review-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 20px 0;
          line-height: 1.6;
        }

        .review-checkbox input {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          accent-color: #48d6a8;
        }

        .review-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .action.primary {
          background: #48d6a8;
          color: #091711;
          border-color: #48d6a8;
        }

        .action:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .status-message {
          background: #20382e;
          border: 1px solid #476055;
          padding: 18px;
          margin-top: 20px;
          border-radius: 8px;
          overflow-wrap: anywhere;
        }

        @media (max-width: 760px) {
          .metrics {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .storyboard,
          .evidence-grid,
          .coverage-grid {
            grid-template-columns: 1fr;
          }

          .panel {
            padding: 16px;
          }

          .review-actions .action {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}