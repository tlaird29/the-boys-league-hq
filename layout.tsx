import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "The Boys | Fantasy Football HQ",
  description: "The Boys fantasy football history, records, rivalries and weekly recaps. Est. 2020."
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}