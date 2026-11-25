
const BASE_URL =
  "https://fantasysports.yahooapis.com/fantasy/v2/";

const MAX_ATTEMPTS = 3;
const MAX_WAIT_MS = 10000;
const REQUEST_TIMEOUT_MS = 10000;

export class YahooRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "YahooRequestError";
  }
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );
}

function retryDelay(
  response: Response,
  attempt: number
): number {
  const retryAfter =
    response.headers.get("retry-after");

  if (retryAfter) {
    const seconds = Number(retryAfter);

    if (
      Number.isFinite(seconds) &&
      seconds >= 0
    ) {
      return seconds * 1000;
    }

    const date = Date.parse(retryAfter);

    if (Number.isFinite(date)) {
      return Math.max(0, date - Date.now());
    }
  }

  return (
    1000 * Math.pow(2, attempt - 1) +
    Math.floor(Math.random() * 500)
  );
}

export function createYahooRequestSession(
  token: string,
  maxRequests = 20
) {
  if (
    !Number.isInteger(maxRequests) ||
    maxRequests < 1
  ) {
    throw new Error(
      "Invalid Yahoo request budget."
    );
  }

  let requestCount = 0;
  let stopped = false;

  async function request(
    path: string
  ): Promise<unknown> {
    if (stopped) {
      throw new Error(
        "Yahoo request session has stopped."
      );
    }

    if (
      !path ||
      path.startsWith("/") ||
      path.includes("://") ||
      path.includes("..") ||
      path.includes("\\")
    ) {
      throw new Error(
        "Invalid Yahoo API path."
      );
    }

    const url = new URL(BASE_URL + path);
    url.searchParams.set("format", "json");

    for (
      let attempt = 1;
      attempt <= MAX_ATTEMPTS;
      attempt++
    ) {
      if (
        stopped ||
        requestCount >= maxRequests
      ) {
        stopped = true;

        throw new Error(
          "Yahoo request budget exhausted."
        );
      }

      requestCount++;

      let response: Response;

      try {
        response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(
            REQUEST_TIMEOUT_MS
          ),
        });
      } catch {
        if (attempt === MAX_ATTEMPTS) {
          stopped = true;

          throw new Error(
            "Yahoo connection failed."
          );
        }

        await wait(
          1000 * Math.pow(2, attempt - 1)
        );

        continue;
      }

      if (response.ok) {
        const payload: unknown =
          await response.json();

        if (
          !payload ||
          typeof payload !== "object" ||
          !("fantasy_content" in payload)
        ) {
          stopped = true;

          throw new Error(
            "Unexpected Yahoo response."
          );
        }

        return payload;
      }

      const retryable =
        response.status === 429 ||
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504;

      if (
        !retryable ||
        attempt === MAX_ATTEMPTS
      ) {
        stopped = true;

        throw new YahooRequestError(
          response.status,
          `Yahoo API returned HTTP ${response.status}.`
        );
      }

      const delay = retryDelay(
        response,
        attempt
      );

      if (delay > MAX_WAIT_MS) {
        stopped = true;

        throw new YahooRequestError(
          response.status,
          "Yahoo requires a longer retry delay. " +
          "Processing stopped."
        );
      }

      await wait(delay);
    }

    stopped = true;

    throw new Error(
      "Yahoo request could not be completed."
    );
  }

  return {
    request,

    getUsage() {
      return {
        requests: requestCount,
        maximum: maxRequests,
        remaining:
          maxRequests - requestCount,
        stopped,
      };
    },
  };
}
