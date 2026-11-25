
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  ["Dashboard", "/"],
  ["Record Book", "/records"],
  ["Rafters", "/rafters"],
  ["Season Awards", "/awards"],
  ["Rivalries", "/rivalries"],
  ["Season Archives", "/seasons"],
  ["Trade Hub", "/trade-hub"],
  ["Commissioner", "/commissioner"],
];

export default function LeagueNavigation() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/seasons") {
      return (
        pathname === "/seasons" ||
        pathname.startsWith("/seasons/") ||
        pathname === "/newsletters" ||
        pathname.startsWith("/newsletters/")
      );
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <>
      <header className="global-league-header">
        <nav
          className="global-league-nav"
          aria-label="League navigation"
        >
          {navigation.map(([label, href]) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={
                  active ? "page" : undefined
                }
                className={
                  active
                    ? "global-league-pill active"
                    : "global-league-pill"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <style jsx global>{`
        .global-league-header {
          position: sticky;
          top: 0;
          z-index: 1000;

          width: 100%;
          box-sizing: border-box;

          background: #14251f;

          padding: 24px 12px 38px;
        }

        .global-league-nav {
          display: flex;
          align-items: center;

          gap: 12px;

          width: 100%;

          overflow-x: auto;
          scrollbar-width: none;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .global-league-nav::-webkit-scrollbar {
          display: none;
        }

        .global-league-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          box-sizing: border-box;

          min-height: 51px;

          padding: 15px 20px;

          border-radius: 999px;

          background: #263d32;
          color: #ffffff;

          font-size: 18px;
          font-weight: 700;
          line-height: 21px;

          text-decoration: none;
          white-space: nowrap;

          transition:
            background 150ms ease,
            color 150ms ease;
        }

        .global-league-pill.active {
          background: #48d6a8;
          color: #14251f;
        }

        .global-league-pill:hover {
          background: #365548;
          color: #ffffff;
        }

        .global-league-pill.active:hover {
          background: #48d6a8;
          color: #14251f;
        }

        .global-league-pill:focus-visible {
          outline: 2px solid #48d6a8;
          outline-offset: -3px;
        }

        @media (max-width: 1100px) {
          .global-league-header {
            padding: 18px 12px 22px;
          }

          .global-league-nav {
            gap: 10px;
          }

          .global-league-pill {
            min-height: 46px;
            padding: 12px 17px;
            font-size: 15px;
          }
        }

        @media (max-width: 600px) {
          .global-league-header {
            padding: 12px 10px 16px;
          }

          .global-league-nav {
            gap: 8px;
          }

          .global-league-pill {
            min-height: 42px;
            padding: 10px 15px;
            font-size: 14px;
          }
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          .global-league-pill {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
