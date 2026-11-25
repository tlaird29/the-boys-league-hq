"use client";

import { useState } from "react";

import Link from "next/link";

import SeasonRecapPlayer
  from "../season-recap-player";

import type {
  SeasonRecap,
} from "../season-recaps";

import {
  createPendingSeasonAwards,
  type SeasonAward,
} from "../../lib/season-award-types";

import SeasonAwardCard
  from "./season-award-card";

export type AnnualAwardsEdition = {
  season: number;
  seasonComplete: boolean;
  historicalCoverageVerified: boolean;
  publicationAuthorized: boolean;
  awards: readonly SeasonAward[];
};

type Props = {
  recaps: readonly SeasonRecap[];
  editions?: readonly AnnualAwardsEdition[];
};

export default function AnnualAwardsCollection({
  recaps,
  editions = [],
}: Props) {
  const orderedRecaps = [...recaps].sort(
    (a, b) => b.year - a.year
  );

  const [selectedSeason, setSelectedSeason] =
    useState(
      orderedRecaps[0]?.year ?? 2020
    );

  const [filter, setFilter] =
    useState<
      "all" | "honors" | "shame"
    >("all");

  const selectedRecap =
    orderedRecaps.find(
      recap => recap.year === selectedSeason
    );

  const edition = editions.find(
    item => item.season === selectedSeason
  );

  const mayDisplayResults =
    edition?.seasonComplete === true &&
    edition.historicalCoverageVerified === true &&
    edition.publicationAuthorized === true;

  const pendingAwards =
    createPendingSeasonAwards(
      selectedSeason,
      edition?.seasonComplete === true
    );

  const awards = pendingAwards.map(
    pending => {
      if (!mayDisplayResults || !edition) {
        return pending;
      }

      const supplied = edition.awards.filter(
        award =>
          award.season === selectedSeason &&
          award.id === pending.id &&
          award.method === pending.method
      );

      if (supplied.length !== 1) {
        return pending;
      }

      const award = supplied[0];

      const validResult =
        award.recipients.length > 0 &&
        (
          (
            pending.method === "automatic" &&
            award.status === "calculated"
          ) ||
          (
            pending.method === "review" &&
            award.status === "approved"
          )
        );

      if (validResult) {
        return {
          ...pending,
          status: award.status,
          recipients: award.recipients,
          explanation: award.explanation,
        };
      }

      if (
        pending.method === "review" &&
        award.status === "awaiting-review"
      ) {
        return {
          ...pending,
          status: award.status,
          explanation: award.explanation,
        };
      }

      return pending;
    }
  );

  const honors = awards.filter(
    award => award.group === "honors"
  );

  const shame = awards.filter(
    award => award.group === "shame"
  );

  const completedAwards = awards.filter(
    award =>
      award.recipients.length > 0 &&
      (
        award.status === "calculated" ||
        award.status === "approved"
      )
  ).length;

  const champion = awards.find(
    award => award.id === "champion"
  )?.recipients[0];

  const progress =
    awards.length > 0
      ? completedAwards / awards.length * 100
      : 0;

  const filters = [
    { id: "all", label: "All Awards" },
    { id: "honors", label: "Annual Honors" },
    { id: "shame", label: "Hall of Shame" },
  ] as const;

  return (
    <div className="aac-root">
      <style>{`
        .aac-root {
          margin-top: 26px;
        }

        .aac-season-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin: 18px 0 24px;
        }

        .aac-season-button {
          background: #263d32;
          color: #ffffff;
          border: 1px solid #476055;
          border-radius: 8px;
          padding: 12px 19px;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
        }

        .aac-season-button[aria-pressed="true"] {
          background: #48d6a8;
          color: #14251f;
          border-color: #48d6a8;
        }

        .aac-season-button:focus-visible,
        .aac-filter:focus-visible {
          outline: 2px solid #c9a64b;
          outline-offset: 3px;
        }

        .aac-hero {
          background: linear-gradient(
            135deg,
            #14251f,
            #263d32
          );
          color: #ffffff;
          border: 1px solid #c9a64b;
          border-radius: 14px;
          padding: clamp(20px, 4vw, 36px);
        }

        .aac-kicker {
          color: #48d6a8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .aac-title {
          font-family: Georgia, serif;
          font-size: clamp(38px, 7vw, 68px);
          line-height: 1.05;
          margin: 14px 0;
        }

        .aac-stats {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 24px;
        }

        .aac-stat {
          background: #20382e;
          border: 1px solid #476055;
          border-radius: 9px;
          padding: 16px;
        }

        .aac-stat-label {
          color: #c5d4cd;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .aac-stat-value {
          color: #48d6a8;
          font-size: 32px;
          font-weight: 900;
          margin-top: 8px;
        }

        .aac-progress {
          height: 7px;
          border-radius: 999px;
          background: #476055;
          overflow: hidden;
          margin-top: 20px;
        }

        .aac-progress-fill {
          background: #48d6a8;
          height: 100%;
        }

        .aac-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 24px 0;
        }

        .aac-filter {
          background: #edf5f0;
          color: #14251f;
          border: 1px solid #dce7df;
          border-radius: 999px;
          padding: 10px 17px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .aac-filter[aria-pressed="true"] {
          background: #197655;
          color: #ffffff;
          border-color: #197655;
        }

        .aac-award-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .aac-section {
          margin-top: 32px;
        }

        .aac-section-heading {
          border-bottom: 2px solid #197655;
          padding-bottom: 15px;
        }

        .aac-section-heading h2 {
          font-size: clamp(26px, 4vw, 40px);
          margin: 8px 0;
        }

        .aac-shame-heading {
          border-bottom-color: #a43737;
        }

        @media (max-width: 950px) {
          .aac-award-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .aac-award-grid {
            grid-template-columns: 1fr;
          }

          .aac-stat {
            padding: 12px;
          }

          .aac-stat-value {
            font-size: 24px;
          }

          .aac-stat-label {
            font-size: 9px;
          }

          .aac-season-button {
            padding: 10px 14px;
          }
        }
      `}</style>

      <div className="label">
        SELECT AN ANNUAL EDITION
      </div>

      <nav
        className="aac-season-nav"
        aria-label="Select award season"
      >
        {orderedRecaps.map(recap => (
          <button
            type="button"
            key={recap.year}
            className="aac-season-button"
            aria-pressed={
              selectedSeason === recap.year
            }
            onClick={() =>
              setSelectedSeason(recap.year)
            }
          >
            {recap.year}
          </button>
        ))}
      </nav>

      <section className="aac-hero">
        <div className="aac-kicker">
          THE BOYS • ANNUAL AWARDS
        </div>

        <h2 className="aac-title">
          THE {selectedSeason} AWARDS
        </h2>

        <p
          style={{
            color: "#c5d4cd",
            lineHeight: 1.7,
          }}
        >
          The champions, legends,
          disasters and unforgettable
          moments that defined the season.
        </p>

        <div
          style={{
            background: "#101e18",
            border: "1px solid #c9a64b",
            borderRadius: 10,
            padding: 22,
            marginTop: 24,
            textAlign: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{ fontSize: 42 }}
          >
            🏆
          </div>

          <div
            style={{
              color: "#e9c875",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 2,
              marginTop: 10,
            }}
          >
            {selectedSeason} LEAGUE CHAMPION
          </div>

          <div
            style={{
              fontSize: "clamp(25px, 5vw, 42px)",
              fontWeight: 900,
              marginTop: 12,
              overflowWrap: "anywhere",
            }}
          >
            {champion?.teamName ??
              "CHAMPION PENDING"}
          </div>

          <p
            style={{
              color: "#c5d4cd",
              fontSize: 14,
            }}
          >
            {champion?.managerName ??
              "Awaiting verified and authorized championship results."}
          </p>

          <Link
            href="/rafters"
            style={{
              color: "#48d6a8",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Visit the Championship Rafters →
          </Link>
        </div>

        <div className="aac-stats">
          <div className="aac-stat">
            <div className="aac-stat-label">
              ANNUAL HONORS
            </div>

            <div className="aac-stat-value">
              {honors.length}
            </div>
          </div>

          <div className="aac-stat">
            <div className="aac-stat-label">
              HALL OF SHAME
            </div>

            <div className="aac-stat-value">
              {shame.length}
            </div>
          </div>

          <div className="aac-stat">
            <div className="aac-stat-label">
              AWARDS FINALIZED
            </div>

            <div className="aac-stat-value">
              {completedAwards}/{awards.length}
            </div>
          </div>
        </div>

        <div
          className="aac-progress"
          role="progressbar"
          aria-label="Annual awards finalized"
          aria-valuemin={0}
          aria-valuemax={awards.length}
          aria-valuenow={completedAwards}
        >
          <div
            className="aac-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#c5d4cd",
            lineHeight: 1.7,
            marginBottom: 0,
          }}
        >
          {mayDisplayResults
            ? "Verified results are available. Subjective awards require commissioner approval."
            : "Award recipients remain unpublished until season evidence and publication permissions are verified."}
        </p>
      </section>

      {selectedRecap && (
        <SeasonRecapPlayer
          recap={selectedRecap}
        />
      )}

      <div
        className="aac-filters"
        aria-label="Filter award categories"
      >
        {filters.map(item => (
          <button
            type="button"
            key={item.id}
            className="aac-filter"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filter !== "shame" && (
        <section className="aac-section">
          <div className="aac-section-heading">
            <div className="label">
              THE BEST OF {selectedSeason}
            </div>

            <h2>🏆 ANNUAL HONORS</h2>

            <p
              className="muted"
              style={{ lineHeight: 1.7 }}
            >
              The performances and decisions
              that earned a place in league
              history.
            </p>
          </div>

          <div className="aac-award-grid">
            {honors.map(award => (
              <SeasonAwardCard
                key={award.id}
                award={award}
              />
            ))}
          </div>
        </section>
      )}

      {filter !== "honors" && (
        <section className="aac-section">
          <div
            className={
              "aac-section-heading " +
              "aac-shame-heading"
            }
          >
            <div
              style={{
                color: "#a43737",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 1.5,
              }}
            >
              THE PERMANENT RECEIPTS
            </div>

            <h2>💀 HALL OF SHAME</h2>

            <p
              className="muted"
              style={{ lineHeight: 1.7 }}
            >
              Some seasons end with trophies.
              Others end with evidence.
            </p>
          </div>

          <div className="aac-award-grid">
            {shame.map(award => (
              <SeasonAwardCard
                key={award.id}
                award={award}
              />
            ))}
          </div>
        </section>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 28,
        }}
      >
        <Link
          className="button"
          href={`/seasons/${selectedSeason}`}
        >
          View {selectedSeason} Season Archive
        </Link>

        <Link
          className="button"
          href="/records"
        >
          All-Time Record Book
        </Link>
      </div>
    </div>
  );
}