import {
  createFictionalSeason,
  createDocumentaryTestInput,
  createFictionalScript,
} from "./documentary-test-data";

import {
  buildSeasonProgression,
} from "./season-progression";

import {
  detectSeasonStorylines,
} from "./season-storylines";

import {
  buildDocumentaryHistory,
} from "./documentary-history";

import {
  buildCompleteDocumentaryBrief,
} from "./documentary-complete-brief";

import {
  prepareDocumentaryGeneration,
} from "./documentary-script-generator";

import {
  validateDocumentaryScript,
} from "./documentary-script-validation";

import type {
  DocumentaryScript,
} from "./documentary-script-types";

type TestResult = {
  name: string;
  passed: boolean;
  error?: string;
};

function assert(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function runDocumentaryTests() {
  const results: TestResult[] = [];

  function test(
    name: string,
    run: () => void
  ) {
    try {
      run();

      results.push({
        name,
        passed: true,
      });
    } catch (error) {
      results.push({
        name,
        passed: false,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }

  function fixture() {
    const input =
      createDocumentaryTestInput();

    const result =
      buildCompleteDocumentaryBrief(
        input
      );

    assert(
      result.verified &&
      result.brief,
      "Unable to build fictional brief."
    );

    const brief = result.brief;

    const script =
      createFictionalScript(
        brief.season,
        brief.centralStory.id,
        brief.championship.id
      );

    return {
      input,
      brief,
      script,
    };
  }

  function rejectScript(
    mutate: (
      script: DocumentaryScript
    ) => void
  ) {
    const {
      brief,
      script,
    } = fixture();

    mutate(script);

    const result =
      validateDocumentaryScript(
        script,
        brief
      );

    assert(
      !result.verified,
      "Invalid script was accepted."
    );
  }

  // 1
  test(
    "Complete regular-season progression",
    () => {
      const result =
        buildSeasonProgression(
          createFictionalSeason()
        );

      assert(
        result.verified,
        result.issues.join("; ")
      );

      assert(
        result.snapshots.length === 14,
        "Expected 14 weekly snapshots."
      );

      assert(
        result.snapshots.every(
          rows => rows.length === 10
        ),
        "Incomplete manager coverage."
      );
    }
  );

  // 2
  test(
    "Missing regular-season matchup rejected",
    () => {
      const season =
        createFictionalSeason();

      const result =
        buildSeasonProgression({
          ...season,
          games: season.games.slice(1),
        });

      assert(
        !result.verified,
        "Missing matchup was accepted."
      );
    }
  );

  // 3
  test(
    "Duplicate matchup rejected",
    () => {
      const season =
        createFictionalSeason();

      const result =
        buildSeasonProgression({
          ...season,

          games: [
            ...season.games,
            season.games[0],
          ],
        });

      assert(
        !result.verified,
        "Duplicate matchup was accepted."
      );
    }
  );

  // 4
  test(
    "Conflicting winner rejected",
    () => {
      const season =
        createFictionalSeason();

      const games =
        season.games.map(
          (game, index) =>
            index === 0
              ? {
                  ...game,

                  winnerManagerId:
                    game.winnerManagerId ===
                      game.a.managerId
                      ? game.b.managerId
                      : game.a.managerId,
                }
              : game
        );

      assert(
        !buildSeasonProgression({
          ...season,
          games,
        }).verified,

        "Conflicting winner was accepted."
      );
    }
  );

  // 5
  test(
    "Dominant championship detected",
    () => {
      const result =
        detectSeasonStorylines(
          createFictionalSeason(
            2020,
            "dominant"
          )
        );

      assert(
        result.verified,
        result.issues.join("; ")
      );

      assert(
        result.storylines.some(
          story =>
            story.type === "dominance"
        ),
        "Dominance storyline missing."
      );
    }
  );

  // 6
  test(
    "Championship comeback detected",
    () => {
      const season =
        createFictionalSeason(
          2020,
          "comeback"
        );

      const result =
        detectSeasonStorylines(
          season
        );

      assert(
        result.verified,
        result.issues.join("; ")
      );

      assert(
        result.storylines.some(
          story =>
            story.type === "comeback" &&
            story.managerIds.includes(
              season.managerIds[0]
            )
        ),
        "Comeback storyline missing."
      );
    }
  );

  // 7
  test(
    "Incomplete championship bracket rejected",
    () => {
      const season =
        createFictionalSeason();

      const result =
        detectSeasonStorylines({
          ...season,

          games: season.games.filter(
            game => game.week !== 17
          ),
        });

      assert(
        !result.verified,
        "Missing final was accepted."
      );
    }
  );

  // 8
  test(
    "First championship identified",
    () => {
      const result =
        buildDocumentaryHistory(
          createDocumentaryTestInput()
        );

      assert(
        result.verified,
        result.issues.join("; ")
      );

      assert(
        result.stories.some(
          story =>
            story.type ===
              "first-championship"
        ),
        "First championship missing."
      );
    }
  );

  // 9
  test(
    "Consecutive championships identified",
    () => {
      const result =
        buildDocumentaryHistory({
          fictional: true,

          current:
            createFictionalSeason(
              2021
            ),

          previousSeasons: [
            createFictionalSeason(
              2020
            ),
          ],
        });

      assert(
        result.verified,
        result.issues.join("; ")
      );

      assert(
        result.stories.some(
          story =>
            story.type ===
              "repeat-champion"
        ),
        "Repeat championship missing."
      );
    }
  );

  // 10
  test(
    "Incomplete historical coverage rejected",
    () => {
      const result =
        buildDocumentaryHistory({
          fictional: true,

          current:
            createFictionalSeason(
              2022
            ),

          previousSeasons: [
            createFictionalSeason(
              2020
            ),
          ],
        });

      assert(
        !result.verified,
        "Missing historical season accepted."
      );
    }
  );

  // 11
  test(
    "Different seasons receive different central stories",
    () => {
      const dominant =
        buildCompleteDocumentaryBrief(
          createDocumentaryTestInput(
            "dominant"
          )
        );

      const comeback =
        buildCompleteDocumentaryBrief(
          createDocumentaryTestInput(
            "comeback"
          )
        );

      assert(
        dominant.brief &&
        comeback.brief,
        "Missing documentary brief."
      );

      assert(
        dominant.brief.centralStory.type !==
          comeback.brief.centralStory.type,

        "Different seasons received identical central story types."
      );
    }
  );

  // 12
  test(
    "Unavailable player evidence disclosed",
    () => {
      const result =
        buildCompleteDocumentaryBrief(
          createDocumentaryTestInput()
        );

      assert(
        result.brief &&
        !result.brief.coverage.players,

        "Missing player evidence marked verified."
      );

      assert(
        result.warnings.some(
          warning =>
            warning.includes(
              "Individual player evidence"
            )
        ),

        "Missing evidence warning absent."
      );
    }
  );

  // 13
  test(
    "Script request remains offline",
    () => {
      const result =
        prepareDocumentaryGeneration(
          createDocumentaryTestInput()
        );

      assert(
        result.verified &&
        result.request,
        "Script request preparation failed."
      );

      assert(
        result.aiRequests === 0 &&
        result.yahooRequests === 0 &&
        result.request.externalSubmissionEnabled ===
          false,

        "External processing was enabled."
      );
    }
  );

  // 14
  test(
    "Valid fictional script accepted",
    () => {
      const {
        brief,
        script,
      } = fixture();

      const result =
        validateDocumentaryScript(
          script,
          brief
        );

      assert(
        result.verified &&
        result.review,

        result.issues.join("; ")
      );

      assert(
        result.review.totalSeconds === 120 &&
        result.review.totalFrames === 3600,

        "Incorrect production timeline."
      );
    }
  );

  // 15
  test(
    "Invalid JSON rejected",
    () => {
      const { brief } = fixture();

      assert(
        !validateDocumentaryScript(
          "{invalid-json",
          brief
        ).verified,

        "Invalid JSON was accepted."
      );
    }
  );

  // 16
  test(
    "Incorrect season rejected",
    () => {
      rejectScript(
        script => {
          script.season++;
        }
      );
    }
  );

  // 17
  test(
    "Unknown central storyline rejected",
    () => {
      rejectScript(
        script => {
          script.centralStoryId =
            "invented-story";
        }
      );
    }
  );

  // 18
  test(
    "Insufficient scene count rejected",
    () => {
      rejectScript(
        script => {
          script.scenes =
            script.scenes.slice(0, 4);
        }
      );
    }
  );

  // 19
  test(
    "Incorrect video duration rejected",
    () => {
      rejectScript(
        script => {
          script.scenes[0]
            .durationSeconds++;
        }
      );
    }
  );

  // 20
  test(
    "Unknown evidence rejected",
    () => {
      rejectScript(
        script => {
          script.scenes[0]
            .evidenceIds.push(
              "invented-evidence"
            );
        }
      );
    }
  );

  // 21
  test(
    "Unapproved league lore rejected",
    () => {
      rejectScript(
        script => {
          script.scenes[0]
            .loreIds.push(
              "unapproved-lore"
            );
        }
      );
    }
  );

  // 22
  test(
    "Previously used title rejected",
    () => {
      const {
        brief,
        script,
      } = fixture();

      const result =
        validateDocumentaryScript(
          script,
          {
            ...brief,

            previousDocumentaries: {
              ...brief.previousDocumentaries,

              titles: [
                script.title,
              ],
            },
          }
        );

      assert(
        !result.verified,
        "Repeated title was accepted."
      );
    }
  );

  // 23
  test(
    "Previously used narration rejected",
    () => {
      const {
        brief,
        script,
      } = fixture();

      const result =
        validateDocumentaryScript(
          script,
          {
            ...brief,

            previousDocumentaries: {
              ...brief.previousDocumentaries,

              openingLines: [
                "Every season begins with a clean scoreboard",
              ],
            },
          }
        );

      assert(
        !result.verified,
        "Repeated opening was accepted."
      );
    }
  );

  // 24
  test(
    "Missing closing phrase rejected",
    () => {
      rejectScript(
        script => {
          const last =
            script.scenes[
              script.scenes.length - 1
            ];

          last.narration =
            last.narration.replace(
              "ICE TF UP!",
              "See you next season!"
            );
        }
      );
    }
  );

  // 25
  test(
    "Validated script cannot bypass approval",
    () => {
      const {
        brief,
        script,
      } = fixture();

      const result =
        validateDocumentaryScript(
          script,
          brief
        );

      assert(
        result.verified &&
        result.review,
        result.issues.join("; ")
      );

      assert(
        result.review
          .commissionerApproved === false &&
        result.review
          .factualReviewRequired === true &&
        result.readyForRendering === false &&
        result.readyForPublication === false,

        "Approval or publication safeguards failed."
      );
    }
  );

  const passed =
    results.filter(
      result => result.passed
    ).length;

  const failed =
    results.length - passed;

  return {
    ok:
      failed === 0 &&
      results.length === 25,

    total: results.length,
    passed,
    failed,
    results,
  };
}