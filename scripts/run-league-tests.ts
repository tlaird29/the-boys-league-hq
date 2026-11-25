
import {
  runLeagueTests,
} from "../lib/league-test-runner";

async function main() {
  console.log(
    "\nTHE BOYS LEAGUE HQ"
  );

  console.log(
    "Automated Accuracy Testing\n"
  );

  const report = runLeagueTests();

  for (const suite of report.suites) {
    console.log(
      "\n" +
      (suite.ok ? "PASS" : "FAIL") +
      " — " +
      suite.name
    );

    console.log(
      `${suite.passed}/${suite.expectedTests} passed`
    );

    for (const result of suite.results) {
      console.log(
        `  ${result.passed ? "PASS" : "FAIL"}: ` +
        result.name
      );

      if (result.error) {
        console.error(
          `    ${result.error}`
        );
      }
    }

    if (suite.error) {
      console.error(suite.error);
    }
  }

  console.log(
    "\n================================"
  );

  console.log(
    "FINAL TEST RESULTS"
  );

  console.log(
    "================================"
  );

  console.table(report.summary);

  console.log(
    "Yahoo requests:",
    report.yahooRequests
  );

  console.log(
    "AI requests:",
    report.aiRequests
  );

  console.log(
    "Emails sent:",
    report.emailsSent
  );

  console.log(
    "Records published:",
    report.recordsPublished
  );

  const safe =
    report.yahooRequests === 0 &&
    report.aiRequests === 0 &&
    report.emailsSent === 0 &&
    report.recordsPublished === false &&
    report.liveProcessing === false;

  if (!report.ok || !safe) {
    console.error(
      "\nTESTING FAILED — REVIEW REQUIRED"
    );

    process.exitCode = 1;

    return;
  }

  console.log(
    "\nALL CONFIGURED TESTS PASSED"
  );

  process.exitCode = 0;
}

main().catch(error => {
  console.error(
    "Unexpected test execution failure:",
    error
  );

  process.exitCode = 1;
});
