
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Record Book",
    href: "/records",
  },
  {
    label: "Rafters",
    href: "/rafters",
  },
  {
    label: "Awards",
    href: "/awards",
  },
  {
    label: "Trade Hub",
    href: "/trade-hub",
  },
  {
    label: "Archives",
    href: "/newsletters",
  },
  {
    label: "Commissioner",
    href: "/commissioner",
  },
];

export default function LeagueNavigation() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <header className="league-header">
      <div className="league-header-inner">
        <Link
          href="/"
          className="league-brand"
          aria-label="The Boys League HQ homepage"
        >
          <span className="league-brand-name">
            THE BOYS
          </span>

          <span className="league-brand-subtitle">
            FANTASY FOOTBALL HQ · EST. 2020
          </span>
        </Link>

        <nav
          className="league-navigation"
          aria-label="Main league navigation"
        >
          {navigation.map(item => {
            const active =
              isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  active ? "page" : undefined
                }
                className={
                  active
                    ? "league-nav-link active"
                    : "league-nav-link"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <style jsx>{`
        .league-header {
          position: sticky;
          top: 0;
          z-index: 1000;

          width: 100%;
          background: #14251f;

          border-bottom:
            2px solid #48d6a8;

          box-shadow:
            0 4px 18px
            rgba(0, 0, 0, 0.22);
        }

        .league-header-inner {
          max-width: 1600px;
          margin: 0 auto;

          display: flex;
          align-items: center;

          gap: 28px;

          padding: 13px 24px;
        }

        .league-brand {
          display: flex;
          flex-direction: column;

          flex-shrink: 0;

          text-decoration: none;
          color: #48d6a8;
        }

        .league-brand-name {
          font-family:
            "Barlow Condensed",
            Impact,
            "Arial Narrow",
            sans-serif;

          font-size: 30px;
          font-weight: 900;

          letter-spacing: 0.045em;
          line-height: 1;
        }

        .league-brand-subtitle {
          margin-top: 5px;

          color: #b4ead9;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 0.12em;
          white-space: nowrap;
        }

        .league-navigation {
          display: flex;
          align-items: center;

          gap: 6px;

          min-width: 0;

          margin-left: auto;

          overflow-x: auto;

          scrollbar-width: thin;
          scrollbar-color:
            #365044 transparent;
        }

        .league-nav-link {
          flex-shrink: 0;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 42px;

          padding: 9px 14px;

          border-radius: 6px;

          color: #dce9e2;
          background: transparent;

          font-size: 13px;
          font-weight: 700;

          white-space: nowrap;
          text-decoration: none;

          transition:
            background 150ms ease,
            color 150ms ease;
        }

        .league-nav-link:hover {
          color: #48d6a8;
          background: #263d32;
        }

        .league-nav-link.active {
          color: #14251f;
          background: #48d6a8;
        }

        .league-nav-link:focus-visible,
        .league-brand:focus-visible {
          outline: 2px solid #f5d98b;
          outline-offset: 3px;
        }

        @media (max-width: 1100px) {
          .league-header-inner {
            flex-direction: column;
            align-items: flex-start;

            gap: 12px;
            padding: 12px 16px;
          }

          .league-navigation {
            width: 100%;
            margin-left: 0;
          }
        }

        @media (max-width: 600px) {
          .league-header-inner {
            gap: 9px;
            padding: 10px 12px;
          }

          .league-brand-name {
            font-size: 24px;
          }

          .league-brand-subtitle {
            font-size: 8px;
          }

          .league-nav-link {
            font-size: 12px;
            padding: 8px 12px;
          }
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          .league-nav-link {
            transition: none;
          }
        }
      `}</style>
    </header>
  );
}
