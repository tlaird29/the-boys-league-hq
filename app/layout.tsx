
import "./globals.css";

import type { Metadata } from "next";

import LeagueNavigation
  from "./components/league-navigation";

export const metadata: Metadata = {
  title:
    "The Boys | Fantasy Football HQ",

  description:
    "The Boys fantasy football history, records, rivalries and weekly recaps. Est. 2020.",
};

const tickerHeadlines = [
  {
    label: "LEAGUE HQ",

    text:
      "Welcome to THE BOYS BottomLine — the league never sleeps",
  },
  {
    label: "TRADE HUB",

    text:
      "Evaluate offers and negotiate with The Good Faith Trade",
  },
  {
    label: "RECORD WATCH",

    text:
      "The record book is waiting for its next headline",
  },
  {
    label: "HALL OF SHAME",

    text:
      "Every season deserves its own collection of disasters",
  },
  {
    label: "COMMISSIONER",

    text:
      "The official word comes straight from League HQ",
  },
];

function TickerItems() {
  return (
    <span className="boys-bottomline-items">
      {tickerHeadlines.map(
        (item, index) => (
          <span
            className="boys-bottomline-story"
            key={index}
          >
            <span className="boys-bottomline-category">
              {item.label}
            </span>

            <span className="boys-bottomline-headline">
              {item.text}
            </span>

            <span
              className="boys-bottomline-separator"
              aria-hidden="true"
            >
              ◆
            </span>
          </span>
        )
      )}
    </span>
  );
}

function BoysBottomLine() {
  return (
    <aside
      className="boys-bottomline"
      aria-label="The Boys league news ticker"
    >
      <div
        className="boys-bottomline-brand"
        aria-label="The Boys League HQ"
      >
        <span className="boys-bottomline-brand-main">
          THE BOYS
        </span>

        <span className="boys-bottomline-brand-sub">
          LEAGUE HQ
        </span>
      </div>

      <div
        className="boys-bottomline-live"
        aria-hidden="true"
      >
        <span className="boys-bottomline-dot" />
        NEWS
      </div>

      <div className="boys-bottomline-window">
        <div className="boys-bottomline-track">
          <TickerItems />

          <span aria-hidden="true">
            <TickerItems />
          </span>
        </div>
      </div>
    </aside>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LeagueNavigation />

        {children}

        <BoysBottomLine />

        <style>{`
          body {
            padding-bottom:
              calc(
                58px +
                env(
                  safe-area-inset-bottom,
                  0px
                )
              );
          }

          .boys-bottomline {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;

            z-index: 9999;

            display: flex;
            align-items: stretch;

            height:
              calc(
                58px +
                env(
                  safe-area-inset-bottom,
                  0px
                )
              );

            padding-bottom:
              env(
                safe-area-inset-bottom,
                0px
              );

            background: #14251f;
            color: #f5f7f5;

            border-top:
              3px solid #c9a64b;

            box-shadow:
              0 -4px 18px
              rgba(0,0,0,.24);

            overflow: hidden;

            font-family:
              'Barlow Condensed',
              Impact,
              'Arial Narrow',
              sans-serif;
          }

          .boys-bottomline-brand {
            position: relative;
            z-index: 2;

            flex: 0 0 auto;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            padding: 4px 17px;

            background: #c9a64b;
            color: #14251f;

            border-right:
              2px solid #f5d98b;

            white-space: nowrap;
          }

          .boys-bottomline-brand-main {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: .035em;
            line-height: .94;
          }

          .boys-bottomline-brand-sub {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .23em;
            margin-top: 4px;
          }

          .boys-bottomline-live {
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

          .boys-bottomline-dot {
            width: 7px;
            height: 7px;

            border-radius: 50%;
            background: #48d6a8;

            box-shadow:
              0 0 8px
              rgba(72,214,168,.55);
          }

          .boys-bottomline-window {
            min-width: 0;
            flex: 1;

            display: flex;
            align-items: center;

            overflow: hidden;

            mask-image:
              linear-gradient(
                to right,
                transparent,
                black 18px,
                black 98%,
                transparent
              );
          }

          .boys-bottomline-track {
            display: flex;
            align-items: center;

            width: max-content;
            flex: 0 0 auto;

            animation:
              boys-bottomline-scroll
              65s linear infinite;
          }

          .boys-bottomline-items {
            display: inline-flex;
            align-items: center;
            flex: 0 0 auto;
          }

          .boys-bottomline-story {
            display: inline-flex;
            align-items: center;

            gap: 11px;

            white-space: nowrap;
            padding-left: 23px;
          }

          .boys-bottomline-category {
            color: #f5d98b;

            font-size: 15px;
            font-weight: 900;
            letter-spacing: .065em;
          }

          .boys-bottomline-headline {
            color: #f5f7f5;

            font-size: 17px;
            font-weight: 700;
            letter-spacing: .025em;
          }

          .boys-bottomline-separator {
            color: #48d6a8;

            font-size: 11px;
            margin: 0 6px;
          }

          .boys-bottomline:hover
          .boys-bottomline-track {
            animation-play-state: paused;
          }

          @keyframes
          boys-bottomline-scroll {
            to {
              transform:
                translateX(-50%);
            }
          }

          @media (max-width: 600px) {
            .boys-bottomline-brand {
              padding: 4px 9px;
            }

            .boys-bottomline-brand-main {
              font-size: 18px;
            }

            .boys-bottomline-brand-sub {
              font-size: 8px;
            }

            .boys-bottomline-live {
              padding: 0 8px;
              font-size: 12px;
              gap: 5px;
            }

            .boys-bottomline-headline {
              font-size: 15px;
            }

            .boys-bottomline-category {
              font-size: 13px;
            }
          }

          @media (
            prefers-reduced-motion: reduce
          ) {
            .boys-bottomline-track {
              animation: none;
            }

            .boys-bottomline-window {
              overflow-x: auto;
              mask-image: none;
            }
          }
        `}</style>
      </body>
    </html>
  );
}
