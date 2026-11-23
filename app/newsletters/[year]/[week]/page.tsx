
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublishedNewsletter,
} from "../../../../lib/published-newsletters";

export const dynamic = "force-dynamic";

export default async function EditionPage({
  params,
}: {
  params: Promise<{
    year: string;
    week: string;
  }>;
}) {
  const { year, week } = await params;

  const edition = await getPublishedNewsletter(
    Number(year),
    Number(week)
  );

  if (!edition) {
    notFound();
  }

  const intro = edition.sections.find(
    section => section.id === "intro"
  );

  const headline =
    intro?.title || "THE WEDNESDAY REPORT";

  const paragraphs = edition.sections.flatMap(
    section =>
      section.body
        .split(/\n\s*\n/)
        .map(paragraph => paragraph.trim())
        .filter(Boolean)
  );

  return (
    <main
      className="shell"
      style={{ maxWidth: 1000 }}
    >
      <div className="kicker">
        THE BOYS • WEDNESDAY REPORT • ARCHIVE
      </div>

      <article
        style={{
          background: "#f4f0e4",
          color: "#211f19",
          padding: "clamp(20px,4vw,52px)",
          border: "1px solid #c6beac",
          marginTop: 18,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, serif",
            textAlign: "center",
            fontSize: "clamp(42px,8vw,88px)",
            fontWeight: 900,
            borderBottom: "5px double #38352d",
          }}
        >
          The Boys
        </div>

        <p
          style={{
            textAlign: "center",
            fontWeight: 800,
            letterSpacing: 2,
            fontSize: 12,
          }}
        >
          SEASON {edition.year} • WEEK {edition.week}
        </p>

        <h1
          style={{
            textAlign: "center",
            fontFamily: "Georgia, serif",
            fontSize: "clamp(30px,5vw,54px)",
            lineHeight: 1.1,
            margin: "25px 0 35px",
          }}
        >
          {headline}
        </h1>

        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 17,
            lineHeight: 1.85,
          }}
        >
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              style={{
                marginBottom: 22,
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div
          style={{
            borderTop: "3px double #38352d",
            paddingTop: 15,
            marginTop: 35,
            textAlign: "center",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.5,
          }}
        >
          THE BOYS • ALL RECEIPTS PRESERVED
        </div>
      </article>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <Link
          className="button"
          href="/newsletters"
        >
          ← ALL EDITIONS
        </Link>

        <Link className="button" href="/">
          CURRENT FRONT PAGE
        </Link>
      </div>
    </main>
  );
}
