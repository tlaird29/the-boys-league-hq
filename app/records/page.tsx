
import Link from "next/link";

import PlayerLeaderboards
  from "../components/player-leaderboards";

import ManagerCareerTable
  from "../components/manager-career-table";

import ChampionshipLegacy
  from "../components/championship-legacy";

import ManagerTeamHistory
  from "../components/manager-team-history";

import LeagueRecordCategories
  from "../components/league-record-categories";

export default function RecordsPage() {
  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • EST. 2020
      </div>

      <h1>THE RECORD BOOK</h1>

      <p className="muted">
        Every legendary performance.
        Every championship.
        Every manager&apos;s legacy.
        The complete history of The Boys League.
      </p>

      <nav
        aria-label="Record Book sections"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          margin: "24px 0",
        }}
      >
        {[
          {
            label: "Player Records",
            href: "#player-records",
          },
          {
            label: "League Records",
            href: "#league-records",
          },
          {
            label: "Manager Careers",
            href: "#manager-careers",
          },
          {
            label: "Championships",
            href: "#championships",
          },
          {
            label: "Manager Archives",
            href: "#manager-archives",
          },
        ].map(item => (
          <a
            key={item.href}
            href={item.href}
            style={{
              background: "#263d32",
              color: "#ffffff",
              borderRadius: 9,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div
        id="player-records"
        style={{
          scrollMarginTop: 140,
        }}
      >
        <PlayerLeaderboards />
      </div>

      <div
        id="league-records"
        style={{
          scrollMarginTop: 140,
        }}
      >
        <LeagueRecordCategories />
      </div>

      <section
        id="manager-careers"
        style={{
          marginTop: 35,
          scrollMarginTop: 140,
        }}
      >
        <div
          style={{
            background: "#14251f",
            color: "#ffffff",
            borderRadius: 16,
            padding: 24,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              color: "#48d6a8",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            THE BOYS • MANAGER LEGACY
          </div>

          <h2
            style={{
              fontSize:
                "clamp(26px, 4vw, 38px)",
              margin: "12px 0",
            }}
          >
            THE ALL-TIME MANAGER RECORD BOOK
          </h2>

          <p
            style={{
              color: "#c5d4cd",
              lineHeight: 1.7,
            }}
          >
            From the inaugural 2020 season
            to the present day. Career wins,
            playoff success, scoring records,
            winning streaks and championship
            accomplishments.
          </p>
        </div>

        <ManagerCareerTable />
      </section>

      <div
        id="championships"
        style={{
          scrollMarginTop: 140,
        }}
      >
        <ChampionshipLegacy />

        <div
          style={{
            marginTop: 16,
            textAlign: "center",
          }}
        >
          <Link
            href="/rafters"
            className="button"
          >
            🏆 Visit the Championship Rafters
          </Link>
        </div>
      </div>

      <div
        id="manager-archives"
        style={{
          scrollMarginTop: 140,
        }}
      >
        <ManagerTeamHistory />
      </div>

      <footer
        style={{
          marginTop: 32,
          marginBottom: 24,
          padding: 20,
          border: "1px solid #dce7df",
          borderRadius: 12,
          background: "#f4f8f5",
          color: "#52665a",
          fontSize: 12,
          lineHeight: 1.8,
        }}
      >
        <strong>OFFICIAL RECORD BOOK RULES</strong>

        <p>
          Historical records begin with the
          2020 season. Career rankings include
          active managers only. Matchups against
          former managers count toward active
          managers&apos; career statistics.
        </p>

        <p>
          Official statistics include regular-season
          and championship-bracket playoff games.
          Consolation games are excluded from all
          official records.
        </p>

        <p>
          Individual player records reflect
          eligible starting-lineup contributions.
          Player contributions are credited to
          the fantasy manager receiving those
          points.
        </p>

        <p>
          Historical statistics remain unpublished
          until the underlying data has been
          verified and its use authorized.
        </p>
      </footer>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 24,
        }}
      >
        <Link
          href="/"
          className="button"
        >
          🏠 Home / League HQ
        </Link>

        <Link
          href="/rivalries"
          className="button"
        >
          Rivalries
        </Link>

        <Link
          href="/seasons"
          className="button"
        >
          Season Archives
        </Link>
      </div>
    </main>
  );
}
