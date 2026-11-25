
import "server-only";

export type HistoricalAccessAction =
  | "personal-retrieval"
  | "historical-retention"
  | "ai-processing"
  | "league-publication";

export function getHistoricalAccessPolicy() {
  // These are application safeguards,
  // not a substitute for Yahoo authorization.
  //
  // Keep disabled until the applicable
  // permissions have been reviewed.

  const permissions = {
    personalRetrieval: false,

    historicalRetention: false,

    aiProcessing: false,

    leaguePublication: false,
  } as const;

  return {
    permissions,

    fictionalTestingAllowed: true,

    automaticHistoricalImportAllowed: false,

    automaticNewsletterAllowed: false,

    mode: "fictional-only" as const,

    reason:
      "Live historical processing remains disabled " +
      "pending authorization and source verification.",
  };
}

export function assertHistoricalAccess(
  action: HistoricalAccessAction
): void {
  const {
    permissions,
  } = getHistoricalAccessPolicy();

  const allowed: Record<
    HistoricalAccessAction,
    boolean
  > = {
    "personal-retrieval":
      permissions.personalRetrieval,

    "historical-retention":
      permissions.historicalRetention,

    "ai-processing":
      permissions.aiProcessing,

    "league-publication":
      permissions.leaguePublication,
  };

  if (allowed[action] !== true) {
    throw new Error(
      `Historical access denied: ${action}.`
    );
  }
}
