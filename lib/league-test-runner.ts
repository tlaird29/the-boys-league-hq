
import {
  runWeeklyInfrastructureTests,
} from "./weekly-infrastructure-tests";

import {
  runHistoricalTests,
} from "./historical-tests";

import {
  runHistoricalPipelineTests,
} from "./historical-pipeline-tests";

import {
  runOfficialMatchupTests,
} from "./official-matchup-tests";

type TestResult = {
  name: string;
  passed: boolean;
  error?: string;
};

type TestSuite = {
  ok: boolean;
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
};

function executeSuite(
  name: string,
  expectedTests: number,
  run: () => TestSuite
) {
  const started =
    Date.now();

  try {
    const suite =
      run();

    const passed =
      suite.results.filter(
        result =>
          result.passed
      ).length;

    const failed =
      suite.results.length -
      passed;

    const countVerified =
      suite.total === expectedTests &&
      suite.results.length ===
        expectedTests &&
      suite.passed === passed &&
      suite.failed === failed;

    return {
      name,

      ok:
        suite.ok &&
        countVerified &&
        failed === 0,

      executed: true,

      expectedTests,

      total:
        suite.results.length,

      passed,

      failed,

      countVerified,

      durationMs:
        Date.now() - started,

      results:
        suite.results,

      error:
        countVerified
          ? null
          : "Test count or result totals do not match.",
    };

  } catch (error) {
    return {
      name,

      ok: false,

      executed: false,

      expectedTests,

      total: 0,

      passed: 0,

      failed: 0,

      countVerified: false,

      durationMs:
        Date.now() - started,

      results:
        [] as TestResult[],

      error:
        error instanceof Error
          ? error.message
          : "Unexpected test suite error.",
    };
  }
}

export function runLeagueTests() {
  const started =
    Date.now();

  const suites = [
    executeSuite(
      "Weekly infrastructure",
      9,
      runWeeklyInfrastructureTests
    ),

    executeSuite(
      "Historical statistics and auditing",
      35,
      runHistoricalTests
    ),

    executeSuite(
      "Integrated historical pipeline",
      21,
      runHistoricalPipelineTests
    ),

    executeSuite(
      "Official matchup and schedule validation",
      15,
      runOfficialMatchupTests
    ),
  ];

  const expectedTests =
    suites.reduce(
      (total, suite) =>
        total +
        suite.expectedTests,
      0
    );

  const totalTests =
    suites.reduce(
      (total, suite) =>
        total + suite.total,
      0
    );

  const passedTests =
    suites.reduce(
      (total, suite) =>
        total + suite.passed,
      0
    );

  const failedTests =
    suites.reduce(
      (total, suite) =>
        total + suite.failed,
      0
    );

  const unexecutedTests =
    Math.max(
      0,
      expectedTests - totalTests
    );

  const ok =
    suites.every(
      suite => suite.ok
    ) &&
    totalTests === expectedTests &&
    passedTests === expectedTests &&
    failedTests === 0;

  return {
    ok,

    mode:
      "fictional-league-tests",

    summary: {
      expectedTests,

      totalTests,

      passedTests,

      failedTests,

      unexecutedTests,

      passPercentage:
        expectedTests > 0
          ? Math.round(
              passedTests /
              expectedTests *
              10000
            ) / 100
          : 0,

      suitesPassed:
        suites.filter(
          suite => suite.ok
        ).length,

      suitesTotal:
        suites.length,

      durationMs:
        Date.now() - started,
    },

    suites,

    yahooRequests: 0,
    aiRequests: 0,
    emailsSent: 0,

    liveProcessing: false,

    recordsPublished: false,
  };
}
