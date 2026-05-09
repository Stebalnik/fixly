import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

type CompleteCustomerSignupBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  requestId?: string;
  next?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getSafeRedirectPath(value?: string) {
  if (!value || !value.startsWith("/")) {
    return "/customer";
  }

  if (value.startsWith("//")) {
    return "/customer";
  }

  return value;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CompleteCustomerSignupBody;

  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const phone = body.phone?.trim() ?? "";
  const password = body.password ?? "";
  const requestId = body.requestId?.trim() ?? "";
  const redirectTo = getSafeRedirectPath(body.next);

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
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
          phone,
          role: "customer",
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
    .from("customer_profiles")
    .upsert(
      {
        user_id: userId,
        full_name: fullName,
        email,
        phone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  if (requestId) {
    const { data: serviceRequest, error: requestLookupError } = await admin
      .from("service_requests")
      .select("id, public_slug, customer_user_id, category_slug, subcategory_slug, market_slug, city, state, country_code")
      .eq("id", requestId)
      .maybeSingle();

    if (requestLookupError) {
      return NextResponse.json(
        { error: "Unable to load request." },
        { status: 500 }
      );
    }

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Request not found." },
        { status: 404 }
      );
    }

    if (
      serviceRequest.customer_user_id &&
      serviceRequest.customer_user_id !== userId
    ) {
      return NextResponse.json(
        { error: "This request is already connected to another account." },
        { status: 409 }
      );
    }

    const { error: requestError } = await admin
      .from("service_requests")
      .update({
        customer_user_id: userId,
        customer_flow: "account_created",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (requestError) {
      return NextResponse.json({ error: requestError.message }, { status: 400 });
    }

    await createNotification({
      userId,
      type: "customer_request_connected",
      title: "Request connected to your account",
      body: "You can now manage this request from your Fixly customer dashboard.",
      href: `/customer/requests/${serviceRequest.id}/manage`,
      metadata: {
        requestId: serviceRequest.id,
        publicSlug: serviceRequest.public_slug,
        categorySlug: serviceRequest.category_slug,
        subcategorySlug: serviceRequest.subcategory_slug,
        marketSlug: serviceRequest.market_slug,
        city: serviceRequest.city,
        state: serviceRequest.state,
        countryCode: serviceRequest.country_code,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    email,
    redirectTo,
    existingUser: Boolean(existingUser),
  });
}