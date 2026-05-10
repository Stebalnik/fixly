import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureFixaAccount } from "@/lib/fixa";

type ProSignupBody = {
  fullName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  password?: string;
  lead?: string;
  next?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getSafeRedirectPath(value?: string) {
  if (!value || !value.startsWith("/")) {
    return "/pro/onboarding";
  }

  if (value.startsWith("//")) {
    return "/pro/onboarding";
  }

  return value;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ProSignupBody;

  const fullName = body.fullName?.trim() ?? "";
  const companyName = body.companyName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const phone = body.phone?.trim() ?? "";
  const password = body.password ?? "";
  const lead = body.lead?.trim() ?? "";
  const redirectTo = getSafeRedirectPath(body.next);

  if (!fullName || !companyName || !email || !password) {
    return NextResponse.json(
      { error: "Name, company, email, and password are required." },
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

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { data: createdUser, error: createUserError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          company_name: companyName,
          phone,
          role: "pro",
        },
      });

    if (createUserError || !createdUser.user) {
      return NextResponse.json(
        { error: createUserError?.message ?? "Unable to create user." },
        { status: 400 }
      );
    }

    userId = createdUser.user.id;
  }

  const { error: profileError } = await admin
    .from("pro_profiles")
    .upsert(
      {
  user_id: userId,
  company_name: companyName,

  full_name: fullName,
  email,
  phone,

  contact_name: fullName,
  contact_email: email,
  contact_phone: phone,

  status: "active",
  updated_at: new Date().toISOString(),
},
      { onConflict: "user_id" }
    );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  await ensureFixaAccount(userId);

  const finalRedirect = new URL(redirectTo, "http://fixly.local");

  if (lead) {
    finalRedirect.searchParams.set("lead", lead);
  }

  return NextResponse.json({
    ok: true,
    email,
    redirectTo: `${finalRedirect.pathname}${finalRedirect.search}`,
    existingUser: Boolean(existingUser),
  });
}