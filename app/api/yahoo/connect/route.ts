
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { commissioner } from "../../../../lib/server-auth";
import { callbackUrl } from "../../../../lib/yahoo";

export async function GET(request: NextRequest) {
  const user = await commissioner();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const clientId = process.env.YAHOO_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Yahoo Client ID is missing" },
      { status: 500 }
    );
  }

  const state = randomBytes(32).toString("hex");

  const authorizationUrl = new URL(
    "https://api.login.yahoo.com/oauth2/request_auth"
  );

  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", callbackUrl());
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set("yahoo_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/yahoo",
    maxAge: 600,
  });

  return response;
}
