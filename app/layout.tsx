
import "./globals.css";

import type { Metadata } from "next";

import LeagueNavigation
  from "./components/league-navigation";

import BoysBottomLine
  from "./components/boys-bottomline";

import {
  buildLeagueNewsFeed,
} from "../lib/league-news-feed";

export const metadata: Metadata = {
  title:
    "The Boys | Fantasy Football HQ",

  description:
    "The Boys fantasy football history, records, rivalries and weekly recaps. Est. 2020.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headlines =
    buildLeagueNewsFeed();

  return (
    <html lang="en">
      <body>
        <LeagueNavigation />

        {children}

        <BoysBottomLine
          headlines={headlines}
        />

        <style>{`
          body {
            padding-bottom: calc(
              58px +
              env(
                safe-area-inset-bottom,
                0px
              )
            );
          }
        `}</style>
      </body>
    </html>
  );
}
