import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  calculateQualityScore,
  generateJobSlug,
  getIndexStatus,
} from "@/lib/seo";
import { getCategoryBySlug, getSubcategoryBySlug } from "@/lib/services";
import { getMarketBySlug } from "@/lib/geo";
import { sendTelegramLeadNotification } from "@/lib/telegram/bot";

type RequestBody = {
  categorySlug: string;
  subcategorySlug?: string | null;
  marketSlug: string;
  streetAddress: string;
  publicDescription: string;
  createAccountRequested?: boolean;
  notifyEmail?: boolean;
  maxResponses?: number;
  privateContact: {
    name: string;
    phoneCountryCode: string;
    phoneNumber: string;
    fullPhone: string;
    email: string;
  };
};

function safeError(message = "Unable to create request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

function normalizePhoneCountryCode(value?: string) {
  const countryCode = value?.trim() || "+1";

  if (!/^\+\d{1,4}$/.test(countryCode)) {
    return "+1";
  }

  return countryCode;
}

function getArchiveAfterDate() {
  const archiveAfter = new Date();
  archiveAfter.setDate(archiveAfter.getDate() + 10);

  return archiveAfter.toISOString();
}

function normalizeMaxResponses(value?: number) {
  const amount = Number(value);

  if (!Number.isInteger(amount)) {
    return 5;
  }

  return Math.max(1, Math.min(amount, 10));
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;

  const category = getCategoryBySlug(body.categorySlug);
  const subcategory = body.subcategorySlug
    ? getSubcategoryBySlug(body.subcategorySlug)
    : null;
  const market = getMarketBySlug(body.marketSlug);

  const cleanDescription = body.publicDescription?.trim() ?? "";
  const cleanName = body.privateContact?.name?.trim() ?? "";
  const cleanEmail = body.privateContact?.email?.trim().toLowerCase() ?? "";
  const cleanPhone = normalizePhone(body.privateContact?.phoneNumber ?? "");
  const phoneCountryCode = normalizePhoneCountryCode(
    body.privateContact?.phoneCountryCode
  );
  const cleanFullPhone = `${phoneCountryCode}${cleanPhone}`;
  const maxResponses = normalizeMaxResponses(body.maxResponses);

  if (!category || !market) {
    return safeError("Invalid service or location");
  }

  if (body.subcategorySlug && !subcategory) {
    return safeError("Invalid specific service");
  }

  if (!body.streetAddress || body.streetAddress.trim().length < 5) {
    return safeError("Street address is required");
  }

  if (cleanDescription.length < 20) {
    return safeError("Description is too short");
  }

  if (cleanName.length < 2) {
    return safeError("Name is required");
  }

  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return safeError("Valid email is required");
  }

  if (cleanPhone.length < 7 || cleanPhone.length > 14) {
    return safeError("Valid phone number is required");
  }

  const qualityScore = calculateQualityScore({
    categorySlug: category.slug,
    subcategorySlug: subcategory?.slug,
    city: market.city,
    problem: subcategory?.title ?? category.title,
    description: cleanDescription,
  });

  const publicSlug = generateJobSlug({
    city: market.city,
    problem: subcategory?.title ?? category.title,
    id: crypto.randomUUID().slice(0, 8),
  });

  const admin = createSupabaseAdminClient();

  const { data: createdRequest, error: requestError } = await admin
    .from("service_requests")
    .insert({
      public_slug: publicSlug,
      category_slug: category.slug,
      subcategory_slug: subcategory?.slug ?? null,
      market_slug: market.slug,
      city: market.city,
      state: market.state,
      country_code: market.countryCode,
      public_description: cleanDescription,
      status: "open",
      lead_status: "available",
      lead_access_policy: "paid_only",
      quality_score: qualityScore,
      index_status: getIndexStatus(qualityScore),
      customer_flow: body.createAccountRequested ? "account_requested" : "guest",
      notify_email: body.notifyEmail ?? true,
      archive_after: getArchiveAfterDate(),
      purchase_count: 0,
      max_purchases: maxResponses,
      max_responses: maxResponses,
    })
    .select("id, public_slug")
    .single();

  if (requestError || !createdRequest) {
    console.error("Failed to create service request", requestError);

    return NextResponse.json(
      { error: "Unable to create public request" },
      { status: 500 }
    );
  }

  const { error: contactError } = await admin.from("request_contacts").insert({
    request_id: createdRequest.id,
    customer_name: cleanName,
    street_address: body.streetAddress.trim(),
    phone_country_code: phoneCountryCode,
    phone_number: cleanPhone,
    full_phone: cleanFullPhone,
    email: cleanEmail,
    create_account_requested: body.createAccountRequested ?? false,
  });

  if (contactError) {
    console.error("Failed to save request contact", contactError);

    await admin
      .from("service_requests")
      .update({
        status: "deleted",
        lead_status: "closed",
      })
      .eq("id", createdRequest.id);

    return NextResponse.json(
      { error: "Request created, but contact details were not saved" },
      { status: 500 }
    );
  }

  const telegramResult = await sendTelegramLeadNotification({
    publicSlug: createdRequest.public_slug,
    categoryLabel: category.title,
    subcategoryLabel: subcategory?.title,
    city: market.city,
    state: market.state,
    countryCode: market.countryCode,
    description: cleanDescription,
    contactName: cleanName,
    phone: cleanFullPhone,
    email: cleanEmail,
  });

  if (!telegramResult.ok) {
    console.error("Failed to send Telegram lead notification", {
      requestId: createdRequest.id,
      error: telegramResult.error,
    });
  }

  return NextResponse.json({
    ok: true,
    requestId: createdRequest.id,
    publicSlug: createdRequest.public_slug,
    requestUrl: `/requests/${createdRequest.public_slug}`,
  });
}
