
"use client";

import { useState } from "react";

import {
  DEFAULT_LEAGUE_NEWS,
  type LeagueNewsItem,
} from "../../lib/league-news-feed";

type Props = {
  headlines?: readonly LeagueNewsItem[];
};

export default function BoysBottomLine({
  headlines = DEFAULT_LEAGUE_NEWS,
}: Props) {
  const [paused, setPaused] =
    useState(false);

  const items =
    headlines.length > 0
      ? headlines.slice(0, 20)
      : DEFAULT_LEAGUE_NEWS;

  const totalCharacters =
    items.reduce(
      (total, item) =>
        total +
        item.category.length +
        item.headline.length,
      0
    );

  const duration = Math.max(
    45,
    totalCharacters / 7
  );

  function TickerItems() {
    return (
      <span className="bl-items">
        {items.map(item => (
          <span
            key={item.id}
            className="bl-story"
          >
            <span
              className={
                item.category === "BREAKING NEWS"
                  ? "bl-category bl-breaking"
                  : "bl-category"
              }
            >
              {item.category}
            </span>

            <span className="bl-headline">
              {item.headline}
            </span>

            <span
              className="bl-separator"
              aria-hidden="true"
            >
              ◆
            </span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <aside
      className="bl-root"
      aria-label="The Boys league news ticker"
    >
      <div className="bl-brand">
        <span className="bl-brand-main">
          THE BOYS
        </span>

        <span className="bl-brand-sub">
          LEAGUE HQ
        </span>
      </div>

      <div className="bl-news">
        <span className="bl-dot" />
        NEWS
      </div>

      <div className="bl-window">
        <div
          className="bl-track"
          style={{
            animationDuration:
              `${duration}s`,

            animationPlayState:
              paused
                ? "paused"
                : "running",
          }}
        >
          <TickerItems />

          <span aria-hidden="true">
            <TickerItems />
          </span>
        </div>
      </div>

      <button
        className="bl-pause"
        type="button"
        onClick={() =>
          setPaused(value => !value)
        }
        aria-label={
          paused
            ? "Resume news ticker"
            : "Pause news ticker"
        }
        title={
          paused
            ? "Resume ticker"
            : "Pause ticker"
        }
      >
        {paused ? "▶" : "Ⅱ"}
      </button>

      <style jsx global>{`
        .bl-root {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          display: flex;
          align-items: stretch;

          height: calc(
            58px +
            env(safe-area-inset-bottom, 0px)
          );

          padding-bottom:
            env(safe-area-inset-bottom, 0px);

          box-sizing: border-box;
          background: #14251f;
          color: #f5f7f5;
          border-top: 3px solid #c9a64b;
          box-shadow:
            0 -4px 18px rgba(0,0,0,.24);
          overflow: hidden;

          font-family:
            'Barlow Condensed',
            Impact,
            'Arial Narrow',
            sans-serif;
        }

        .bl-brand {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4px 17px;
          background: #c9a64b;
          color: #14251f;
          border-right: 2px solid #f5d98b;
          white-space: nowrap;
        }

        .bl-brand-main {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: .035em;
          line-height: .94;
        }

        .bl-brand-sub {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .23em;
          margin-top: 4px;
        }

        .bl-news {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 13px;
          background: #263d32;
          color: #48d6a8;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: .11em;
        }

        .bl-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #48d6a8;
        }

        .bl-window {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .bl-track {
          display: flex;
          align-items: center;
          width: max-content;
          flex: 0 0 auto;

          animation-name: bl-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .bl-items {
          display: inline-flex;
          align-items: center;
          flex: 0 0 auto;
        }

        .bl-story {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          white-space: nowrap;
          padding-left: 23px;
        }

        .bl-category {
          color: #f5d98b;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: .065em;
        }

        .bl-breaking {
          background: #a62d35;
          color: #ffffff;
          padding: 5px 9px;
          border-radius: 3px;
        }

        .bl-headline {
          color: #f5f7f5;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: .025em;
        }

        .bl-separator {
          color: #48d6a8;
          font-size: 11px;
          margin: 0 6px;
        }

        .bl-pause {
          flex: 0 0 40px;
          border: none;
          border-left: 1px solid #476055;
          background: #263d32;
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }

        .bl-pause:hover {
          background: #385447;
        }

        .bl-pause:focus-visible {
          outline: 2px solid #48d6a8;
          outline-offset: -4px;
        }

        .bl-root:hover .bl-track {
          animation-play-state:
            paused !important;
        }

        @keyframes bl-scroll {
          to {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 600px) {
          .bl-brand {
            padding: 4px 9px;
          }

          .bl-brand-main {
            font-size: 18px;
          }

          .bl-brand-sub {
            font-size: 8px;
          }

          .bl-news {
            padding: 0 8px;
            font-size: 12px;
          }

          .bl-headline {
            font-size: 15px;
          }

          .bl-category {
            font-size: 13px;
          }

          .bl-pause {
            flex-basis: 32px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bl-track {
            animation: none;
          }

          .bl-window {
            overflow-x: auto;
          }

          .bl-pause {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
