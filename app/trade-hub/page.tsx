"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Player = { id: string; name: string; pos: "QB" | "RB" | "WR" | "TE"; team: string; value: number; projection: number };
type Side = "A" | "B";
type Trade = { a: string[]; b: string[] };
type Assessment = { rawA: number; rawB: number; adjustedA: number; adjustedB: number; gap: number; signedGap: number; packageA: number; packageB: number; lineupA: number; lineupB: number; benefitA: number; benefitB: number; allowed: boolean };
type Suggestion = { trade: Trade; assessment: Assessment; changes: number; quality: number; reason: string };
type Saved = { date: string; label: string; assessment: Assessment };

// Demonstration data only. These are NOT live player values or verified projections.
const PLAYERS: Player[] = [
  { id: "gibbs", name: "Jahmyr Gibbs", pos: "RB", team: "DET", value: 92.7, projection: 20.4 },
  { id: "bijan", name: "Bijan Robinson", pos: "RB", team: "ATL", value: 89.4, projection: 20.1 },
  { id: "puka", name: "Puka Nacua", pos: "WR", team: "LAR", value: 82.2, projection: 19.1 },
  { id: "jsn", name: "Jaxon Smith-Njigba", pos: "WR", team: "SEA", value: 81.3, projection: 18.7 },
  { id: "lamb", name: "CeeDee Lamb", pos: "WR", team: "DAL", value: 75.1, projection: 18.2 },
  { id: "jeanty", name: "Ashton Jeanty", pos: "RB", team: "LV", value: 66.1, projection: 16.2 },
  { id: "allen", name: "Josh Allen", pos: "QB", team: "BUF", value: 51.8, projection: 23.8 },
  { id: "bowers", name: "Brock Bowers", pos: "TE", team: "LV", value: 49.5, projection: 14.2 },
  { id: "pickens", name: "George Pickens", pos: "WR", team: "DAL", value: 43.7, projection: 13.5 },
  { id: "mahomes", name: "Patrick Mahomes", pos: "QB", team: "KC", value: 31.5, projection: 20.1 },
  { id: "kelce", name: "Travis Kelce", pos: "TE", team: "KC", value: 26, projection: 11.3 },
  { id: "walker", name: "Kenneth Walker III", pos: "RB", team: "SEA", value: 38, projection: 13.3 },
  { id: "flowers", name: "Zay Flowers", pos: "WR", team: "BAL", value: 35, projection: 12.7 },
  { id: "cook", name: "James Cook", pos: "RB", team: "BUF", value: 57, projection: 16.0 },
  { id: "mcbride", name: "Trey McBride", pos: "TE", team: "ARI", value: 56, projection: 14.8 },
  { id: "brown", name: "A.J. Brown", pos: "WR", team: "PHI", value: 47, projection: 14.4 },
  { id: "kyren", name: "Kyren Williams", pos: "RB", team: "LAR", value: 48, projection: 14.6 },
  { id: "higgins", name: "Tee Higgins", pos: "WR", team: "CIN", value: 39, projection: 13.1 },
  { id: "burrow", name: "Joe Burrow", pos: "QB", team: "CIN", value: 34, projection: 21.1 },
  { id: "laporta", name: "Sam LaPorta", pos: "TE", team: "DET", value: 27, projection: 10.8 },
];
const INDEX = new Map(PLAYERS.map(p => [p.id, p]));
const LIMIT = 25;
const paper: CSSProperties = { background: "#fffdf6", border: "1px solid #c9bea9", padding: 18 };
const action: CSSProperties = { background: "#243026", color: "#fffdf6", border: 0, padding: "11px 15px", fontWeight: 800, cursor: "pointer" };
const input: CSSProperties = { background: "#fff", border: "1px solid #aaa08e", padding: 10, width: "100%", color: "#243026" };
const fmt = (n: number) => n.toFixed(1);
const unique = (ids: string[]) => [...new Set(ids)];
const sum = (ids: string[]) => ids.reduce((v, id) => v + (INDEX.get(id)?.value ?? 0), 0);
const names = (ids: string[]) => ids.map(id => INDEX.get(id)?.name ?? id).join(", ") || "Nobody";

// Demonstration-only lineup: QB, 2 RB, 2 WR, TE, FLEX (RB/WR/TE).
// This is not verified against the user's Yahoo lineup settings.
function lineupPoints(ids: string[]): number {
  const available = unique(ids).map(id => INDEX.get(id)).filter((p): p is Player => Boolean(p));
  const best = (pos: Player["pos"], count: number) => available.filter(p => p.pos === pos).sort((a, b) => b.projection - a.projection).slice(0, count);
  const starters = [...best("QB", 1), ...best("RB", 2), ...best("WR", 2), ...best("TE", 1)];
  const starterIds = new Set(starters.map(p => p.id));
  const flex = available.filter(p => p.pos !== "QB" && !starterIds.has(p.id)).sort((a, b) => b.projection - a.projection)[0];
  return starters.reduce((v, p) => v + p.projection, 0) + (flex?.projection ?? 0);
}
function packageValue(ids: string[], otherCount: number) {
  const raw = sum(ids);
  if (ids.length <= otherCount) return { raw, adjusted: raw, discount: 0 };
  const values = ids.map(id => INDEX.get(id)?.value ?? 0).sort((a, b) => b - a);
  const adjusted = (values[0] ?? 0) + values.slice(1).reduce((v, x) => v + x * 0.8, 0);
  return { raw, adjusted, discount: raw - adjusted };
}
function applyTrade(rosterA: string[], rosterB: string[], trade: Trade) {
  return {
    afterA: unique([...rosterA.filter(id => !trade.a.includes(id)), ...trade.b]),
    afterB: unique([...rosterB.filter(id => !trade.b.includes(id)), ...trade.a])
  };
}
function evaluate(rosterA: string[], rosterB: string[], trade: Trade): Assessment {
  const a = packageValue(trade.a, trade.b.length);
  const b = packageValue(trade.b, trade.a.length);
  const { afterA, afterB } = applyTrade(rosterA, rosterB, trade);
  const lineupA = lineupPoints(afterA) - lineupPoints(rosterA);
  const lineupB = lineupPoints(afterB) - lineupPoints(rosterB);
  // Small, bounded lineup correction in the SAME value scale; avoid overpowering base values.
  // When A benefits more, B's outgoing side is adjusted upward, and vice versa.
  const lineupEdge = Math.max(-8, Math.min(8, (lineupA - lineupB) * 0.6));
  const signedGap = a.adjusted - b.adjusted - lineupEdge;
  return {
    rawA: a.raw, rawB: b.raw, adjustedA: a.adjusted, adjustedB: b.adjusted,
    packageA: a.discount, packageB: b.discount,
    lineupA, lineupB, benefitA: lineupA, benefitB: lineupB,
    signedGap, gap: Math.abs(signedGap), allowed: Math.abs(signedGap) <= LIMIT + 1e-9
  };
}
function validTrade(rosterA: string[], rosterB: string[], trade: Trade) {
  return trade.a.length > 0 && trade.b.length > 0 && trade.a.length <= 3 && trade.b.length <= 3 &&
    unique(trade.a).length === trade.a.length && unique(trade.b).length === trade.b.length &&
    trade.a.every(id => rosterA.includes(id)) && trade.b.every(id => rosterB.includes(id));
}
function recommendationEngine(rosterA: string[], rosterB: string[], original: Trade): Suggestion[] {
  if (!validTrade(rosterA, rosterB, original)) return [];
  const seen = new Set<string>();
  const proposals: Trade[] = [];
  const add = (a: string[], b: string[]) => {
    const trade = { a: unique(a), b: unique(b) };
    if (!validTrade(rosterA, rosterB, trade)) return;
    const key = [...trade.a].sort().join("|") + "::" + [...trade.b].sort().join("|");
    if (seen.has(key)) return;
    seen.add(key);
    proposals.push(trade);
  };
  // Try minimal edits first: add, remove or replace one player on either side.
  for (const side of ["A", "B"] as const) {
    const current = side === "A" ? original.a : original.b;
    const roster = side === "A" ? rosterA : rosterB;
    const withSide = (ids: string[]) => side === "A" ? add(ids, original.b) : add(original.a, ids);
    for (const id of roster.filter(id => !current.includes(id))) {
      withSide([...current, id]);
      for (const existing of current) withSide([...current.filter(x => x !== existing), id]);
    }
    for (const existing of current) withSide(current.filter(id => id !== existing));
  }
  // Try small two-sided alternatives, capped to keep the browser responsive.
  const poolA = rosterA.slice(0, 16);
  const poolB = rosterB.slice(0, 16);
  for (const a of poolA) for (const b of poolB) add([a], [b]);
  const scored = proposals.map(trade => {
    const assessment = evaluate(rosterA, rosterB, trade);
    const originalIds = [...original.a, ...original.b];
    const newIds = [...trade.a, ...trade.b];
    const changes = originalIds.filter(id => !newIds.includes(id)).length + newIds.filter(id => !originalIds.includes(id)).length;
    // Prefer a passing trade that is close to the original, helps lineup fit,
    // and is not excessively one-sided. This is a ranking heuristic, not a claim of objective fairness.
    const positive = Math.max(-10, Math.min(10, assessment.lineupA)) + Math.max(-10, Math.min(10, assessment.lineupB));
    const quality = (assessment.allowed ? 100 : -100) - changes * 11 - assessment.gap * 0.30 + positive * 0.8;
    const reason = assessment.lineupA > 0 && assessment.lineupB > 0
      ? "Both teams improve their modeled starting lineups."
      : "A possible negotiation alternative; compare roster needs and risk before accepting.";
    return { trade, assessment, changes, quality, reason };
  }).filter(s => s.assessment.allowed).sort((a, b) => b.quality - a.quality);
  // Diverse recommendations; avoid repeating near-identical combinations.
  const result: Suggestion[] = [];
  for (const s of scored) {
    if (result.some(r => r.trade.a.join() === s.trade.a.join() || r.trade.b.join() === s.trade.b.join())) continue;
    result.push(s);
    if (result.length === 3) break;
  }
  return result;
}

export default function TradeHubPage() {
  // Explicit sample rosters: no Yahoo data is connected to this page yet.
  const [rosterA, setRosterA] = useState<string[]>(["gibbs", "allen", "pickens", "walker", "flowers", "kelce", "kyren", "laporta", "burrow"]);
  const [rosterB, setRosterB] = useState<string[]>(["lamb", "bowers", "bijan", "puka", "mahomes", "jeanty", "higgins", "brown", "cook", "mcbride", "jsn"]);
  const [trade, setTrade] = useState<Trade>({ a: ["gibbs"], b: ["lamb", "bowers"] });
  const [evaluated, setEvaluated] = useState(false);
  const [history, setHistory] = useState<Saved[]>([]);
  const [showRoster, setShowRoster] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const valid = validTrade(rosterA, rosterB, trade);
  const result = useMemo(() => valid ? evaluate(rosterA, rosterB, trade) : null, [rosterA, rosterB, trade, valid]);
  const suggestions = useMemo(() => valid && showRecommendations ? recommendationEngine(rosterA, rosterB, trade) : [], [rosterA, rosterB, trade, valid, showRecommendations]);

  function changeTrade(side: Side, id: string, add: boolean) {
    setTrade(t => ({ ...t, [side.toLowerCase()]: add ? [...t[side.toLowerCase() as "a" | "b"], id] : t[side.toLowerCase() as "a" | "b"].filter(x => x !== id) }));
    setEvaluated(false); setShowRecommendations(false);
  }
  function changeRoster(side: Side, id: string, add: boolean) {
    const setter = side === "A" ? setRosterA : setRosterB;
    const other = side === "A" ? rosterB : rosterA;
    if (add && other.includes(id)) return;
    setter(r => add ? unique([...r, id]) : r.filter(x => x !== id));
    setTrade(t => ({ a: side === "A" && !add ? t.a.filter(x => x !== id) : t.a, b: side === "B" && !add ? t.b.filter(x => x !== id) : t.b }));
    setEvaluated(false); setShowRecommendations(false);
  }
  function renderTradeSide(side: Side, roster: string[], selected: string[]) {
    return <section style={paper}>
      <h2 style={{ fontFamily: "Georgia,serif", fontSize: 24, marginBottom: 12 }}>TEAM {side} SENDS</h2>
      {selected.map(id => <div key={id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "9px 0", borderBottom: "1px solid #ded5c5" }}>
        <span><strong>{INDEX.get(id)?.name}</strong><div style={{ fontSize: 12, opacity: 0.7 }}>{INDEX.get(id)?.pos} · {fmt(INDEX.get(id)?.value ?? 0)} value</div></span>
        <button type="button" aria-label={`Remove ${INDEX.get(id)?.name}`} onClick={() => changeTrade(side, id, false)} style={{ cursor: "pointer", background: "transparent", border: "1px solid #c9bea9", padding: "2px 10px" }}>×</button>
      </div>)}
      <select aria-label={`Add player from Team ${side}`} value="" style={{ ...input, marginTop: 14 }} onChange={e => changeTrade(side, e.target.value, true)}>
        <option value="">Add player from Team {side}...</option>
        {roster.filter(id => !selected.includes(id)).map(id => <option key={id} value={id}>{INDEX.get(id)?.name} · {INDEX.get(id)?.pos} · {fmt(INDEX.get(id)?.value ?? 0)}</option>)}
      </select>
      <p style={{ marginTop: 12 }}><strong>Raw value: {fmt(sum(selected))}</strong></p>
    </section>;
  }
  function renderRoster(side: Side, roster: string[]) {
    const other = side === "A" ? rosterB : rosterA;
    return <section style={paper}>
      <h3 style={{ fontFamily: "Georgia,serif", fontSize: 21 }}>Team {side} roster ({roster.length})</h3>
      <p style={{ fontSize: 12, marginBottom: 12 }}>Add or remove sample players to test roster-aware analysis.</p>
      <div style={{ maxHeight: 220, overflowY: "auto" }}>{roster.map(id => <div key={id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", gap: 8 }}><span>{INDEX.get(id)?.name} <small>({INDEX.get(id)?.pos})</small></span><button type="button" onClick={() => changeRoster(side, id, false)} style={{ cursor: "pointer" }}>Remove</button></div>)}</div>
      <select aria-label={`Add to Team ${side} roster`} value="" style={{ ...input, marginTop: 12 }} onChange={e => changeRoster(side, e.target.value, true)}>
        <option value="">Add sample player...</option>
        {PLAYERS.filter(p => !roster.includes(p.id) && !other.includes(p.id)).map(p => <option key={p.id} value={p.id}>{p.name} · {p.pos}</option>)}
      </select>
    </section>;
  }
  function loadSuggestion(s: Suggestion) { setTrade({ a: [...s.trade.a], b: [...s.trade.b] }); setEvaluated(true); setShowRecommendations(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
  const statusColor = result?.allowed ? "#197a40" : "#b02d2d";
  return <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 18px 80px", color: "#253027" }}>
    <header style={{ textAlign: "center", borderBottom: "5px double #253027", paddingBottom: 20 }}>
      <Link href="/" style={{ fontSize: 13, textDecoration: "underline" }}>← BACK TO THE BOYS</Link>
      <p style={{ fontSize: 12, letterSpacing: 3, marginTop: 18 }}>THE BOYS LEAGUE HQ · COMMISSIONER'S EDITION</p>
      <h1 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(38px,7vw,72px)", margin: "10px 0" }}>THE TRADE HUB</h1>
      <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic" }}>Fair trades. Better negotiations. No charity cases.</p>
    </header>
    <div style={{ background: "#fff0c9", border: "1px solid #b39550", padding: 16, margin: "22px 0", lineHeight: 1.55 }}>
      <strong>DEMO MODE — NOT FOR OFFICIAL LEAGUE RULINGS</strong><div>Player values, weekly projections, and rosters are illustrative sample data, not live Yahoo data. The package and lineup adjustments are experimental heuristics, not verified RotoTrade formulas. Use this page to test the workflow until live roster data and calibrated valuations are connected.</div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 13, fontWeight: 800, marginBottom: 20 }}><span>10 TEAM · REDRAFT · FULL PPR</span><span>PACKAGE ADJUSTMENT: ON</span><span>LIMIT: 25.0 POINTS</span></div>
    <section style={{ ...paper, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}><div><h2 style={{ fontFamily: "Georgia,serif", fontSize: 22 }}>Team Rosters</h2><p style={{ fontSize: 13 }}>Demo rosters are editable. Both teams' complete rosters drive lineup-impact analysis and recommendations.</p></div><button type="button" style={action} onClick={() => setShowRoster(v => !v)}>{showRoster ? "HIDE ROSTERS" : "EDIT ROSTERS"}</button></div>
      {showRoster && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 12, marginTop: 14 }}>{renderRoster("A", rosterA)}{renderRoster("B", rosterB)}</div>}
    </section>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 18 }}>{renderTradeSide("A", rosterA, trade.a)}{renderTradeSide("B", rosterB, trade.b)}</div>
    {!valid && <p style={{ color: "#b02d2d", marginTop: 12 }}>Choose at least one player from each team's own roster (up to three per side).</p>}
    <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", margin: "22px 0" }}><button type="button" style={{ ...action, opacity: valid ? 1 : 0.5 }} disabled={!valid} onClick={() => { setEvaluated(true); setShowRecommendations(false); }}>EVALUATE TRADE</button><button type="button" style={{ ...action, background: "#e8e0d1", color: "#253027" }} onClick={() => { setTrade({ a: [], b: [] }); setEvaluated(false); setShowRecommendations(false); }}>CLEAR TRADE</button></div>
    {evaluated && result && <>
      <section style={{ ...paper, border: `2px solid ${statusColor}`, textAlign: "center", padding: 24 }}>
        <p style={{ fontWeight: 900, color: statusColor }}>PROVISIONAL {result.allowed ? "ALLOWED" : "VETOED"}</p>
        <p style={{ fontSize: 12, letterSpacing: 2, marginTop: 12 }}>FINAL ADJUSTED SEPARATION</p>
        <div style={{ fontSize: "clamp(52px,9vw,88px)", fontWeight: 900, color: statusColor }}>{fmt(result.gap)}</div>
        <p>25.0-point league threshold · package adjustment automatically applied when needed</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, textAlign: "left", marginTop: 20 }}>
          <div style={{ background: "#f4eee3", padding: 14 }}><strong>TEAM A</strong><p>Outgoing raw value: {fmt(result.rawA)}</p><p>Package discount: −{fmt(result.packageA)}</p><p>Outgoing adjusted value: {fmt(result.adjustedA)}</p><p>Modeled lineup change: <strong>{result.lineupA >= 0 ? "+" : ""}{fmt(result.lineupA)} pts/week</strong></p></div>
          <div style={{ background: "#f4eee3", padding: 14 }}><strong>TEAM B</strong><p>Outgoing raw value: {fmt(result.rawB)}</p><p>Package discount: −{fmt(result.packageB)}</p><p>Outgoing adjusted value: {fmt(result.adjustedB)}</p><p>Modeled lineup change: <strong>{result.lineupB >= 0 ? "+" : ""}{fmt(result.lineupB)} pts/week</strong></p></div>
        </div>
        <p style={{ fontSize: 12, marginTop: 14 }}>The final separation includes a capped lineup-impact correction. Standings and team records do not add penalty points.</p>
        <button type="button" style={{ ...action, marginTop: 15 }} onClick={() => setHistory(h => [{ date: new Date().toLocaleString(), label: `${names(trade.a)} for ${names(trade.b)}`, assessment: { ...result } }, ...h])}>SAVE SESSION EVALUATION</button>
      </section>
      <section style={{ ...paper, marginTop: 18 }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 27 }}>TRADE EVALUATION</h2>
        <p style={{ marginTop: 12 }}><strong>Team A:</strong> {result.lineupA > 0.2 ? `Modeled starters improve by ${fmt(result.lineupA)} points per week.` : result.lineupA < -0.2 ? `Modeled starters decline by ${fmt(Math.abs(result.lineupA))} points per week.` : "Modeled starting-lineup production is approximately unchanged."} {trade.b.length > trade.a.length ? "Receives additional depth but may need to open roster spots." : trade.b.length < trade.a.length ? "Consolidates multiple players into fewer roster spots." : "Exchanges an equal number of players."}</p>
        <p style={{ marginTop: 10 }}><strong>Team B:</strong> {result.lineupB > 0.2 ? `Modeled starters improve by ${fmt(result.lineupB)} points per week.` : result.lineupB < -0.2 ? `Modeled starters decline by ${fmt(Math.abs(result.lineupB))} points per week.` : "Modeled starting-lineup production is approximately unchanged."} {trade.a.length > trade.b.length ? "Receives additional depth but may need to open roster spots." : trade.a.length < trade.b.length ? "Consolidates multiple players into fewer roster spots." : "Exchanges an equal number of players."}</p>
        <p style={{ marginTop: 10, fontSize: 13, color: "#6c675e" }}>Roster impact is modeled with QB, 2 RB, 2 WR, TE and FLEX; actual Yahoo lineup slots, bye weeks, injuries, playoff context, waiver replacements and team intent are not yet imported. A stronger team or a losing record alone is never evidence of predatory trading.</p>
      </section>
      <section style={{ ...paper, marginTop: 18, borderTop: "4px double #253027" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 30 }}>THE GOOD FAITH TRADE</h2>
        <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", margin: "7px 0 14px" }}>Make the deal work. Don't kill the trade.</p>
        <p>Search both rosters for alternative offers that meet the same 25-point rule. Recommendations favor minimal changes and a reasonable modeled lineup fit—not an artificially perfect 0-point gap.</p>
        <button type="button" style={{ ...action, marginTop: 16 }} onClick={() => setShowRecommendations(true)}>FIND GOOD FAITH OFFERS</button>
        {showRecommendations && (suggestions.length === 0 ? <p style={{ marginTop: 16 }}>No passing alternatives found among the tested packages. Try editing the rosters or starting trade.</p> : <div style={{ display: "grid", gap: 12, marginTop: 16 }}>{suggestions.map((s, i) => <article key={i} style={{ border: "1px solid #c9bea9", padding: 14, background: "#faf5e9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}><strong>{i === 0 ? "BEST GOOD FAITH OFFER" : `ALTERNATIVE OFFER ${i + 1}`}</strong><strong style={{ color: "#197a40" }}>{fmt(s.assessment.gap)} · ALLOWED</strong></div>
          <p style={{ marginTop: 8 }}><strong>Team A sends:</strong> {names(s.trade.a)}</p><p><strong>Team B sends:</strong> {names(s.trade.b)}</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>{s.reason} Modeled weekly lineup impact: Team A {s.assessment.lineupA >= 0 ? "+" : ""}{fmt(s.assessment.lineupA)}, Team B {s.assessment.lineupB >= 0 ? "+" : ""}{fmt(s.assessment.lineupB)}.</p>
          <button type="button" style={{ ...action, marginTop: 12 }} onClick={() => loadSuggestion(s)}>TRY THIS TRADE</button>
        </article>)}</div>)}
      </section>
    </>}
    <section style={{ marginTop: 35, borderTop: "5px double #253027", paddingTop: 16 }}><h2 style={{ fontFamily: "Georgia,serif", fontSize: 29 }}>SESSION TRADE HISTORY</h2><p style={{ fontSize: 13, color: "#6c675e" }}>Temporary evaluations only. They disappear on refresh and are not official approved Yahoo trades.</p>{history.length === 0 ? <p style={{ ...paper, marginTop: 12 }}>No saved evaluations yet.</p> : history.map((h, i) => <div key={`${h.date}-${i}`} style={{ ...paper, marginTop: 10 }}><strong>{h.label}</strong><p style={{ color: h.assessment.allowed ? "#197a40" : "#b02d2d" }}>{fmt(h.assessment.gap)} · PROVISIONAL {h.assessment.allowed ? "ALLOWED" : "VETOED"}</p><small>{h.date}</small></div>)}</section>
  </main>;
}
