import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/account";
import { normalizeLoginIntent } from "@/lib/auth/roleRedirect";
import {
  getPostLoginRedirectPath,
  getSafePostLoginNext,
} from "@/lib/auth/postLogin";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://fixly.work"
  );
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  const intent = normalizeLoginIntent(
    request.nextUrl.searchParams.get("intent")
  );
  const next = getSafePostLoginNext(request.nextUrl.searchParams.get("next"));
  const lead = request.nextUrl.searchParams.get("lead") ?? undefined;

  if (!user) {
    const redirectUrl = new URL("/login", getAppUrl());
    redirectUrl.searchParams.set("intent", intent);
    redirectUrl.searchParams.set(
      "error",
      "Login session was not available on the server. Please log in again."
    );

    if (next) {
      redirectUrl.searchParams.set("next", next);
    }

    if (lead) {
      redirectUrl.searchParams.set("lead", lead);
    }

    return NextResponse.redirect(redirectUrl);
  }

  const redirectPath = await getPostLoginRedirectPath({
    userId: user.id,
    intent,
    next,
    lead,
  });

  const redirectUrl = new URL(redirectPath, getAppUrl());

  return NextResponse.redirect(redirectUrl);
}
