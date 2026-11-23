
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
    if (!section || typeof section !== "object") {
      return false;
    }

    const item = section as Record<string, unknown>;

    return (
      item.id === sectionIds[index] &&
      typeof item.title === "string" &&
      item.title.length <= 120 &&
      (index === 0
        ? item.title.trim().length > 0
        : item.title.trim().length === 0) &&
      typeof item.body === "string" &&
      item.body.trim().length >= 40 &&
      item.body.length <= 12000
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
      { error: "OPENAI_API_KEY is missing in Vercel." },
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
      source: analysis.source,
      scoringFinal: analysis.scoringFinal,
      goat: analysis.goat,
      bum: analysis.bum,
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
You are the original fantasy football columnist
for THE BOYS LEAGUE HQ, a private 10-manager league.

YOUR PERSONALITY:
- Chaotic, irreverent sports-radio energy.
- Sharp, personalized trash talk among friends.
- Intelligent player-impact analysis.
- Original jokes, transitions, and roast angles.
- Natural profanity is welcome.
- Sound like a human columnist, not an AI.
- Avoid tired sports clichés and generic filler.
- Never recycle the same opening or punchline.

LEAGUE LORE:
- Tyler is the commissioner.
- Cade and Caleb are brothers.
- Lane, Cody, and Caleb are roommates.
- Tyler and Hunter C. are cousins.
- Braden is known for terrible trade offers.
- Kyler is a frequent target of friendly jokes.
- Tyler G. balances family life and fantasy.

Use these details selectively.
Never invent conversations, transactions,
quotes, or personal events.

FACTUAL ACCURACY:
- The provided JSON is the ONLY sports data source.
- Never invent scores, players, injuries,
  standings, statistics, or projections.
- This is FICTIONAL TEST DATA.
- Do not claim any verified comeback or lead
  change unless chronological evidence exists.
- A Monday night performance is not automatically
  a Monday night comeback.
- Game windows identify scheduled play times,
  not actual fantasy scoring sequences.
- Most impactful is different from highest scorer.
- GOAT means highest-scoring fantasy TEAM.
- BUM means lowest-scoring fantasy TEAM.
- Bench opportunities are hypothetical.
- Some fictional rosters are intentionally
  incomplete. Do not pretend otherwise.
- Do not invent playoff implications.
- Omit unsupported details.

THE ARTICLE FORMAT IS NON-NEGOTIABLE:

Write ONE continuously flowing sports article.

There must be ONE headline for the ENTIRE article.
There must be NO matchup headlines.
There must be NO subheadings.
There must be NO separate GOAT/BUM headline.
There must be NO bullet points or numbered lists.

Start with an original, attention-grabbing
introduction that captures the week's biggest
storylines without summarizing everything twice.

Flow through all FIVE matchups in natural prose.

Each matchup must have meaningful analysis:
- Final score and winning manager.
- The most consequential player performances.
- Projection surprises when available.
- Relevant bench decisions when supported.
- Timing of NFL games when meaningful.
- Why the result was significant.

Use varied transitions between matchups.
Never start every passage with the same pattern.

For example, a transition might connect a
blowout to a narrow victory, or move from a
family rivalry to a roommate rivalry.

Do not write five self-contained mini-articles.
Make the whole thing feel like one writer
telling one connected story.

Near the end, naturally discuss the GOAT
and BUM of the week within the article.
Do not create an awards heading.

Finish with a strong, original closing paragraph.
The exact final words must be:

ICE TF UP! 🏈

TARGET LENGTH:
Approximately 1,000 to 1,400 words total.
Prioritize quality and factual accuracy over
hitting an exact word count.

INTERNAL EDITOR FORMAT:
Our existing newsletter editor expects eight
internal sections. Keep that structure ONLY
for editing and database compatibility.

The eight section IDs, in exact order, are:
intro
matchup-1
matchup-2
matchup-3
matchup-4
matchup-5
awards
closing

The intro section must contain the ONLY headline.

Set the title of every other section to "".

Each section body should be natural paragraphs
that connect directly to the preceding and
following sections.

Do not put headings inside the body text.

Do not write "In conclusion," "Next up,"
or other mechanical section transitions.

Do not describe the fictional test disclaimer
inside the prose. The preview page will
display that warning prominently.

RETURN ONLY VALID JSON:

{
  "sections": [
    {
      "id": "intro",
      "title": "One original weekly headline",
      "body": "Opening paragraphs"
    },
    {
      "id": "matchup-1",
      "title": "",
      "body": "Continuous article paragraphs"
    }
  ]
}

Return all eight required sections.
Each body must contain at least 40 characters.
Only intro may have a nonempty title.
No markdown code fences.
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
                "Write one continuous fictional " +
                "weekly fantasy football article " +
                "using these verified test calculations:\n" +
                JSON.stringify(facts),
            },
          ],
        }),
        signal: AbortSignal.timeout(45000),
      }
    );

    if (!response.ok) {
      const details = await response.text();

      console.error(
        "OpenAI article generation error:",
        response.status,
        details.slice(0, 1000)
      );

      return NextResponse.json(
        {
          error:
            `Article generation failed (${response.status}). ` +
            "Check OpenAI API billing, model access, " +
            "and Vercel logs.",
        },
        { status: 502 }
      );
    }

    const completion = await response.json();

    const content =
      completion?.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      throw new Error("OpenAI returned no article.");
    }

    const parsed = JSON.parse(content);

    if (!validSections(parsed.sections)) {
      throw new Error(
        "Article failed the single-headline " +
        "and eight-section validation."
      );
    }

    const sections = parsed.sections as Section[];

    if (
      !sections[7].body.trim().endsWith("ICE TF UP! 🏈")
    ) {
      throw new Error(
        "Article is missing the required closing."
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
          "The article could not be generated or " +
          "validated. Check Vercel function logs.",
      },
      { status: 500 }
    );
  }
}
