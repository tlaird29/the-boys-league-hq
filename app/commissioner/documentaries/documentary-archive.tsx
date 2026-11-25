import Link from "next/link";

import {
  getAnnualDocumentaryQueue,
} from "../../../lib/documentary-archive-policy";

export default function DocumentaryArchive() {
  const seasons =
    getAnnualDocumentaryQueue();

  const requirements = [
    {
      key: "seasonCompleted",
      label: "Completed season",
    },
    {
      key: "historyVerified",
      label: "Verified historical evidence",
    },
    {
      key: "scriptApproved",
      label: "Commissioner script approval",
    },
    {
      key: "audioVerified",
      label: "Synchronized narration",
    },
    {
      key: "videoVerified",
      label: "Verified final video",
    },
    {
      key: "finalVideoApproved",
      label: "Commissioner video approval",
    },
    {
      key: "publicationAuthorized",
      label: "Publication authorization",
    },
  ] as const;

  const readyCount = seasons.filter(
    season => season.readyForPublication
  ).length;

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
        THE BOYS • DOCUMENTARY COLLECTION
      </div>

      <h2>ANNUAL PRODUCTION ARCHIVE</h2>

      <p style={{ opacity: 0.75 }}>
        One original documentary for each
        season of The Boys, beginning in
        2020. Future season entries are
        added automatically through the
        existing season archive calendar.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
          margin: "24px 0",
        }}
      >
        {[
          {
            label: "SEASON ARCHIVES",
            value: seasons.length,
          },
          {
            label: "AWAITING PRODUCTION",
            value: seasons.length - readyCount,
          },
          {
            label: "READY TO PUBLISH",
            value: readyCount,
          },
        ].map(item => (
          <div
            key={item.label}
            style={{
              background: "#0b1b15",
              border: "1px solid #315747",
              borderRadius: 8,
              padding: 18,
            }}
          >
            <div
              style={{
                color: "#48d6a8",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                marginTop: 8,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          border: "1px solid #c9a64b",
          background: "#201f16",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <strong
          style={{ color: "#e9c875" }}
        >
          PUBLICATION LOCKED
        </strong>

        <p>
          Real historical production is
          awaiting verified evidence and
          appropriate authorization.
          Fictional demonstrations are
          excluded from official archives.
        </p>

        <p style={{ opacity: 0.75 }}>
          This dashboard is a production
          planning queue. It does not
          generate, upload or publish
          videos automatically.
        </p>
      </div>

      {seasons.map(season => {
        const completed =
          requirements.filter(
            item => season.evidence[item.key]
          ).length;

        return (
          <article
            key={season.year}
            style={{
              background: "#0b1b15",
              border: "1px solid #315747",
              borderRadius: 10,
              padding: 18,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#48d6a8",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 1,
                  }}
                >
                  {season.year} SEASON
                </div>

                <h3>
                  {season.archiveTitle}
                </h3>
              </div>

              <span
                style={{
                  color: "#e9c875",
                  fontSize: 11,
                  fontWeight: 800,
                  border: "1px solid #c9a64b",
                  padding: "8px 10px",
                  borderRadius: 6,
                }}
              >
                {season.status
                  .replace(/-/g, " ")
                  .toUpperCase()}
              </span>
            </div>

            <p style={{ opacity: 0.75 }}>
              Target documentary duration:
              {" "}2 minutes.
              {" "}Original season-specific
              narration and graphics.
            </p>

            <div
              style={{
                height: 8,
                background: "#315747",
                borderRadius: 8,
                overflow: "hidden",
                marginTop: 18,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width:
                    `${completed / requirements.length * 100}%`,
                  background: "#48d6a8",
                }}
              />
            </div>

            <p
              style={{
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              {completed}/{requirements.length}
              {" "}production requirements
              verified
            </p>

            <details
              style={{
                margin: "18px 0",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                PRODUCTION REQUIREMENTS
              </summary>

              {requirements.map(item => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom:
                      "1px solid #315747",
                  }}
                >
                  <span
                    style={{
                      color:
                        season.evidence[item.key]
                          ? "#48d6a8"
                          : "#b4c8bf",
                    }}
                  >
                    {season.evidence[item.key]
                      ? "✓"
                      : "○"}
                  </span>

                  <span>
                    {item.label}
                  </span>
                </div>
              ))}
            </details>

            <Link
              href={season.archiveHref}
              style={{
                display: "inline-block",
                background: "#173d30",
                border: "1px solid #48d6a8",
                borderRadius: 7,
                padding: "10px 16px",
                color: "#edf7f1",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              OPEN {season.year} SEASON ARCHIVE
            </Link>
          </article>
        );
      })}

      <p
        style={{
          fontSize: 12,
          opacity: 0.65,
        }}
      >
        Production requirements remain
        unverified until authoritative
        evidence is connected. Demo script
        approvals and local video reviews
        do not satisfy official season
        publication requirements.
      </p>
    </section>
  );
}