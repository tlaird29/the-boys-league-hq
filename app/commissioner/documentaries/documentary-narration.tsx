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

export default function DocumentaryNarration() {
  const [drafts, setDrafts] =
    useState<DemoDraft[]>([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [voices, setVoices] =
    useState<SpeechSynthesisVoice[]>([]);

  const [voiceId, setVoiceId] =
    useState("");

  const [rate, setRate] =
    useState(1.05);

  const [pitch, setPitch] =
    useState(0.85);

  const [playing, setPlaying] =
    useState(false);

  const [activeScene, setActiveScene] =
    useState(-1);

  const [supported, setSupported] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const playbackToken = useRef(0);

  const utteranceRef =
    useRef<SpeechSynthesisUtterance | null>(
      null
    );

  async function refresh() {
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

      const approved = latest.filter(
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
          : "Unable to load approved scripts."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();

    if (!("speechSynthesis" in window)) {
      return;
    }

    setSupported(true);

    const synth = window.speechSynthesis;

    function updateVoices() {
      const available = synth
        .getVoices()
        .filter(
          voice =>
            voice.lang.toLowerCase()
              .startsWith("en") &&
            voice.localService
        );

      setVoices(available);

      setVoiceId(previous =>
        available.some(
          voice => voice.voiceURI === previous
        )
          ? previous
          : available[0]?.voiceURI ?? ""
      );
    }

    updateVoices();

    synth.addEventListener(
      "voiceschanged",
      updateVoices
    );

    return () => {
      playbackToken.current += 1;
      synth.cancel();

      synth.removeEventListener(
        "voiceschanged",
        updateVoices
      );
    };
  }, []);

  const draft = drafts.find(
    item => item.id === selectedId
  );

  const scenes =
    draft?.script.scenes ?? [];

  const totalSeconds = scenes.reduce(
    (total, scene) =>
      total + scene.durationSeconds,
    0
  );

  const totalWords = scenes.reduce(
    (total, scene) =>
      total +
      scene.narration
        .trim()
        .split(/\s+/)
        .filter(Boolean).length,
    0
  );

  function stop() {
    playbackToken.current += 1;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    utteranceRef.current = null;

    setPlaying(false);
    setActiveScene(-1);
  }

  function play(
    startIndex: number,
    continuous: boolean
  ) {
    if (
      !supported ||
      !draft ||
      !scenes[startIndex]
    ) {
      return;
    }

    const voice = voices.find(
      item => item.voiceURI === voiceId
    );

    if (!voice) {
      setError(
        "Select an available local English voice."
      );
      return;
    }

    stop();
    setError("");

    const token = playbackToken.current;

    setPlaying(true);

    function speakScene(index: number) {
      if (
        token !== playbackToken.current
      ) {
        return;
      }

      const scene = scenes[index];

      if (!scene) {
        setPlaying(false);
        setActiveScene(-1);
        return;
      }

      setActiveScene(index);

      const utterance =
        new SpeechSynthesisUtterance(
          scene.narration
        );

      utterance.voice = voice!;
      utterance.lang = voice!.lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;

      utteranceRef.current = utterance;

      utterance.onend = () => {
        if (
          token !== playbackToken.current
        ) {
          return;
        }

        utteranceRef.current = null;

        if (
          continuous &&
          index + 1 < scenes.length
        ) {
          speakScene(index + 1);
        } else {
          setPlaying(false);
          setActiveScene(-1);
        }
      };

      utterance.onerror = event => {
        if (
          token !== playbackToken.current
        ) {
          return;
        }

        setPlaying(false);
        setActiveScene(-1);

        setError(
          `Narration preview failed: ${event.error}`
        );
      };

      window.speechSynthesis.speak(
        utterance
      );
    }

    speakScene(startIndex);
  }

  function downloadPlan() {
    if (!draft) return;

    let position = 0;

    const timeline =
      draft.script.scenes.map(scene => {
        const startSeconds = position;

        position += scene.durationSeconds;

        return {
          sceneId: scene.id,
          headline: scene.headline,
          narration: scene.narration,
          startSeconds,
          endSeconds: position,
          targetDurationSeconds:
            scene.durationSeconds,
          voiceDirection:
            "Original energetic sports documentary announcer. Controlled intensity, clear diction, dramatic emphasis and natural pauses.",
        };
      });

    const plan = {
      draftId: draft.id,
      season: draft.season,
      version: draft.version,
      title: draft.script.title,
      fictional: true,
      targetDurationSeconds: totalSeconds,
      narrationWords: totalWords,
      audioGenerated: false,
      readyForRendering: false,
      readyForPublication: false,
      scenes: timeline,
    };

    const blob = new Blob(
      [JSON.stringify(plan, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `documentary-${draft.preview_id}-v${draft.version}-narration.json`;

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
        THE BOYS • AUDIO PRODUCTION
      </div>

      <h2>NARRATION STUDIO</h2>

      <p style={{ opacity: 0.75 }}>
        Preview approved fictional scripts
        using local browser voices.
        No paid audio generation, MP3
        production or publication occurs.
      </p>

      <button
        type="button"
        style={buttonStyle}
        disabled={playing || loading}
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

      {!loading && drafts.length === 0 && (
        <p>
          Approve a saved documentary script
          in the commissioner review panel,
          then refresh this studio.
        </p>
      )}

      {drafts.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <label>
            APPROVED DOCUMENTARY

            <select
              value={selectedId}
              disabled={playing}
              onChange={event => {
                stop();
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
                marginTop: 8,
                border: "1px solid #315747",
                borderRadius: 7,
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
          </label>
        </div>
      )}

      {draft && (
        <>
          <h3>{draft.script.title}</h3>

          <p>
            Version {draft.version}
            {" • "}
            {scenes.length} scenes
            {" • "}
            {totalWords} words
            {" • "}
            {totalSeconds}s target
          </p>

          <div
            style={{
              background: "#0b1b15",
              border: "1px solid #315747",
              borderRadius: 8,
              padding: 16,
              marginTop: 18,
            }}
          >
            <h3>ANNOUNCER SETTINGS</h3>

            <p style={{ opacity: 0.75 }}>
              Original sports broadcast
              delivery: energetic, dramatic,
              clear and authoritative.
            </p>

            {!supported && (
              <p>
                Speech synthesis is not
                supported in this browser.
              </p>
            )}

            {supported &&
              voices.length === 0 && (
                <p>
                  No local English voices
                  are available.
                </p>
              )}

            <label>
              Narrator voice

              <select
                value={voiceId}
                disabled={
                  playing ||
                  voices.length === 0
                }
                onChange={event =>
                  setVoiceId(
                    event.target.value
                  )
                }
                style={{
                  display: "block",
                  width: "100%",
                  background: "#10251e",
                  color: "#edf7f1",
                  padding: 10,
                  margin: "8px 0 20px",
                }}
              >
                {voices.map(voice => (
                  <option
                    key={voice.voiceURI}
                    value={voice.voiceURI}
                  >
                    {voice.name}
                    {" — "}
                    {voice.lang}
                  </option>
                ))}
              </select>
            </label>

            <label
              style={{ display: "block" }}
            >
              Delivery speed:{" "}
              {rate.toFixed(2)}x

              <input
                type="range"
                min={0.8}
                max={1.3}
                step={0.05}
                value={rate}
                disabled={playing}
                onChange={event =>
                  setRate(
                    Number(event.target.value)
                  )
                }
                style={{
                  width: "100%",
                  accentColor: "#48d6a8",
                }}
              />
            </label>

            <label
              style={{
                display: "block",
                marginTop: 14,
              }}
            >
              Voice pitch:{" "}
              {pitch.toFixed(2)}

              <input
                type="range"
                min={0.6}
                max={1.2}
                step={0.05}
                value={pitch}
                disabled={playing}
                onChange={event =>
                  setPitch(
                    Number(event.target.value)
                  )
                }
                style={{
                  width: "100%",
                  accentColor: "#48d6a8",
                }}
              />
            </label>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  background: "#197655",
                }}
                disabled={
                  playing ||
                  !supported ||
                  !voiceId
                }
                onClick={() =>
                  play(0, true)
                }
              >
                PLAY FULL NARRATION
              </button>

              <button
                type="button"
                style={buttonStyle}
                disabled={!playing}
                onClick={stop}
              >
                STOP
              </button>

              <button
                type="button"
                style={buttonStyle}
                onClick={downloadPlan}
              >
                DOWNLOAD NARRATION PLAN
              </button>
            </div>
          </div>

          <h3>SCENE NARRATION</h3>

          {scenes.map((scene, index) => {
            const words = scene.narration
              .trim()
              .split(/\s+/)
              .filter(Boolean).length;

            const targetWpm = Math.round(
              words /
              scene.durationSeconds *
              60
            );

            return (
              <article
                key={scene.id}
                style={{
                  background:
                    activeScene === index
                      ? "#173d30"
                      : "#0b1b15",

                  border:
                    activeScene === index
                      ? "1px solid #48d6a8"
                      : "1px solid #315747",

                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 12,
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
                  {scene.durationSeconds}s
                  {" • "}
                  {targetWpm} TARGET WPM

                  {activeScene === index
                    ? " • PLAYING"
                    : ""}
                </div>

                <h3>{scene.headline}</h3>

                <p style={{ lineHeight: 1.7 }}>
                  {scene.narration}
                </p>

                <button
                  type="button"
                  style={buttonStyle}
                  disabled={
                    playing ||
                    !supported ||
                    !voiceId
                  }
                  onClick={() =>
                    play(index, false)
                  }
                >
                  PREVIEW SCENE
                </button>
              </article>
            );
          })}

          <p
            style={{
              fontSize: 12,
              opacity: 0.65,
            }}
          >
            Browser narration timing is
            approximate. Final audio must
            be generated, measured and
            synchronized before video
            rendering.
          </p>
        </>
      )}
    </section>
  );
}