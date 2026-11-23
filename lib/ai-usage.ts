
import { db } from "./yahoo";

export type AIUsageFeature =
  | "article-writer"
  | "newsletter-regeneration"
  | "automatic-newsletter";

type UsageInput = {
  feature: AIUsageFeature;
  model: string;
  season?: number;
  week?: number;
  sourceType: "test" | "yahoo" | "manual";
  inputTokens: number;
  outputTokens: number;
};

// USD per one million tokens.
// Update these prices if model pricing changes.
const PRICES: Record<
  string,
  { input: number; output: number }
> = {
  "gpt-4.1-mini": {
    input: 0.4,
    output: 1.6,
  },
};

export function estimateAICost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number | null {
  const price = PRICES[model];

  if (!price) return null;

  return (
    (inputTokens * price.input +
      outputTokens * price.output) /
    1_000_000
  );
}

export async function recordAIUsage(
  usage: UsageInput
): Promise<void> {
  const cost = estimateAICost(
    usage.model,
    usage.inputTokens,
    usage.outputTokens
  );

  if (cost === null) {
    console.warn(
      "AI usage not priced for model:",
      usage.model
    );
    return;
  }

  const { error } = await db()
    .from("ai_usage_log")
    .insert({
      feature: usage.feature,
      model: usage.model,
      season: usage.season ?? null,
      week: usage.week ?? null,
      source_type: usage.sourceType,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      estimated_cost_usd: cost,
    });

  if (error) {
    console.error(
      "AI usage tracking failed:",
      error
    );
    throw new Error(
      "Could not record AI usage."
    );
  }
}
