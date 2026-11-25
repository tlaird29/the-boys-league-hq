import type {
  SeasonAward,
  AwardStatus,
} from "../../lib/season-award-types";

const statusLabels: Record<AwardStatus, string> = {
  "awaiting-data": "AWAITING VERIFIED DATA",
  "awaiting-season-completion": "SEASON COMPLETION PENDING",
  "awaiting-review": "COMMISSIONER REVIEW PENDING",
  calculated: "STATISTICAL WINNER",
  approved: "COMMISSIONER APPROVED",
};

export default function SeasonAwardCard({
  award,
}: {
  award: SeasonAward;
}) {
  const isShame = award.group === "shame";

  const accent = isShame
    ? "#a43737"
    : "#197655";

  const hasRecipients =
    award.recipients.length > 0 &&
    (
      award.status === "calculated" ||
      award.status === "approved"
    );

  return (
    <article
      style={{
        background: "#ffffff",
        color: "#14251f",
        border: "1px solid #dce7df",
        borderLeft: `4px solid ${accent}`,
        borderRadius: 10,
        padding: 20,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            fontSize: 32,
            flexShrink: 0,
          }}
        >
          {award.icon}
        </div>

        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1,
              color: accent,
            }}
          >
            {award.season} SEASON
          </div>

          <h3
            style={{
              fontSize: 20,
              margin: "5px 0",
              lineHeight: 1.2,
            }}
          >
            {award.name}
          </h3>
        </div>
      </div>

      <p
        style={{
          color: "#68736d",
          fontSize: 13,
          lineHeight: 1.7,
          margin: "14px 0",
        }}
      >
        {award.description}
      </p>

      <div
        style={{
          display: "inline-block",
          background: hasRecipients
            ? isShame
              ? "#fbe9e9"
              : "#e3f5e9"
            : "#edf1ee",
          color: hasRecipients
            ? accent
            : "#68736d",
          borderRadius: 5,
          padding: "7px 10px",
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 0.5,
        }}
      >
        {statusLabels[award.status]}
      </div>

      {hasRecipients ? (
        <div style={{ marginTop: 18 }}>
          {award.recipients.length > 1 && (
            <div
              style={{
                color: accent,
                fontSize: 11,
                fontWeight: 900,
                marginBottom: 12,
              }}
            >
              SHARED AWARD
            </div>
          )}

          {award.recipients.map(
            (recipient, index) => (
              <div
                key={
                  recipient.managerId +
                  ":" +
                  (recipient.playerName ?? "") +
                  ":" +
                  (recipient.week ?? "") +
                  ":" +
                  index
                }
                style={{
                  borderTop: "1px solid #e2e9e4",
                  padding: "16px 0",
                }}
              >
                <div
                  style={{
                    color: accent,
                    fontSize: 25,
                    fontWeight: 900,
                    lineHeight: 1.15,
                    overflowWrap: "anywhere",
                  }}
                >
                  {recipient.playerName ??
                    recipient.managerName}
                </div>

                {recipient.playerName && (
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      marginTop: 6,
                    }}
                  >
                    {recipient.managerName}
                  </div>
                )}

                <div
                  style={{
                    color: "#68736d",
                    fontSize: 13,
                    marginTop: 6,
                  }}
                >
                  {recipient.teamName}
                </div>

                {recipient.value !== undefined && (
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      marginTop: 12,
                      fontVariantNumeric:
                        "tabular-nums",
                    }}
                  >
                    {recipient.unit === "points"
                      ? recipient.value.toFixed(2)
                      : recipient.value}

                    {recipient.unit && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "#68736d",
                          marginLeft: 6,
                        }}
                      >
                        {recipient.unit}
                      </span>
                    )}
                  </div>
                )}

                {recipient.week !== undefined && (
                  <div
                    style={{
                      color: "#68736d",
                      fontSize: 12,
                      fontWeight: 800,
                      marginTop: 6,
                    }}
                  >
                    WEEK {recipient.week}
                  </div>
                )}

                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    marginBottom: 0,
                  }}
                >
                  {recipient.evidence}
                </p>
              </div>
            )
          )}
        </div>
      ) : (
        <div
          style={{
            background: "#f5f7f5",
            borderRadius: 8,
            padding: 16,
            marginTop: 16,
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 900,
              color: "#68736d",
            }}
          >
            RECIPIENT PENDING
          </div>

          <p
            style={{
              color: "#68736d",
              fontSize: 12,
              lineHeight: 1.7,
              marginBottom: 0,
            }}
          >
            {award.explanation}
          </p>
        </div>
      )}

      {hasRecipients && (
        <p
          style={{
            borderTop: "1px solid #e2e9e4",
            paddingTop: 12,
            color: "#68736d",
            fontSize: 11,
            lineHeight: 1.6,
          }}
        >
          {award.explanation}
        </p>
      )}
    </article>
  );
}