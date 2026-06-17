import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureFixaAccount } from "@/lib/fixa";
import {
  applySupabaseCookieMutations,
  clearSupabaseCookies,
  getSupabaseCookieOptionsForRequest,
} from "@/lib/auth/supabaseCookies";

type ProSignupBody = {
  email?: string;
  password?: string;
  lead?: string;
  next?: string;
};

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getSafeRedirectPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/pro/onboarding";
  }

  return value;
}

export async function POST(request: NextRequest) {
  const authCookiesToSet: CookieToSet[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: getSupabaseCookieOptionsForRequest(request),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          authCookiesToSet.push(...cookiesToSet);
        },
      },
    }
  );

  try {
    const body = (await request.json()) as ProSignupBody;

    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const lead = body.lead?.trim() ?? "";
    const redirectTo = getSafeRedirectPath(body.next);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdminClient();

    const { data: existingUsers, error: existingUsersError } =
      await admin.auth.admin.listUsers();

    if (existingUsersError) {
      return NextResponse.json(
        { error: "Unable to check existing users." },
        { status: 500 }
      );
    }

    const existingUser = existingUsers.users.find(
      (user) => user.email?.toLowerCase() === email
    );

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists. Please log in.",
          redirectTo: `/login?intent=pro&next=${encodeURIComponent(
            redirectTo
          )}`,
        },
        { status: 409 }
      );
    }

    const { data: createdUser, error: createUserError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: "pro",
        },
      });

    if (createUserError || !createdUser.user) {
      return NextResponse.json(
        { error: createUserError?.message ?? "Unable to create user." },
        { status: 400 }
      );
    }

    const userId = createdUser.user.id;

    const { error: profileError } = await admin.from("pro_profiles").upsert(
      {
        user_id: userId,
        email,
        contact_email: email,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    await ensureFixaAccount(userId);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json(
        {
          error: "Account created, but automatic login failed. Please log in.",
          redirectTo: `/login?intent=pro&next=${encodeURIComponent(
            redirectTo
          )}`,
        },
        { status: 500 }
      );
    }

    const finalRedirect = new URL(redirectTo, "https://fixly.work");

    if (lead) {
      finalRedirect.searchParams.set("lead", lead);
    }

    const response = NextResponse.json({
      ok: true,
      email,
      redirectTo: `${finalRedirect.pathname}${finalRedirect.search}`,
      existingUser: false,
    });

    clearSupabaseCookies(response, request.cookies.getAll(), {
      hostname: request.nextUrl.hostname,
      includeHostDomain: true,
    });
    applySupabaseCookieMutations(response, authCookiesToSet);

    return response;
  } catch (error) {
    console.error("Failed to create pro account", error);

    return NextResponse.json(
      { error: "Unable to create pro account." },
      { status: 500 }
    );
  }
}
