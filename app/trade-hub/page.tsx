
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Player = {
  id: string;
  name: string;
  pos: string;
  team: string;
  value: number;
};

type Evaluation = {
  id: number;
  a: string;
  b: string;
  difference: number;
  status: string;
  date: string;
};

const players: Player[] = [
  { id: "gibbs", name: "Jahmyr Gibbs", pos: "RB", team: "DET", value: 92.7 },
  { id: "bijan", name: "Bijan Robinson", pos: "RB", team: "ATL", value: 89.4 },
  { id: "puka", name: "Puka Nacua", pos: "WR", team: "LAR", value: 82.2 },
  { id: "jsn", name: "Jaxon Smith-Njigba", pos: "WR", team: "SEA", value: 81.3 },
  { id: "lamb", name: "CeeDee Lamb", pos: "WR", team: "DAL", value: 75.1 },
  { id: "jeanty", name: "Ashton Jeanty", pos: "RB", team: "LV", value: 66.1 },
  { id: "allen", name: "Josh Allen", pos: "QB", team: "BUF", value: 51.8 },
  { id: "bowers", name: "Brock Bowers", pos: "TE", team: "LV", value: 49.5 },
  { id: "pickens", name: "George Pickens", pos: "WR", team: "DAL", value: 43.7 },
  { id: "mahomes", name: "Patrick Mahomes", pos: "QB", team: "KC", value: 31.5 }
];

const panel: React.CSSProperties = {
  background: "#fffdf6",
  border: "1px solid #c6bca8",
  padding: 20
};

const button: React.CSSProperties = {
  background: "#202b25",
  color: "#fffdf6",
  padding: "10px 14px",
  border: 0,
  cursor: "pointer",
  fontWeight: 700
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  border: "1px solid #a99f8c",
  background: "white"
};

export default function TradeHub() {
  const [sideA, setSideA] = useState<string[]>([]);
  const [sideB, setSideB] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [evaluated, setEvaluated] = useState(false);
  const [history, setHistory] = useState<Evaluation[]>([]);

  const byId = (id: string) => players.find(p => p.id === id);

  const total = (ids: string[]) =>
    ids.reduce((sum, id) => sum + (byId(id)?.value ?? 0), 0);

  const aTotal = total(sideA);
  const bTotal = total(sideB);
  const difference = Math.abs(aTotal - bTotal);
  const passes = difference <= 25;

  const eligible = useMemo(
    () =>
      players.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  function add(id: string, side: "a" | "b") {
    if (!id || sideA.includes(id) || sideB.includes(id)) return;

    if (side === "a") setSideA(prev => [...prev, id]);
    else setSideB(prev => [...prev, id]);

    setEvaluated(false);
  }

  function remove(id: string, side: "a" | "b") {
    if (side === "a") setSideA(prev => prev.filter(x => x !== id));
    else setSideB(prev => prev.filter(x => x !== id));

    setEvaluated(false);
  }

  function renderSide(title: string, ids: string[], side: "a" | "b") {
    return (
      <section style={panel}>
        <h2 style={{ fontSize: 25, marginBottom: 16 }}>{title}</h2>

        {ids.length === 0 && (
          <p style={{ color: "#716d63" }}>
            Select a player to get started.
          </p>
        )}

        {ids.map(id => {
          const p = byId(id);

          return p && (
            <div
              key={id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                padding: "9px 0",
                borderBottom: "1px solid #ddd4c2"
              }}
            >
              <span>
                <strong>{p.name}</strong>
                <br />
                <small>
                  {p.pos} · {p.team} · {p.value.toFixed(1)}
                </small>
              </span>

              <button
                onClick={() => remove(id, side)}
                aria-label={`Remove ${p.name}`}
                style={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 20
                }}
              >
                ×
              </button>
            </div>
          );
        })}

        <label
          style={{
            display: "block",
            marginTop: 16,
            marginBottom: 6,
            fontWeight: 700
          }}
        >
          Add player
        </label>

        <select
          aria-label={`Add player to ${title}`}
          style={selectStyle}
          value=""
          onChange={e => add(e.target.value, side)}
        >
          <option value="">Choose a player...</option>

          {eligible
            .filter(
              p => !sideA.includes(p.id) && !sideB.includes(p.id)
            )
            .map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.pos} — {p.value.toFixed(1)}
              </option>
            ))}
        </select>

        <p
          style={{
            borderTop: "2px solid #202b25",
            paddingTop: 12,
            marginTop: 18,
            fontWeight: 800
          }}
        >
          TOTAL: {total(ids).toFixed(1)}
        </p>
      </section>
    );
  }

  function save() {
    if (!evaluated) return;

    const names = (ids: string[]) =>
      ids.map(id => byId(id)?.name ?? id).join(", ");

    setHistory(prev => [
      {
        id: Date.now(),
        a: names(sideA),
        b: names(sideB),
        difference,
        status: passes ? "ALLOWED" : "VETOED",
        date: new Date().toLocaleString()
      },
      ...prev
    ]);
  }

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "24px 18px 80px",
        color: "#202b25"
      }}
    >
      <div
        style={{
          textAlign: "center",
          borderBottom: "4px double #202b25",
          paddingBottom: 20
        }}
      >
        <Link
          href="/"
          style={{ fontSize: 13, textDecoration: "underline" }}
        >
          ← BACK TO THE BOYS
        </Link>

        <p
          style={{
            letterSpacing: 3,
            fontSize: 12,
            marginTop: 20
          }}
        >
          THE BOYS LEAGUE HQ · COMMISSIONER&apos;S EDITION
        </p>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(38px, 7vw, 70px)",
            letterSpacing: -2,
            lineHeight: 1.1
          }}
        >
          THE TRADE HUB
        </h1>

        <p
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: 17
          }}
        >
          Where friendships go to die and terrible offers get exposed.
        </p>
      </div>

      <div
        style={{
          background: "#fff0c9",
          border: "1px solid #aa8740",
          padding: 15,
          margin: "22px 0",
          lineHeight: 1.6
        }}
      >
        <strong>EARLY ACCESS — DEMONSTRATION DATA</strong>
        <br />
        This calculator currently uses a limited sample of player
        values, not live updates. Package adjustment is not yet
        applied, so results are provisional and must not be used
        as official league approvals or vetoes.
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginBottom: 18
        }}
      >
        <strong>
          10 TEAM · REDRAFT · FULL PPR · 6-POINT PASS TD
        </strong>

        <strong>LEAGUE LIMIT: 25.0 POINTS</strong>
      </div>

      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 700
        }}
      >
        Search available sample players
      </label>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by player name..."
        style={{ ...selectStyle, marginBottom: 18 }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(270px, 1fr))",
          gap: 18
        }}
      >
        {renderSide("TEAM A SENDS", sideA, "a")}
        {renderSide("TEAM B SENDS", sideB, "b")}
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "24px 0"
        }}
      >
        <button
          style={{
            ...button,
            opacity: sideA.length && sideB.length ? 1 : 0.5
          }}
          disabled={!sideA.length || !sideB.length}
          onClick={() => setEvaluated(true)}
        >
          EVALUATE PROPOSED TRADE
        </button>
      </div>

      {evaluated && (
        <section
          style={{
            ...panel,
            textAlign: "center",
            border: `2px solid ${
              passes ? "#17803e" : "#b32828"
            }`
          }}
        >
          <p
            style={{
              fontWeight: 800,
              color: passes ? "#17803e" : "#b32828"
            }}
          >
            PROVISIONAL {passes ? "ALLOWED" : "VETOED"}
          </p>

          <p style={{ fontSize: 12, letterSpacing: 2 }}>
            TRADE VALUE SEPARATION
          </p>

          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: passes ? "#17803e" : "#b32828"
            }}
          >
            {difference.toFixed(1)}
          </div>

          <p>
            Maximum permitted separation: 25.0
            <br />
            Package adjustment not included
          </p>

          <button style={button} onClick={save}>
            SAVE TO THIS SESSION&apos;S EVALUATIONS
          </button>
        </section>
      )}

      <section
        style={{
          marginTop: 38,
          borderTop: "4px double #202b25",
          paddingTop: 18
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 30
          }}
        >
          TRADE HISTORY
        </h2>

        <p style={{ color: "#6c675d" }}>
          Official approved Yahoo trades will appear here after
          integration. Below are temporary evaluations saved in
          this browser session only.
        </p>

        {history.length === 0 ? (
          <div
            style={{
              ...panel,
              textAlign: "center",
              marginTop: 14
            }}
          >
            No evaluations saved yet.
          </div>
        ) : (
          history.map(t => (
            <article
              key={t.id}
              style={{ ...panel, marginTop: 12 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap"
                }}
              >
                <strong>
                  {t.a} <span style={{ fontWeight: 400 }}>for</span>{" "}
                  {t.b}
                </strong>

                <strong
                  style={{
                    color:
                      t.status === "ALLOWED"
                        ? "#17803e"
                        : "#b32828"
                  }}
                >
                  {t.difference.toFixed(1)} · {t.status}
                </strong>
              </div>

              <small>
                {t.date} · Provisional calculation, not an
                official decision
              </small>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
