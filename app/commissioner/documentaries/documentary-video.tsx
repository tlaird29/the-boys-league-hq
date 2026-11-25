"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  loadDemoReviews,
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

export default function DocumentaryVideo() {
  const [drafts, setDrafts] =
    useState<DemoDraft[]>([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [rendering, setRendering] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [videoUrl, setVideoUrl] =
    useState("");

  const [error, setError] =
    useState("");

  const [reviewed, setReviewed] =
    useState(false);

  const [approved, setApproved] =
    useState(false);

  const [renderedDraftId, setRenderedDraftId] =
    useState("");

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const recorderRef =
    useRef<MediaRecorder | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const frameRef = useRef(0);

  const urlRef = useRef("");

  const tokenRef = useRef(0);

  function clearVideo() {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = "";
    }

    setVideoUrl("");
    setReviewed(false);
    setApproved(false);
    setRenderedDraftId("");
    setProgress(0);
  }

  function releaseResources() {
    cancelAnimationFrame(frameRef.current);

    const recorder = recorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }

    streamRef.current
      ?.getTracks()
      .forEach(track => track.stop());

    recorderRef.current = null;
    streamRef.current = null;
  }

  async function refresh() {
    clearVideo();
    setLoading(true);
    setError("");

    try {
      const data = await loadDemoReviews();

      const latest = (
        ["dominant", "comeback"] as const
      ).map(id =>
        data.drafts
          .filter(
            draft => draft.preview_id === id
          )
          .sort(
            (a, b) => b.version - a.version
          )[0]
      );

      const available = latest.filter(
        (draft): draft is DemoDraft =>
          Boolean(
            draft &&
            draft.fictional === true &&
            draft.status === "demo-approved"
          )
      );

      setDrafts(available);

      setSelectedId(previous =>
        available.some(
          draft => draft.id === previous
        )
          ? previous
          : available[0]?.id ?? ""
      );

    } catch (error) {
      setDrafts([]);
      setSelectedId("");

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load approved scripts."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();

    return () => {
      tokenRef.current += 1;

      releaseResources();

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  const draft = drafts.find(
    item => item.id === selectedId
  );

  const duration =
    draft?.script.scenes.reduce(
      (sum, scene) =>
        sum + scene.durationSeconds,
      0
    ) ?? 0;

  function cancelRender() {
    tokenRef.current += 1;

    releaseResources();

    setRendering(false);
    setProgress(0);
    setError("Rendering canceled.");
  }

  async function renderVideo() {
    if (!draft || rendering) return;

    clearVideo();
    setError("");
    setRendering(true);

    const token = ++tokenRef.current;

    try {
      const latest =
        await loadDemoReviews();

      if (token !== tokenRef.current) {
        return;
      }

      const current = latest.drafts
        .filter(
          item =>
            item.preview_id ===
            draft.preview_id
        )
        .sort(
          (a, b) => b.version - a.version
        )[0];

      if (
        !current ||
        current.id !== draft.id ||
        current.status !== "demo-approved" ||
        current.fictional !== true
      ) {
        throw new Error(
          "Script approval is no longer current."
        );
      }

      const canvas = canvasRef.current;

      if (
        !canvas ||
        typeof MediaRecorder === "undefined" ||
        typeof canvas.captureStream !== "function"
      ) {
        throw new Error(
          "Video recording is unavailable in this browser."
        );
      }

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error(
          "Unable to initialize video canvas."
        );
      }

      const context = ctx;

      const mimeType = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ].find(type =>
        MediaRecorder.isTypeSupported(type)
      );

      if (!mimeType) {
        throw new Error(
          "WebM recording is not supported."
        );
      }

      let position = 0;

      const timeline =
        current.script.scenes.map(scene => {
          const start = position;

          position += scene.durationSeconds;

          return {
            ...scene,
            start,
            end: position,
          };
        });

      const total = position;

      if (
        total !== 120 ||
        timeline.length === 0
      ) {
        throw new Error(
          "Invalid documentary timeline."
        );
      }

      const stream =
        canvas.captureStream(30);

      streamRef.current = stream;

      const recorder = new MediaRecorder(
        stream,
        {
          mimeType,
          videoBitsPerSecond: 4000000,
        }
      );

      recorderRef.current = recorder;

      const chunks: Blob[] = [];

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onerror = () => {
        if (token !== tokenRef.current) {
          return;
        }

        tokenRef.current += 1;
        releaseResources();

        setRendering(false);
        setError("Video recording failed.");
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(
          track => track.stop()
        );

        if (token !== tokenRef.current) {
          return;
        }

        recorderRef.current = null;
        streamRef.current = null;

        const blob = new Blob(
          chunks,
          { type: mimeType }
        );

        if (!blob.size) {
          setRendering(false);
          setError("No video was produced.");
          return;
        }

        const url = URL.createObjectURL(blob);

        urlRef.current = url;

        setVideoUrl(url);
        setRenderedDraftId(current.id);
        setRendering(false);
        setProgress(100);
      };

      function draw(seconds: number) {
        const scene =
          timeline.find(
            item =>
              seconds >= item.start &&
              seconds < item.end
          ) ??
          timeline[timeline.length - 1];

        const width = canvas!.width;
        const height = canvas!.height;

        const gradient =
          context.createLinearGradient(
            0, 0, width, height
          );

        gradient.addColorStop(
          0, "#07130e"
        );

        gradient.addColorStop(
          0.55, "#174d39"
        );

        gradient.addColorStop(
          1, "#050a08"
        );

        context.fillStyle = gradient;

        context.fillRect(
          0, 0, width, height
        );

        context.save();

        context.globalAlpha = 0.12;
        context.strokeStyle = "#48d6a8";
        context.lineWidth = 3;

        const offset =
          (seconds * 35) % 100;

        for (
          let x = -height;
          x < width + height;
          x += 100
        ) {
          context.beginPath();

          context.moveTo(
            x + offset, 0
          );

          context.lineTo(
            x + height + offset,
            height
          );

          context.stroke();
        }

        context.restore();

        context.fillStyle = "#07130e";

        context.fillRect(
          0, 0, width, 100
        );

        context.fillStyle = "#48d6a8";

        context.textAlign = "left";

        context.font =
          "bold 32px Arial";

        context.fillText(
          "THE BOYS ORIGINALS",
          65, 63
        );

        context.textAlign = "right";

        context.fillText(
          "FICTIONAL DEMONSTRATION",
          width - 65, 63
        );

        const sceneElapsed =
          seconds - scene.start;

        const entrance =
          Math.min(
            1,
            Math.max(
              0.15,
              sceneElapsed / 1.5
            )
          );

        context.save();

        context.globalAlpha = entrance;

        context.textAlign = "center";

        if (
          scene.graphic === "closing-logo"
        ) {
          context.fillStyle = "#48d6a8";

          context.font =
            "bold 145px Arial";

          context.fillText(
            "THE BOYS",
            width / 2, 440
          );

          context.fillStyle = "#ffffff";

          context.font =
            "bold 90px Arial";

          context.fillText(
            "ICE TF UP!",
            width / 2, 590
          );

        } else {
          context.fillStyle = "#48d6a8";

          context.font =
            "bold 34px Arial";

          context.fillText(
            scene.graphic
              .replace(/-/g, " ")
              .toUpperCase(),
            width / 2,
            280,
            width - 160
          );

          context.fillStyle = "#ffffff";

          let fontSize = 110;

          context.font =
            `bold ${fontSize}px Arial`;

          while (
            context.measureText(
              scene.headline
            ).width > width - 180 &&
            fontSize > 30
          ) {
            fontSize -= 2;

            context.font =
              `bold ${fontSize}px Arial`;
          }

          context.fillText(
            scene.headline,
            width / 2,
            470,
            width - 160
          );

          context.fillStyle = "#b4c8bf";

          context.font =
            "bold 36px Arial";

          context.fillText(
            current.script.title,
            width / 2,
            590,
            width - 160
          );
        }

        context.restore();

        context.fillStyle = "#07130e";

        context.fillRect(
          0, 790, width, 290
        );

        context.fillStyle = "#48d6a8";

        context.textAlign = "left";

        context.font =
          "bold 30px Arial";

        context.fillText(
          `SCENE ${timeline.indexOf(scene) + 1} OF ${timeline.length}`,
          65, 850
        );

        context.fillStyle = "#ffffff";

        context.font =
          "bold 48px Arial";

        context.fillText(
          scene.headline,
          65, 930,
          width - 130
        );

        context.fillStyle = "#b4c8bf";

        context.font = "24px Arial";

        context.fillText(
          "SILENT PRODUCTION TEST • NOT FOR PUBLICATION",
          65, 1000
        );

        context.fillStyle = "#48d6a8";

        context.fillRect(
          0,
          height - 12,
          width * seconds / total,
          12
        );
      }

      draw(0);

      recorder.start(1000);

      const started = performance.now();

      function tick(now: number) {
        if (token !== tokenRef.current) {
          return;
        }

        const seconds = Math.min(
          total,
          (now - started) / 1000
        );

        draw(seconds);

        setProgress(
          Math.floor(seconds / total * 100)
        );

        if (seconds >= total) {
          if (
            recorder.state !== "inactive"
          ) {
            recorder.stop();
          }

          return;
        }

        frameRef.current =
          requestAnimationFrame(tick);
      }

      frameRef.current =
        requestAnimationFrame(tick);

    } catch (error) {
      tokenRef.current += 1;

      releaseResources();

      setRendering(false);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to render video."
      );
    }
  }

  function downloadVideo() {
    if (!videoUrl || !draft) return;

    const link =
      document.createElement("a");

    link.href = videoUrl;

    link.download =
      `the-boys-${draft.preview_id}-v${draft.version}-demo.webm`;

    link.click();
  }

  function downloadReview() {
    if (
      !draft ||
      !approved ||
      renderedDraftId !== draft.id
    ) {
      return;
    }

    const review = {
      draftId: draft.id,
      previewId: draft.preview_id,
      version: draft.version,
      season: draft.season,
      title: draft.script.title,
      fictional: true,
      videoFormat: "webm",
      targetDurationSeconds: duration,
      audioIncluded: false,
      reviewStatus:
        "local-demo-video-approved",
      reviewedAt:
        new Date().toISOString(),
      persistentApproval: false,
      readyForPublication: false,
    };

    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify(review, null, 2)],
        { type: "application/json" }
      )
    );

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `documentary-${draft.preview_id}-v${draft.version}-video-review.json`;

    link.click();

    setTimeout(
      () => URL.revokeObjectURL(url),
      1000
    );
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
        THE BOYS • FINAL PRODUCTION
      </div>

      <h2>VIDEO PRODUCTION STUDIO</h2>

      <p style={{ opacity: 0.75 }}>
        Render a silent fictional documentary
        demonstration directly in your browser.
        This is a local production test,
        not a publishable season documentary.
      </p>

      <button
        type="button"
        style={buttonStyle}
        disabled={rendering || loading}
        onClick={() => void refresh()}
      >
        REFRESH APPROVED SCRIPTS
      </button>

      {loading && (
        <p>Loading approved scripts...</p>
      )}

      {error && (
        <p
          role="alert"
          style={{ color: "#ffaaaa" }}
        >
          {error}
        </p>
      )}

      {!loading && !draft && (
        <p>
          Approve a saved fictional script
          before rendering.
        </p>
      )}

      {draft && (
        <>
          <select
            value={selectedId}
            disabled={rendering}
            onChange={event => {
              clearVideo();

              setSelectedId(
                event.target.value
              );
            }}
            style={{
              display: "block",
              width: "100%",
              background: "#0b1b15",
              color: "#edf7f1",
              padding: 12,
              margin: "18px 0",
              border: "1px solid #315747",
            }}
          >
            {drafts.map(item => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.script.title}
                {" — V"}
                {item.version}
              </option>
            ))}
          </select>

          <p>
            1920 × 1080
            {" • "}
            30 FPS target
            {" • "}
            {duration}s target
            {" • "}
            WebM
          </p>

          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              background: "#07130e",
              borderRadius: 8,
            }}
          />

          <p style={{ opacity: 0.75 }}>
            Rendering takes approximately
            two minutes. Keep this browser
            tab visible until it finishes.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 16,
            }}
          >
            <button
              type="button"
              style={{
                ...buttonStyle,
                background: "#197655",
              }}
              disabled={rendering || loading}
              onClick={() => void renderVideo()}
            >
              {rendering
                ? "RENDERING..."
                : "RENDER DEMO VIDEO"}
            </button>

            {rendering && (
              <button
                type="button"
                style={buttonStyle}
                onClick={cancelRender}
              >
                CANCEL RENDER
              </button>
            )}
          </div>

          <div
            style={{
              height: 10,
              background: "#315747",
              borderRadius: 10,
              marginTop: 18,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "#48d6a8",
              }}
            />
          </div>

          <p>{progress}% complete</p>

          {videoUrl && (
            <div
              style={{
                borderTop:
                  "1px solid #315747",
                marginTop: 24,
                paddingTop: 20,
              }}
            >
              <h3>RENDERED VIDEO REVIEW</h3>

              <video
                src={videoUrl}
                controls
                playsInline
                style={{
                  width: "100%",
                  borderRadius: 8,
                  background: "#07130e",
                }}
              />

              <button
                type="button"
                style={{
                  ...buttonStyle,
                  marginTop: 14,
                }}
                onClick={downloadVideo}
              >
                DOWNLOAD DEMO VIDEO
              </button>

              <h3>FINAL DEMO REVIEW</h3>

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <input
                  type="checkbox"
                  checked={reviewed}
                  disabled={approved}
                  onChange={event =>
                    setReviewed(
                      event.target.checked
                    )
                  }
                />

                <span>
                  I have reviewed this rendered
                  fictional demonstration and
                  understand that it contains
                  no synchronized narration.
                </span>
              </label>

              <button
                type="button"
                style={{
                  ...buttonStyle,
                  background: "#197655",
                }}
                disabled={
                  !reviewed || approved
                }
                onClick={() =>
                  setApproved(true)
                }
              >
                APPROVE LOCAL DEMO VIDEO
              </button>

              {approved && (
                <>
                  <p
                    style={{
                      color: "#48d6a8",
                      fontWeight: 800,
                    }}
                  >
                    LOCAL DEMO REVIEW COMPLETE
                  </p>

                  <button
                    type="button"
                    style={buttonStyle}
                    onClick={downloadReview}
                  >
                    DOWNLOAD REVIEW RECORD
                  </button>
                </>
              )}

              <p
                style={{
                  fontSize: 12,
                  opacity: 0.65,
                }}
              >
                Video and final review are
                temporary browser artifacts.
                Download them before leaving.
                No database publication or
                permanent storage occurs.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}