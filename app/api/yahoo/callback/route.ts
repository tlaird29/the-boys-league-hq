
import { NextRequest, NextResponse } from "next/server";
import { commissioner } from "../../../../lib/server-auth";
import { callbackUrl, db, encrypt } from "../../../../lib/yahoo";

export async function GET(request: NextRequest) {
  const siteUrl = new URL("/commissioner", request.url);

  const redirectWithStatus = (status: string) => {
    const url = new URL(siteUrl);
    url.searchParams.set("yahoo", status);

    const response = NextResponse.redirect(url);
    response.cookies.set("yahoo_oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/yahoo",
      maxAge: 0,
    });
    return response;
  };

  const user = await commissioner();

  if (!user) {
    return redirectWithStatus("sign_in_required");
  }

  const expectedState = request.cookies.get("yahoo_oauth_state")?.value;
  const receivedState = request.nextUrl.searchParams.get("state");

  if (
    !expectedState ||
    !receivedState ||
    expectedState !== receivedState
  ) {
    return redirectWithStatus("invalid_state");
  }

  const yahooError = request.nextUrl.searchParams.get("error");
  if (yahooError) {
    return redirectWithStatus("authorization_denied");
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return redirectWithStatus("missing_code");
  }

  const clientId = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return redirectWithStatus("missing_configuration");
  }

  try {
    const tokenResponse = await fetch(
      "https://api.login.yahoo.com/oauth2/get_token",
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: callbackUrl(),
        }),
        cache: "no-store",
      }
    );

    if (!tokenResponse.ok) {
      return redirectWithStatus("token_exchange_failed");
    }

    const tokens = await tokenResponse.json();

    if (
      !tokens.access_token ||
      !tokens.refresh_token ||
      !Number.isFinite(Number(tokens.expires_in))
    ) {
      return redirectWithStatus("invalid_tokens");
    }

    const { error } = await db()
      .from("yahoo_connections")
      .upsert({
        user_id: user.id,
        access_token_encrypted: encrypt(tokens.access_token),
        refresh_token_encrypted: encrypt(tokens.refresh_token),
        expires_at: new Date(
          Date.now() + Number(tokens.expires_in) * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return redirectWithStatus("storage_failed");
    }

    return redirectWithStatus("connected");
  } catch {
    return redirectWithStatus("connection_failed");
  }
}
