import {
  getSeasonRecaps,
} from "../app/season-recaps";

export type AnnualDocumentaryStatus =
  | "awaiting-verified-history"
  | "awaiting-script-approval"
  | "awaiting-audio-production"
  | "awaiting-video-production"
  | "awaiting-final-approval"
  | "awaiting-publication-authorization"
  | "ready-for-publication";

export type DocumentaryArchiveEvidence = {
  season: number;
  fictional: boolean;
  seasonCompleted: boolean;
  historyVerified: boolean;
  scriptApproved: boolean;
  audioVerified: boolean;
  videoVerified: boolean;
  finalVideoApproved: boolean;
  publicationAuthorized: boolean;
};

export function evaluateDocumentaryArchive(
  evidence: DocumentaryArchiveEvidence
) {
  const blockers: string[] = [];

  if (
    !Number.isInteger(evidence.season) ||
    evidence.season < 2020
  ) {
    blockers.push("Invalid season.");
  }

  if (evidence.fictional !== false) {
    blockers.push(
      "Fictional demonstrations cannot enter the official archive."
    );
  }

  if (evidence.seasonCompleted !== true) {
    blockers.push(
      "Season completion is not verified."
    );
  }

  if (evidence.historyVerified !== true) {
    blockers.push(
      "Historical evidence is not verified."
    );
  }

  if (evidence.scriptApproved !== true) {
    blockers.push(
      "Commissioner script approval required."
    );
  }

  if (evidence.audioVerified !== true) {
    blockers.push(
      "Synchronized narration required."
    );
  }

  if (evidence.videoVerified !== true) {
    blockers.push(
      "Final video verification required."
    );
  }

  if (evidence.finalVideoApproved !== true) {
    blockers.push(
      "Commissioner final video approval required."
    );
  }

  if (evidence.publicationAuthorized !== true) {
    blockers.push(
      "Publication authorization required."
    );
  }

  let status: AnnualDocumentaryStatus;

  if (
    evidence.fictional !== false ||
    evidence.seasonCompleted !== true ||
    evidence.historyVerified !== true ||
    !Number.isInteger(evidence.season) ||
    evidence.season < 2020
  ) {
    status = "awaiting-verified-history";

  } else if (
    evidence.scriptApproved !== true
  ) {
    status = "awaiting-script-approval";

  } else if (
    evidence.audioVerified !== true
  ) {
    status = "awaiting-audio-production";

  } else if (
    evidence.videoVerified !== true
  ) {
    status = "awaiting-video-production";

  } else if (
    evidence.finalVideoApproved !== true
  ) {
    status = "awaiting-final-approval";

  } else if (
    evidence.publicationAuthorized !== true
  ) {
    status =
      "awaiting-publication-authorization";

  } else {
    status = "ready-for-publication";
  }

  return {
    season: evidence.season,
    status,
    blockers,
    requirementsSatisfied:
      blockers.length === 0,

    // Live publication is intentionally disabled.
    publicationEnabled: false as const,
    readyForPublication: false as const,
  };
}

export function getAnnualDocumentaryQueue(
  date = new Date()
) {
  return getSeasonRecaps(date).map(recap => {
    const evidence: DocumentaryArchiveEvidence = {
      season: recap.year,
      fictional: false,
      seasonCompleted: false,
      historyVerified: false,
      scriptApproved: false,
      audioVerified: false,
      videoVerified: false,
      finalVideoApproved: false,
      publicationAuthorized: false,
    };

    return {
      year: recap.year,
      archiveTitle: recap.title,
      archiveHref: `/seasons/${recap.year}`,
      evidence,
      ...evaluateDocumentaryArchive(evidence),
      videoUrl: null,
      downloadUrl: null,
      automaticProductionEnabled: false,
    };
  });
}