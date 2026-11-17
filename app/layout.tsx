
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Boys | Fantasy Football HQ",
  description:
    "The Boys fantasy football history, records, rivalries and weekly recaps. Est. 2020.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            background: "#14251f",
            padding: "12px 24px",
            borderBottom: "1px solid #365044",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-block",
              color: "#48d6a8",
              fontWeight: 800,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            🏠 HOME | LEAGUE HQ
          </Link>
        </header>

        {children}
      </body>
    </html>
  );
}
