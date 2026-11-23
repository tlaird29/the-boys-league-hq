
import { NextResponse } from "next/server";
import { commissioner } from "../../../../lib/server-auth";
import { analyzeWeek } from "../../../../lib/matchup-analysis";
import { analyzeClutchImpact } from "../../../../lib/clutch-impact";
import { testWeekData } from "../../../../lib/test-week-data";
import { testGameTimings } from "../../../../lib/test-game-timings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Section = {
  id: string;
  title: string;
  body: string;
};

const sectionIds = [
  "intro",
  "matchup-1",
  "matchup-2",
  "matchup-3",
  "matchup-4",
  "matchup-5",
  "awards",
  "closing",
];

function validSections(value: unknown): value is Section[] {
  if (!Array.isArray(value) || value.length !== 8) {
    return false;
  }

  return value.every((section, index) => {
    return (
      section !== null &&
      typeof section === "object" &&
      section.id === sectionIds[index] &&
      typeof section.title === "string" &&
      section.title.length > 0 &&
      section.title.length <= 120 &&
      typeof section.body === "string" &&
      section.body.trim().length >= 40 &&
      section.body.length <= 12000
    );
  });
}

export async function POST() {
  const user = await commissioner();

  if (!user) {
    return NextResponse.json(
      { error: "Commissioner login required." },
      { status: 403 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY is missing in Vercel. " +
          "Add the API key and redeploy.",
      },
      { status: 503 }
    );
  }

  try {
    const analysis = analyzeWeek(testWeekData);

    const clutch = analyzeClutchImpact(
      testWeekData,
      analysis,
      testGameTimings
    );

    if (!analysis.scoringFinal) {
      return NextResponse.json(
        { error: "Weekly scoring is not final." },
        { status: 409 }
      );
    }

    const facts = {
      season: analysis.season,
      week: analysis.week,
      dataSource: analysis.source,
      scoringFinal: analysis.scoringFinal,
      awards: {
        goat: analysis.goat,
        bum: analysis.bum,
      },
      matchups: analysis.matchups.map(
        (matchup, index) => {
          const impact = clutch.matchups.find(
            item => item.matchupId === matchup.id
          );

          return {
            sectionId: `matchup-${index + 1}`,
            home: matchup.home,
            away: matchup.away,
            homeScore: matchup.homeScore,
            awayScore: matchup.awayScore,
            winner: matchup.winner,
            loser: matchup.loser,
            margin: matchup.margin,
            mostImpactful: impact?.mostImpactful ?? null,
            highestScorer: impact?.topScorer ?? null,
            biggestBust: matchup.biggestBust,
            overperformers: matchup.overperformers,
            underperformers: matchup.underperformers,
            benchOpportunities:
              matchup.benchOpportunities.slice(0, 3),
            positionalAdvantages:
              matchup.positionalAdvantages.slice(0, 3),
            gameWindows: impact?.gameTimeline ?? [],
            confirmedComeback:
              impact?.confirmedComeback ?? null,
          };
        }
      ),
    };

    const systemPrompt = `
You are the original sports columnist for
THE BOYS LEAGUE HQ, a private 10-manager
fantasy football league newspaper.

Your writing personality:
- Wild, funny, irreverent sports-radio energy.
- Sharp, original trash talk between friends.
- Strong storytelling and real football analysis.
- Fresh metaphors and jokes in every edition.
- Profanity is allowed when it makes the writing better.
- Avoid recycled jokes and repetitive introductions.
- Sound like a human sports columnist, not a chatbot.

League relationships for optional story flavor:
- Tyler is the commissioner.
- Cade and Caleb are brothers.
- Lane, Cody, and Caleb are roommates.
- Tyler and Hunter C. are cousins.
- Braden is notorious for questionable trade offers.
- Kyler is a frequent target of friendly group-chat jokes.
- Tyler G. balances family life with fantasy football.

These relationships are background context.
Do not invent actual conversations, trade offers,
injuries, quotes, or off-field events.

CRITICAL FACTUAL RULES:
1. The supplied JSON is the only source of sports facts.
2. Never invent player statistics, winners, margins,
   injuries, standings, transactions, or projections.
3. The data source is FICTIONAL TEST DATA.
   Write an entertaining simulated newspaper,
   not a claim about actual NFL or fantasy results.
4. Matchup MVP means the MOST IMPACTFUL winning
   player identified by the impact engine,
   not necessarily the highest scorer.
5. GOAT and BUM refer strictly to the highest and
   lowest weekly TEAM fantasy point totals.
6. A game window only tells you when a player's
   NFL game was scheduled.
7. Never claim a verified comeback, lead change,
   Sunday-night deficit, Monday-night miracle,
   or last-second victory unless confirmedComeback
   and chronological evidence support that claim.
8. A bench opportunity is a hypothetical swap,
   not proof that the manager made an unreasonable
   decision before kickoff.
9. Do not exaggerate shortened test rosters into
   complete real Yahoo rosters.
10. If evidence is missing, omit the claim.

WRITING FORMAT:
Produce exactly EIGHT sections, in this order:
intro, matchup-1, matchup-2, matchup-3,
matchup-4, matchup-5, awards, closing.

Opening:
One energetic sports-column introduction,
approximately 100-150 words.

Each matchup:
Approximately 150-220 words.
Write two or three flowing paragraphs.
Include final score, winner, key player impacts,
projection surprises, relevant bench decisions,
and game-window context where supported.
Explain WHY the matchup was won or lost.
Do not write bullet lists or stat tables.
Vary openings, punchlines, and transitions.

Awards:
One or two paragraphs explaining the GOAT and BUM
using the actual supplied team scores.

Closing:
One punchy paragraph with a memorable ending.
Finish with exactly: ICE TF UP! 🏈

Return valid JSON only, with this structure:
{
  "sections": [
    {
      "id": "intro",
      "title": "Original headline",
      "body": "Full article paragraphs"
    }
  ]
}

Use exactly the eight required IDs.
Each section must have a creative title and body.
Do not include markdown code fences.
`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model:
            process.env.NEWSLETTER_MODEL ||
            "gpt-4.1-mini",
          temperature: 0.9,
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content:
                "Write the complete fictional test " +
                "newspaper from these calculated facts:\n" +
                JSON.stringify(facts, null, 2),
            },
          ],
        }),
        signal: AbortSignal.timeout(45000),
      }
    );

    if (!response.ok) {
      const details = await response.text();

      console.error(
        "Article writer OpenAI error:",
        response.status,
        details.slice(0, 1000)
      );

      return NextResponse.json(
        {
          error:
            "Article generation failed (" +
            response.status +
            "). Check the OpenAI API key, " +
            "model access, and billing.",
        },
        { status: 502 }
      );
    }

    const completion = await response.json();

    const content =
      completion?.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      throw new Error("No article content returned.");
    }

    const parsed = JSON.parse(content);

    if (!validSections(parsed.sections)) {
      throw new Error(
        "Generated article has invalid sections."
      );
    }

    const sections = parsed.sections as Section[];

    if (
      !sections[7].body.trim().endsWith(
        "ICE TF UP! 🏈"
      )
    ) {
      throw new Error(
        "Generated article is missing the required ending."
      );
    }

    return NextResponse.json(
      {
        success: true,
        warning:
          "FICTIONAL TEST ARTICLE — NOT FOR PUBLICATION",
        year: analysis.season,
        week: analysis.week,
        sections,
        analysisSummary: {
          matchupCount: analysis.matchups.length,
          goat: analysis.goat,
          bum: analysis.bum,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Article writer failed:", error);

    return NextResponse.json(
      {
        error:
          "The article could not be generated " +
          "or validated. Check Vercel logs.",
      },
      { status: 500 }
    );
  }
}
