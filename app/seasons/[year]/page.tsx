
import Link from "next/link";

import { notFound } from "next/navigation";

import SeasonRecapPlayer
  from "../../season-recap-player";

import {
  getSeasonRecaps,
  awardCategories,
  shameCategories,
} from "../../season-recaps";

import SeasonOverview
  from "../../components/season-overview";

import SeasonStandings
  from "../../components/season-standings";

import SeasonPlayoffBracket
  from "../../components/season-playoff-bracket";

export const dynamic = "force-dynamic";

export const dynamicParams = true;

type AwardCategory = {
  icon: string;
  name: string;
  description: string;
};

function AwardSection({
  title,
  kicker,
  categories,
  shame = false,
}: {
  title: string;
  kicker: string;
  categories: readonly AwardCategory[];
  shame?: boolean;
}) {
  return (
    <section
      style={{
        background: "#ffffff",
        color: "#14251f",
        border: "1px solid #dce7df",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: shame
            ? "#302522"
            : "#14251f",
          color: "#ffffff",
          padding: 22,
        }}
      >
        <div
          style={{
            color: shame
              ? "#e9c875"
              : "#48d6a8",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          {kicker}
        </div>

        <h2 style={{ margin: "12px 0" }}>
          {title}
        </h2>
      </div>

      <div style={{ padding: 18 }}>
        {categories.map(category => (
          <article
            key={category.name}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: "18px 0",
              borderBottom:
                "1px solid #e2e9e4",
            }}
          >
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: 46,
                height: 46,
                flexShrink: 0,
                borderRadius: 10,
                background: "#edf5f0",
                fontSize: 25,
              }}
            >
              {category.icon}
            </div>

            <div style={{ flex: 1 }}>
              <strong
                style={{
                  fontSize: 16,
                }}
              >
                {category.name}
              </strong>

              <p
                style={{
                  color: "#68736d",
                  fontSize: 12,
                  lineHeight: 1.6,
                  margin: "6px 0",
                }}
              >
                {category.description}
              </p>

              <div
                style={{
                  color: "#197655",
                  fontSize: 11,
                  fontWeight: 800,
                  marginTop: 10,
                }}
              >
                {shame
                  ? "RECIPIENT PENDING"
                  : "WINNER PENDING"}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function SeasonYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;

  const recaps = getSeasonRecaps();

  const recap = recaps.find(
    item => String(item.year) === year
  );

  if (!recap) {
    notFound();
  }

  const previous = recaps.find(
    item => item.year === recap.year - 1
  );

  const next = recaps.find(
    item => item.year === recap.year + 1
  );

  const sections = [
    {
      label: "Season Finale",
      href: "#season-finale",
    },
    {
      label: "Season Overview",
      href: "#season-overview",
    },
    {
      label: "Standings",
      href: "#standings",
    },
    {
      label: "Playoffs",
      href: "#playoffs",
    },
    {
      label: "Awards",
      href: "#season-awards",
    },
    {
      label: "Hall of Shame",
      href: "#hall-of-shame",
    },
  ];

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • SEASON ARCHIVES • EST. 2020
      </div>

      <h1>{recap.year} SEASON ARCHIVE</h1>

      <p
        className="muted"
        style={{ fontSize: 18 }}
      >
        {recap.tagline}
      </p>

      <nav
        aria-label="Season navigation"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          margin: "24px 0",
        }}
      >
        {previous ? (
          <Link
            href={`/seasons/${previous.year}`}
            className="button"
          >
            ← {previous.year}
          </Link>
        ) : (
          <span />
        )}

        <Link
          href="/seasons"
          className="button"
        >
          All Seasons
        </Link>

        {next ? (
          <Link
            href={`/seasons/${next.year}`}
            className="button"
          >
            {next.year} →
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <nav
        aria-label="Season archive sections"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {sections.map(section => (
          <a
            key={section.href}
            href={section.href}
            style={{
              background: "#263d32",
              color: "#ffffff",
              borderRadius: 8,
              padding: "11px 15px",
              fontSize: 12,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div
        id="season-finale"
        style={{
          scrollMarginTop: 140,
        }}
      >
        <SeasonRecapPlayer recap={recap} />
      </div>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <div className="label">
          THE SEASON&apos;S STORY
        </div>

        <h2>🎙️ THE YEAR THAT WAS</h2>

        <p
          className="muted"
          style={{ lineHeight: 1.8 }}
        >
          {recap.story ??
            "The original season storyline, defining rivalries, biggest turning points and commissioner-approved inside jokes will appear here following historical review."}
        </p>

        {!recap.story && (
          <p
            className="muted"
            style={{ fontSize: 12 }}
          >
            Editorial direction: {recap.theme}.
            Not a verified account of the season.
          </p>
        )}
      </section>

      <div
        id="season-overview"
        style={{
          scrollMarginTop: 140,
        }}
      >
        <SeasonOverview
          year={recap.year}
        />
      </div>

      <div
        id="standings"
        style={{
          scrollMarginTop: 140,
        }}
      >
        <SeasonStandings
          year={recap.year}
        />
      </div>

      <div
        id="playoffs"
        style={{
          scrollMarginTop: 140,
        }}
      >
        <SeasonPlayoffBracket
          year={recap.year}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 20,
          marginTop: 24,
        }}
      >
        <div
          id="season-awards"
          style={{
            scrollMarginTop: 140,
          }}
        >
          <AwardSection
            title="🏆 THE SEASON AWARDS"
            kicker={`${recap.year} • SEASON HONORS`}
            categories={awardCategories}
          />
        </div>

        <div
          id="hall-of-shame"
          style={{
            scrollMarginTop: 140,
          }}
        >
          <AwardSection
            title="💀 THE HALL OF SHAME"
            kicker={`${recap.year} • THE RECEIPTS`}
            categories={shameCategories}
            shame
          />
        </div>
      </div>

      <section
        className="card"
        style={{
          marginTop: 24,
          lineHeight: 1.8,
        }}
      >
        <div className="label">
          HISTORICAL ACCURACY
        </div>

        <h2>THE OFFICIAL SEASON RECORD</h2>

        <p className="muted">
          Season standings preserve all
          participating managers, including
          former managers, while all-time
          manager rankings remain limited
          to active league members.
        </p>

        <p className="muted">
          Official scoring includes regular-season
          and championship-bracket matchups.
          Consolation games are excluded.
          Historical results, awards and
          newspaper editions require
          verification and appropriate
          publication authorization.
        </p>
      </section>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 26,
        }}
      >
        <Link
          href="/seasons"
          className="button"
        >
          All Season Archives
        </Link>

        <Link
          href="/awards"
          className="button"
        >
          Annual Season Finales
        </Link>

        <Link
          href="/newsletters"
          className="button"
        >
          Newspaper Archive
        </Link>

        <Link
          href="/rafters"
          className="button"
        >
          Championship Rafters
        </Link>

        <Link href="/" className="button">
          🏠 League HQ
        </Link>
      </div>
    </main>
  );
}
