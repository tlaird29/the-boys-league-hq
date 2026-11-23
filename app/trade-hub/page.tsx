
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Player = {
  id: string;
  name: string;
  pos: string;
  team: string;
  value: number;
};

type Evaluation = {
  id: number;
  sideA: string;
  sideB: string;
  rawA: number;
  rawB: number;
  adjustedA: number;
  adjustedB: number;
  separation: number;
  allowed: boolean;
  date: string;
};

const MAX_SEPARATION = 25;
const EXTRA_PLAYER_DISCOUNT = 0.20;

// Demonstration values only.
// Live player values will replace these in a later update.
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

const paper: CSSProperties = {
  background: "#fffdf6",
  border: "1px solid #c8bda8",
  padding: 20
};

const darkButton: CSSProperties = {
  border: 0,
  background: "#222a23",
  color: "#fffdf6",
  padding: "12px 18px",
  fontWeight: 800,
  cursor: "pointer"
};

const field: CSSProperties = {
  width: "100%",
  padding: 11,
  border: "1px solid #aa9f8b",
  borderRadius: 0,
  background: "#fff"
};

const format = (value: number) => value.toFixed(1);

// Package adjustment:
// The side sending MORE players receives a discount.
// The highest-value player retains full value.
// Each additional player on that side receives 80% value.
//
// This is an independent approximation, not RotoTrade's
// proprietary package-adjustment formula.
function calculateSide(
  selected: Player[],
  opposingPlayerCount: number
) {
  const ordered = [...selected].sort(
    (a, b) => b.value - a.value
  );

  const raw = ordered.reduce(
    (sum, player) => sum + player.value,
    0
  );

  if (ordered.length <= opposingPlayerCount) {
    return {
      raw,
      adjusted: raw,
      adjustment: 0
    };
  }

  const fullValue = ordered[0]?.value ?? 0;

  const additionalValue = ordered
    .slice(1)
    .reduce((sum, player) => sum + player.value, 0);

  const adjusted =
    fullValue +
    additionalValue * (1 - EXTRA_PLAYER_DISCOUNT);

  return {
    raw,
    adjusted,
    adjustment: raw - adjusted
  };
}

export default function TradeHubPage() {
  const [sideA, setSideA] = useState<string[]>([]);
  const [sideB, setSideB] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("ALL");
  const [evaluated, setEvaluated] = useState(false);
  const [history, setHistory] = useState<Evaluation[]>([]);

  const playerById = (id: string) =>
    players.find(player => player.id === id);

  const selectedA = sideA
    .map(playerById)
    .filter((player): player is Player => Boolean(player));

  const selectedB = sideB
    .map(playerById)
    .filter((player): player is Player => Boolean(player));

  const resultA = calculateSide(
    selectedA,
    selectedB.length
  );

  const resultB = calculateSide(
    selectedB,
    selectedA.length
  );

  const separation = Math.abs(
    resultA.adjusted - resultB.adjusted
  );

  const allowed = separation <= MAX_SEPARATION;

  const hasBothSides =
    selectedA.length > 0 && selectedB.length > 0;

  const packageAdjustmentApplied =
    selectedA.length !== selectedB.length;

  const availablePlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPosition =
        position === "ALL" || player.pos === position;

      return matchesSearch && matchesPosition;
    });
  }, [search, position]);

  function addPlayer(
    id: string,
    side: "A" | "B"
  ) {
    if (!id || sideA.includes(id) || sideB.includes(id)) {
      return;
    }

    if (side === "A") {
      setSideA(current => [...current, id]);
    } else {
      setSideB(current => [...current, id]);
    }

    setEvaluated(false);
  }

  function removePlayer(
    id: string,
    side: "A" | "B"
  ) {
    if (side === "A") {
      setSideA(current =>
        current.filter(playerId => playerId !== id)
      );
    } else {
      setSideB(current =>
        current.filter(playerId => playerId !== id)
      );
    }

    setEvaluated(false);
  }

  function clearTrade() {
    setSideA([]);
    setSideB([]);
    setSearch("");
    setPosition("ALL");
    setEvaluated(false);
  }

  function saveEvaluation() {
    if (!evaluated || !hasBothSides) return;

    const names = (selected: Player[]) =>
      selected.map(player => player.name).join(", ");

    const entry: Evaluation = {
      id: Date.now(),
      sideA: names(selectedA),
      sideB: names(selectedB),
      rawA: resultA.raw,
      rawB: resultB.raw,
      adjustedA: resultA.adjusted,
      adjustedB: resultB.adjusted,
      separation,
      allowed,
      date: new Date().toLocaleString()
    };

    setHistory(current => [entry, ...current]);
  }

  function renderSide(
    title: string,
    selected: Player[],
    side: "A" | "B",
    calculation: ReturnType<typeof calculateSide>
  ) {
    return (
      <section style={paper}>
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 25,
            marginBottom: 16
          }}
        >
          {title}
        </h2>

        {selected.length === 0 && (
          <p style={{ color: "#777064" }}>
            No players selected.
          </p>
        )}

        {selected.map(player => (
          <div
            key={player.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              padding: "11px 0",
              borderBottom: "1px solid #e2d9c8"
            }}
          >
            <div>
              <strong>{player.name}</strong>
              <div
                style={{
                  fontSize: 12,
                  color: "#777064",
                  marginTop: 3
                }}
              >
                {player.pos} · {player.team} ·{" "}
                {format(player.value)} pts
              </div>
            </div>

            <button
              type="button"
              aria-label={`Remove ${player.name}`}
              onClick={() =>
                removePlayer(player.id, side)
              }
              style={{
                border: "1px solid #c8bda8",
                background: "transparent",
                padding: "5px 10px",
                cursor: "pointer"
              }}
            >
              ×
            </button>
          </div>
        ))}

        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginTop: 18,
            marginBottom: 8
          }}
        >
          Add Player
        </label>

        <select
          value=""
          aria-label={`Add player to ${title}`}
          style={field}
          onChange={event =>
            addPlayer(event.target.value, side)
          }
        >
          <option value="">Select NFL player...</option>

          {availablePlayers
            .filter(
              player =>
                !sideA.includes(player.id) &&
                !sideB.includes(player.id)
            )
            .map(player => (
              <option
                key={player.id}
                value={player.id}
              >
                {player.name} · {player.pos} ·{" "}
                {format(player.value)}
              </option>
            ))}
        </select>

        <div
          style={{
            borderTop: "3px double #222a23",
            marginTop: 22,
            paddingTop: 14
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8
            }}
          >
            <span>Raw Player Value</span>
            <strong>{format(calculation.raw)}</strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8
            }}
          >
            <span>Package Adjustment</span>
            <strong>
              -{format(calculation.adjustment)}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #d6cbb9",
              paddingTop: 12
            }}
          >
            <strong>Adjusted Trade Value</strong>
            <strong style={{ fontSize: 26 }}>
              {format(calculation.adjusted)}
            </strong>
          </div>
        </div>
      </section>
    );
  }

  const resultColor = allowed ? "#18733a" : "#ad2828";

  return (
    <main
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "24px 18px 80px",
        color: "#222a23"
      }}
    >
      <header
        style={{
          textAlign: "center",
          borderBottom: "5px double #222a23",
          paddingBottom: 22
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 13,
            textDecoration: "underline"
          }}
        >
          ← BACK TO THE BOYS
        </Link>

        <p
          style={{
            fontSize: 12,
            letterSpacing: 3,
            marginTop: 22
          }}
        >
          THE BOYS LEAGUE HQ
        </p>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(40px, 7vw, 76px)",
            lineHeight: 1.1,
            letterSpacing: -2,
            margin: "12px 0"
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
          Where friendships go to die and terrible
          trade offers get exposed.
        </p>
      </header>

      <div
        style={{
          background: "#fff0c9",
          border: "1px solid #b39550",
          padding: 16,
          margin: "22px 0",
          lineHeight: 1.6
        }}
      >
        <strong>EARLY ACCESS — PROVISIONAL VALUES</strong>
        <div>
          Player values are demonstration data.
          Package adjustment is now automatically
          calculated using our own 20% discount model.
          These results are not yet calibrated against
          RotoTrade and must not be treated as official
          league approvals or vetoes.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 22,
          fontWeight: 800,
          fontSize: 13
        }}
      >
        <span>
          10 TEAMS · REDRAFT · FULL PPR ·
          6-POINT PASS TD
        </span>

        <span>
          PACKAGE ADJUSTMENT: ON
        </span>

        <span>
          MAX SEPARATION: 25.0
        </span>
      </div>

      <section
        style={{
          ...paper,
          marginBottom: 20
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 22,
            marginBottom: 14
          }}
        >
          Find Players
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12
          }}
        >
          <input
            value={search}
            onChange={event =>
              setSearch(event.target.value)
            }
            placeholder="Search NFL player..."
            aria-label="Search NFL player"
            style={field}
          />

          <select
            value={position}
            onChange={event =>
              setPosition(event.target.value)
            }
            aria-label="Filter by position"
            style={field}
          >
            <option value="ALL">All Positions</option>
            <option value="QB">Quarterbacks</option>
            <option value="RB">Running Backs</option>
            <option value="WR">Wide Receivers</option>
            <option value="TE">Tight Ends</option>
          </select>
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18
        }}
      >
        {renderSide(
          "TEAM A SENDS",
          selectedA,
          "A",
          resultA
        )}

        {renderSide(
          "TEAM B SENDS",
          selectedB,
          "B",
          resultB
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 12,
          margin: "24px 0"
        }}
      >
        <button
          type="button"
          disabled={!hasBothSides}
          onClick={() => setEvaluated(true)}
          style={{
            ...darkButton,
            opacity: hasBothSides ? 1 : 0.5
          }}
        >
          EVALUATE TRADE
        </button>

        <button
          type="button"
          onClick={clearTrade}
          style={{
            ...darkButton,
            background: "#e8e0d1",
            color: "#222a23"
          }}
        >
          CLEAR TRADE
        </button>
      </div>

      {evaluated && hasBothSides && (
        <section
          style={{
            ...paper,
            textAlign: "center",
            border: `2px solid ${resultColor}`,
            padding: 28
          }}
        >
          <p
            style={{
              color: resultColor,
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 1
            }}
          >
            PROVISIONAL{" "}
            {allowed ? "TRADE ALLOWED" : "TRADE VETOED"}
          </p>

          <p
            style={{
              letterSpacing: 2,
              fontSize: 12,
              fontWeight: 800,
              marginTop: 16
            }}
          >
            TRADE VALUE SEPARATION
          </p>

          <div
            style={{
              fontSize: "clamp(55px, 9vw, 90px)",
              fontWeight: 900,
              lineHeight: 1.2,
              color: resultColor
            }}
          >
            {format(separation)}
          </div>

          <p>
            Maximum allowed:{" "}
            <strong>{format(MAX_SEPARATION)}</strong>
          </p>

          <p
            style={{
              fontSize: 13,
              color: "#6f695e"
            }}
          >
            Package Adjustment:{" "}
            <strong>
              {packageAdjustmentApplied
                ? "APPLIED AUTOMATICALLY"
                : "ON — NO ADJUSTMENT NEEDED"}
            </strong>
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              margin: "22px 0"
            }}
          >
            <div
              style={{
                background: "#f4eee3",
                padding: 14
              }}
            >
              <div>TEAM A ADJUSTED</div>
              <strong style={{ fontSize: 25 }}>
                {format(resultA.adjusted)}
              </strong>
            </div>

            <div
              style={{
                background: "#f4eee3",
                padding: 14
              }}
            >
              <div>TEAM B ADJUSTED</div>
              <strong style={{ fontSize: 25 }}>
                {format(resultB.adjusted)}
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={saveEvaluation}
            style={darkButton}
          >
            SAVE EVALUATION
          </button>
        </section>
      )}

      <section
        style={{
          marginTop: 42,
          borderTop: "5px double #222a23",
          paddingTop: 22
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 32
          }}
        >
          TRADE HISTORY
        </h2>

        <p
          style={{
            color: "#716a5d",
            lineHeight: 1.6
          }}
        >
          This section currently stores temporary
          evaluations for the current page session.
          Official approved trades will be imported
          and stored separately once we connect
          the permanent database.
        </p>

        {history.length === 0 ? (
          <div
            style={{
              ...paper,
              textAlign: "center",
              marginTop: 16
            }}
          >
            No evaluations saved yet.
          </div>
        ) : (
          history.map(entry => (
            <article
              key={entry.id}
              style={{
                ...paper,
                marginTop: 12
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 14,
                  flexWrap: "wrap"
                }}
              >
                <div>
                  <strong>
                    {entry.sideA}
                  </strong>
                  <span> for </span>
                  <strong>
                    {entry.sideB}
                  </strong>
                </div>

                <strong
                  style={{
                    color: entry.allowed
                      ? "#18733a"
                      : "#ad2828"
                  }}
                >
                  {format(entry.separation)} ·{" "}
                  {entry.allowed ? "ALLOWED" : "VETOED"}
                </strong>
              </div>

              <p
                style={{
                  fontSize: 13,
                  marginTop: 10
                }}
              >
                Adjusted totals:{" "}
                {format(entry.adjustedA)} vs.{" "}
                {format(entry.adjustedB)}
              </p>

              <small
                style={{
                  color: "#716a5d"
                }}
              >
                {entry.date} · Provisional evaluation
              </small>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
