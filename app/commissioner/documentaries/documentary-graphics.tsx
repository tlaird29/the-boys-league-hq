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

export default function DocumentaryGraphics() {
  const [drafts, setDrafts] =
    useState<DemoDraft[]>([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [elapsed, setElapsed] =
    useState(0);

  const [playing, setPlaying] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  async function refresh() {
    setPlaying(false);
    setElapsed(0);
    setLoading(true);
    setError("");

    try {
      const data =
        await loadDemoReviews();

      const approved = (
        ["dominant", "comeback"] as const
      )
        .map(id =>
          data.drafts
            .filter(
              draft =>
                draft.preview_id === id
            )
            .sort(
              (a, b) =>
                b.version - a.version
            )[0]
        )
        .filter(
          (draft): draft is DemoDraft =>
            Boolean(
              draft &&
              draft.fictional === true &&
              draft.status === "demo-approved"
            )
        );

      setDrafts(approved);

      setSelectedId(previous =>
        approved.some(
          draft => draft.id === previous
        )
          ? previous
          : approved[0]?.id ?? ""
      );

    } catch (error) {
      setDrafts([]);
      setSelectedId("");

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load graphics."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const draft = drafts.find(
    item => item.id === selectedId
  );

  let position = 0;

  const timeline = (
    draft?.script.scenes ?? []
  ).map(scene => {
    const start = position;

    position += scene.durationSeconds;

    return {
      ...scene,
      start,
      end: position,
    };
  });

  const total = position;

  const activeIndex = timeline.findIndex(
    scene =>
      elapsed >= scene.start &&
      elapsed < scene.end
  );

  const scene =
    timeline[
      activeIndex >= 0
        ? activeIndex
        : timeline.length - 1
    ];

  const progress = scene
    ? Math.max(
        0,
        Math.min(
          1,
          (elapsed - scene.start) /
            scene.durationSeconds
        )
      )
    : 0;

  useEffect(() => {
    if (!playing || total <= 0) {
      return;
    }

    let frame = 0;
    let previous = performance.now();

    function tick(now: number) {
      const delta =
        (now - previous) / 1000;

      previous = now;

      setElapsed(value =>
        Math.min(total, value + delta)
      );

      frame =
        requestAnimationFrame(tick);
    }

    frame =
      requestAnimationFrame(tick);

    return () =>
      cancelAnimationFrame(frame);

  }, [playing, total]);

  useEffect(() => {
    if (total > 0 && elapsed >= total) {
      setPlaying(false);
    }
  }, [elapsed, total]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !draft || !scene) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const gradient =
      ctx.createLinearGradient(
        0, 0, width, height
      );

    gradient.addColorStop(
      0, "#07130e"
    );

    gradient.addColorStop(
      0.55, "#123d2e"
    );

    gradient.addColorStop(
      1, "#050a08"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
      0, 0, width, height
    );

    // Moving broadcast background.

    ctx.save();

    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#48d6a8";
    ctx.lineWidth = 2;

    const offset =
      (elapsed * 35) % 100;

    for (
      let x = -height;
      x < width + height;
      x += 100
    ) {
      ctx.beginPath();

      ctx.moveTo(
        x + offset, 0
      );

      ctx.lineTo(
        x + height + offset,
        height
      );

      ctx.stroke();
    }

    ctx.restore();

    // Broadcast header.

    ctx.fillStyle = "#07130e";

    ctx.fillRect(
      0, 0, width, 100
    );

    ctx.fillStyle = "#48d6a8";

    ctx.font =
      "bold 32px Arial";

    ctx.textAlign = "left";

    ctx.fillText(
      "THE BOYS ORIGINALS",
      65, 63
    );

    ctx.textAlign = "right";

    ctx.fillText(
      `${draft.season} | FICTIONAL DEMO`,
      width - 65,
      63
    );

    // Scene entrance animation.

    const entrance = Math.min(
      1, progress * 12
    );

    ctx.save();

    ctx.globalAlpha = entrance;

    ctx.translate(
      0,
      (1 - entrance) * 45
    );

    ctx.textAlign = "center";

    const graphic =
      scene.graphic;

    const closing =
      graphic === "closing-logo";

    const championship =
      graphic === "championship-banner" ||
      graphic === "dynasty-banner-collection" ||
      graphic === "championship-hero-reveal";

    if (closing) {
      ctx.fillStyle = "#48d6a8";

      ctx.font =
        "bold 145px Arial";

      ctx.fillText(
        "THE BOYS",
        width / 2,
        450
      );

      ctx.fillStyle = "#ffffff";

      ctx.font =
        "bold 90px Arial";

      ctx.fillText(
        "ICE TF UP!",
        width / 2,
        590
      );

    } else if (championship) {
      const bannerWidth = 550;
      const bannerHeight = 500;

      const x =
        (width - bannerWidth) / 2;

      const y = 155;

      ctx.fillStyle = "#174d39";

      ctx.strokeStyle = "#d8bc75";

      ctx.lineWidth = 8;

      ctx.beginPath();

      ctx.moveTo(x, y);

      ctx.lineTo(
        x + bannerWidth, y
      );

      ctx.lineTo(
        x + bannerWidth,
        y + bannerHeight - 90
      );

      ctx.lineTo(
        width / 2,
        y + bannerHeight
      );

      ctx.lineTo(
        x,
        y + bannerHeight - 90
      );

      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#d8bc75";

      ctx.font =
        "bold 80px Arial";

      ctx.fillText(
        String(draft.season),
        width / 2,
        350
      );

      ctx.fillStyle = "#ffffff";

      ctx.font =
        "bold 45px Arial";

      ctx.fillText(
        "CHAMPIONSHIP",
        width / 2,
        435
      );

      ctx.font =
        "bold 36px Arial";

      ctx.fillText(
        "DEMO BANNER",
        width / 2,
        495
      );

    } else {
      // Decorative broadcast motion.
      // These bars do not represent statistics.

      const barCount = 12;

      for (
        let i = 0;
        i < barCount;
        i++
      ) {
        const barHeight =
          90 +
          Math.abs(
            Math.sin(
              i * 0.8 + elapsed * 0.6
            )
          ) * 260;

        ctx.globalAlpha =
          entrance * 0.15;

        ctx.fillStyle = "#48d6a8";

        ctx.fillRect(
          180 + i * 130,
          650 - barHeight,
          85,
          barHeight
        );
      }

      ctx.globalAlpha = entrance;

      ctx.fillStyle = "#48d6a8";

      ctx.font =
        "bold 32px Arial";

      ctx.fillText(
        graphic
          .replace(/-/g, " ")
          .toUpperCase(),
        width / 2,
        290
      );

      ctx.fillStyle = "#ffffff";

      let fontSize = 100;

      ctx.font =
        `bold ${fontSize}px Arial`;

      while (
        ctx.measureText(
          scene.headline
        ).width > width - 200 &&
        fontSize > 30
      ) {
        fontSize -= 2;

        ctx.font =
          `bold ${fontSize}px Arial`;
      }

      ctx.fillText(
        scene.headline,
        width / 2,
        460,
        width - 160
      );

      ctx.fillStyle = "#b4c8bf";

      ctx.font =
        "bold 30px Arial";

      ctx.fillText(
        "THE SEASON IN REVIEW",
        width / 2,
        550
      );
    }

    ctx.restore();

    // Lower-third headline.

    ctx.fillStyle =
      "rgba(5,15,10,0.92)";

    ctx.fillRect(
      0, 790, width, 210
    );

    ctx.fillStyle = "#48d6a8";

    ctx.fillRect(
      65, 820, 8, 120
    );

    ctx.textAlign = "left";

    ctx.font =
      "bold 26px Arial";

    ctx.fillText(
      `SCENE ${timeline.indexOf(scene) + 1} OF ${timeline.length}`,
      100, 850
    );

    ctx.fillStyle = "#ffffff";

    ctx.font =
      "bold 48px Arial";

    ctx.fillText(
      scene.headline,
      100, 920,
      width - 200
    );

    ctx.fillStyle = "#315747";

    ctx.fillRect(
      0, height - 12,
      width, 12
    );

    ctx.fillStyle = "#48d6a8";

    ctx.fillRect(
      0,
      height - 12,
      total > 0
        ? width * elapsed / total
        : 0,
      12
    );

  }, [
    draft,
    scene,
    elapsed,
    progress,
    total,
    timeline,
  ]);

  function downloadGraphicsPlan() {
    if (!draft) return;

    const plan = {
      draftId: draft.id,
      version: draft.version,
      season: draft.season,
      title: draft.script.title,
      fictional: true,
      width: 1920,
      height: 1080,
      framesPerSecond: 30,
      durationSeconds: total,
      totalFrames:
        Math.round(total * 30),
      graphicsMode:
        "animated-concept-preview",
      rendered: false,
      readyForPublication: false,
      scenes: timeline.map(item => ({
        sceneId: item.id,
        headline: item.headline,
        graphic: item.graphic,
        transition: item.transition,
        visualDirection:
          item.visualDirection,
        startFrame:
          Math.round(item.start * 30),
        endFrame:
          Math.round(item.end * 30),
        evidenceIds: item.evidenceIds,
      })),
    };

    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify(plan, null, 2)],
        { type: "application/json" }
      )
    );

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `documentary-${draft.preview_id}-v${draft.version}-graphics.json`;

    link.click();

    setTimeout(
      () => URL.revokeObjectURL(url),
      1000
    );
  }

  function formatTime(value: number) {
    const seconds =
      Math.floor(value);

    return (
      Math.floor(seconds / 60) +
      ":" +
      String(seconds % 60)
        .padStart(2, "0")
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
        THE BOYS • VISUAL PRODUCTION
      </div>

      <h2>GRAPHICS STUDIO</h2>

      <p style={{ opacity: 0.75 }}>
        Animated concept previews for
        approved fictional documentaries.
        Decorative motion does not
        represent actual league statistics.
      </p>

      <button
        type="button"
        style={buttonStyle}
        disabled={loading}
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
          before opening the graphics
          preview.
        </p>
      )}

      {draft && (
        <>
          <select
            value={selectedId}
            onChange={event => {
              setPlaying(false);
              setElapsed(0);
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
              border:
                "1px solid #315747",
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
              border:
                "1px solid #315747",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              marginTop: 12,
              fontSize: 13,
            }}
          >
            <span>
              {formatTime(elapsed)}
            </span>

            <span>
              {formatTime(total)}
            </span>
          </div>

          <input
            aria-label="Video timeline"
            type="range"
            min={0}
            max={total}
            step={0.1}
            value={elapsed}
            onChange={event => {
              setPlaying(false);

              setElapsed(
                Number(
                  event.target.value
                )
              );
            }}
            style={{
              width: "100%",
              accentColor: "#48d6a8",
            }}
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 12,
            }}
          >
            <button
              type="button"
              style={{
                ...buttonStyle,
                background: "#197655",
              }}
              onClick={() => {
                if (elapsed >= total) {
                  setElapsed(0);
                }

                setPlaying(
                  value => !value
                );
              }}
            >
              {playing
                ? "PAUSE"
                : "PLAY PREVIEW"}
            </button>

            <button
              type="button"
              style={buttonStyle}
              onClick={() => {
                setPlaying(false);
                setElapsed(0);
              }}
            >
              RESTART
            </button>

            <button
              type="button"
              style={buttonStyle}
              onClick={
                downloadGraphicsPlan
              }
            >
              DOWNLOAD GRAPHICS PLAN
            </button>
          </div>

          <h3>PRODUCTION TIMELINE</h3>

          <div
            style={{
              display: "flex",
              gap: 4,
              marginBottom: 20,
            }}
          >
            {timeline.map(item => (
              <button
                key={item.id}
                type="button"
                title={item.headline}
                onClick={() => {
                  setPlaying(false);

                  setElapsed(
                    item.start
                  );
                }}
                style={{
                  flex:
                    item.durationSeconds,
                  minWidth: 0,
                  height: 30,
                  background:
                    scene?.id === item.id
                      ? "#48d6a8"
                      : "#315747",
                  border: 0,
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          {timeline.map((item, index) => (
            <article
              key={item.id}
              style={{
                background: "#0b1b15",
                border:
                  scene?.id === item.id
                    ? "1px solid #48d6a8"
                    : "1px solid #315747",
                borderRadius: 8,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  color: "#48d6a8",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                SCENE {index + 1}
                {" • "}
                {formatTime(item.start)}
                {" – "}
                {formatTime(item.end)}
              </div>

              <h3>{item.headline}</h3>

              <p>
                {item.graphic
                  .replace(/-/g, " ")
                  .toUpperCase()}
              </p>

              <p style={{ opacity: 0.75 }}>
                {item.visualDirection}
              </p>

              <button
                type="button"
                style={buttonStyle}
                onClick={() => {
                  setPlaying(false);

                  setElapsed(
                    item.start
                  );
                }}
              >
                VIEW SCENE
              </button>
            </article>
          ))}

          <p
            style={{
              fontSize: 12,
              opacity: 0.65,
            }}
          >
            1920 × 1080 production canvas.
            Target export: 30 FPS.
            This preview is silent and
            does not create a video file.
            Specialized statistical graphics
            require verified evidence and
            additional rendering templates.
          </p>
        </>
      )}
    </section>
  );
}