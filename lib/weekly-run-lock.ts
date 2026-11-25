
import { db } from "./yahoo";

export type RunMode =
  | "dry-run"
  | "production";

export type RunStatus =
  | "completed"
  | "failed";

export function getBoiseDate(
  date = new Date()
): string {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "America/Boise",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(date);

  const year = parts.find(
    part => part.type === "year"
  )?.value;

  const month = parts.find(
    part => part.type === "month"
  )?.value;

  const day = parts.find(
    part => part.type === "day"
  )?.value;

  if (!year || !month || !day) {
    throw new Error(
      "Could not determine local run date."
    );
  }

  return `${year}-${month}-${day}`;
}

export async function claimWeeklyRun(
  runDate: string,
  mode: RunMode = "dry-run"
): Promise<boolean> {
  const database = db();

  const { error } = await database
    .from("weekly_update_runs")
    .insert({
      run_date: runDate,
      run_mode: mode,
      status: "running",
    });

  if (error?.code === "23505") {
    return false;
  }

  if (error) {
    throw new Error(
      "Could not claim weekly update."
    );
  }

  return true;
}

export async function finishWeeklyRun(
  runDate: string,
  status: RunStatus,
  mode: RunMode = "dry-run"
): Promise<void> {
  const database = db();

  const { data, error } = await database
    .from("weekly_update_runs")
    .update({
      status,
      finished_at: new Date().toISOString(),
    })
    .eq("run_date", runDate)
    .eq("run_mode", mode)
    .eq("status", "running")
    .select("run_date")
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      "Could not finalize weekly update."
    );
  }
}
