import type { CSSProperties } from "react";

const ink = "#211f19";
const muted = "#625e53";
const rule = "#38352d";
const label: CSSProperties = {
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.11em",
  textTransform: "uppercase",
};
const body: CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: 15,
  lineHeight: 1.65,
  color: ink,
};
const box: CSSProperties = {
  borderTop: `4px double ${rule}`,
  paddingTop: 16,
  minWidth: 0,
};
const pending = "Awaiting confirmed Yahoo league data";

export default function LeagueFrontPageExtras() {
  return (
    <section
      aria-label="Around The Boys League"
      style={{
        marginTop: 24,
        background: "#f4f0e4",
        border: "1px solid #c6beac",
        padding: "clamp(16px, 3vw, 38px)",
        color: ink,
        boxShadow: "0 10px 28px #14251f12",
      }}
    >
      <div style={{ ...label, textAlign: "center", color: muted }}>
        THE BOYS • LEAGUE DISPATCH
      </div>
      <h2
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "clamp(30px, 5vw, 49px)",
          lineHeight: 1.08,
          textAlign: "center",
          margin: "12px 0 14px",
          color: ink,
        }}
      >
        AROUND THE LEAGUE
      </h2>
      <p style={{ ...body, textAlign: "center", color: muted, marginBottom: 25 }}>
        Matchups, milestones and transactions — all in the same edition.
      </p>

      <div className="boys-extras-grid">
        <section style={box}>
          <div style={label}>THE FEATURED MATCHUP</div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 26, margin: "12px 0", color: ink }}>
            MATCHUP OF THE WEEK
          </h3>
          <p style={body}>{pending}. Once connected, this section will show the week's featured matchup, both teams, their records, projected scores and head-to-head history.</p>
          <p style={{ ...body, fontStyle: "italic", color: muted }}>
            The rivalry is real. The matchup details are pending.
          </p>
        </section>

        <section style={box}>
          <div style={label}>HISTORY IN THE MAKING</div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 26, margin: "12px 0", color: ink }}>
            RECORD WATCH
          </h3>
          <p style={body}>{pending}. This column will spotlight managers nearing all-time wins, scoring milestones, winning streaks and other verified records.</p>
          <p style={{ ...body, fontStyle: "italic", color: muted }}>
            The record book keeps receipts.
          </p>
        </section>

        <section style={box}>
          <div style={label}>THE TRANSACTION WIRE</div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 26, margin: "12px 0", color: ink }}>
            LEAGUE ACTIVITY
          </h3>
          <p style={body}>{pending}. Recent completed trades, waiver transactions, weekly honors and commissioner announcements will appear here directly.</p>
          <p style={{ ...body, fontStyle: "italic", color: muted }}>
            No rumor will be presented as a completed trade.
          </p>
        </section>
      </div>
      <style>{`
        .boys-extras-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }
        @media (max-width: 800px) {
          .boys-extras-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
