
import Link from "next/link";

import type {
  RecordAlert,
} from "../../lib/record-alerts";

import type {
  CareerMilestone,
  ApproachingPlayerRecord,
} from "../../lib/record-milestones";

type Props = {
  alerts?: readonly RecordAlert[];

  milestones?:
    readonly CareerMilestone[];

  approaching?:
    readonly ApproachingPlayerRecord[];

  reportingPeriod?: string;
};

export default function RecordWatch({
  alerts = [],
  milestones = [],
  approaching = [],
  reportingPeriod,
}: Props) {
  const topAlerts = [...alerts]
    .sort(
      (a, b) =>
        b.priority - a.priority
    )
    .slice(0, 3);

  const topMilestones = [...milestones]
    .sort(
      (a, b) =>
        Number(b.status === "achieved") -
        Number(a.status === "achieved") ||
        a.remaining - b.remaining
    )
    .slice(0, 3);

  const topApproaching = [...approaching]
    .sort(
      (a, b) =>
        Number(b.type === "first-place") -
        Number(a.type === "first-place") ||
        a.pointsToPass - b.pointsToPass
    )
    .slice(0, 3);

  const hasNews =
    topAlerts.length > 0 ||
    topMilestones.length > 0 ||
    topApproaching.length > 0;

  const labelStyle = {
    fontFamily: "Arial, sans-serif",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "1.2px",
  } as const;

  const headlineStyle = {
    fontFamily: "Georgia, serif",
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1.4,
    margin: "8px 0",
  } as const;

  const storyStyle = {
    borderBottom: "1px solid #c6beac",
    padding: "16px 0",
  } as const;

  return (
    <section
      aria-label="Record Watch"
      style={{
        color: "#38352d",
        minWidth: 0,
      }}
    >
      <div
        style={{
          ...labelStyle,
          color: "#197655",
        }}
      >
        THE HISTORY DESK
      </div>

      <h2
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 30,
          fontWeight: 900,
          letterSpacing: "-1px",
          margin: "8px 0",
        }}
      >
        RECORD WATCH
      </h2>

      <div
        style={{
          ...labelStyle,
          color: "#766e60",
          paddingBottom: 12,
          borderBottom:
            "4px double #38352d",
        }}
      >
        {reportingPeriod ??
          "THE NEXT CHAPTER IN LEAGUE HISTORY"}
      </div>

      {!hasNews && (
        <div style={storyStyle}>
          <div
            style={{
              ...labelStyle,
              color: "#197655",
            }}
          >
            THE RECORD BOOK
          </div>

          <h3 style={headlineStyle}>
            History is waiting to be written.
          </h3>

          <p
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 15,
              lineHeight: 1.7,
              color: "#766e60",
            }}
          >
            Broken records, career milestones
            and historic performances will
            appear here when verified
            statistics are authorized for
            publication.
          </p>
        </div>
      )}

      {topAlerts.map(alert => (
        <article
          key={alert.id}
          style={storyStyle}
        >
          <div
            style={{
              ...labelStyle,
              color:
                alert.type === "new-record"
                  ? "#987322"
                  : "#197655",
            }}
          >
            {alert.type === "new-record"
              ? "NEW ALL-TIME RECORD"
              : alert.type === "tied-record"
                ? "RECORD TIED"
                : "RECORD BOOK UPDATE"}
          </div>

          <h3 style={headlineStyle}>
            {alert.headline}
          </h3>

          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 32,
              fontWeight: 900,
              color: "#197655",
            }}
          >
            {alert.points.toFixed(2)}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#766e60",
              marginTop: 5,
            }}
          >
            {alert.managerName} •{" "}
            {alert.season} • Week {alert.week}
          </div>
        </article>
      ))}

      {topMilestones.map(milestone => {
        const progress = Math.min(
          100,
          Math.max(
            0,
            milestone.target > 0
              ? milestone.current /
                milestone.target * 100
              : 0
          )
        );

        return (
          <article
            key={milestone.id}
            style={storyStyle}
          >
            <div
              style={{
                ...labelStyle,
                color: "#197655",
              }}
            >
              {milestone.status === "achieved"
                ? "MILESTONE ACHIEVED"
                : "MILESTONE WATCH"}
            </div>

            <h3 style={headlineStyle}>
              {milestone.headline}
            </h3>

            <div
              role="progressbar"
              aria-label={milestone.headline}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                Math.round(progress)
              }
              style={{
                height: 7,
                borderRadius: 10,
                background: "#ded7c8",
                overflow: "hidden",
                marginTop: 14,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "#197655",
                  borderRadius: 10,
                }}
              />
            </div>

            <p
              style={{
                fontSize: 12,
                color: "#766e60",
              }}
            >
              {milestone.current.toLocaleString(
                "en-US"
              )}{" "}
              /{" "}
              {milestone.target.toLocaleString(
                "en-US"
              )}
            </p>
          </article>
        );
      })}

      {topApproaching.map(record => (
        <article
          key={JSON.stringify([
            record.playerId,
            record.managerId,
            record.category,
            record.type,
          ])}
          style={storyStyle}
        >
          <div
            style={{
              ...labelStyle,
              color: "#197655",
            }}
          >
            {record.type === "first-place"
              ? "HISTORY WITHIN REACH"
              : "TOP 25 WATCH"}
          </div>

          <h3 style={headlineStyle}>
            {record.playerName}
          </h3>

          <div
            style={{
              fontSize: 27,
              fontWeight: 900,
              color: "#197655",
            }}
          >
            {record.pointsToPass.toFixed(2)}
            {" pts away"}
          </div>

          <p
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {record.headline}
          </p>
        </article>
      ))}

      <Link
        href="/records"
        style={{
          display: "inline-block",
          marginTop: 18,
          color: "#197655",
          fontSize: 12,
          fontWeight: 900,
          textDecoration: "underline",
          textUnderlineOffset: 4,
        }}
      >
        EXPLORE THE RECORD BOOK →
      </Link>
    </section>
  );
}
