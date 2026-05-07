import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  calculateQualityScore,
  generateJobSlug,
  getIndexStatus,
} from "@/lib/seo";
import { getCategoryBySlug, getSubcategoryBySlug } from "@/lib/services";
import { getMarketBySlug } from "@/lib/geo";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

function getArchiveAfterDate() {
  const archiveAfter = new Date();
  archiveAfter.setDate(archiveAfter.getDate() + 10);
  return archiveAfter.toISOString();
}

function normalizeMaxResponses(value?: number) {
  if (!value || Number.isNaN(value)) {
    return 5;
  }

  return Math.max(1, Math.min(value, 10));
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;

  const category = getCategoryBySlug(body.categorySlug);
  const subcategory = body.subcategorySlug
    ? getSubcategoryBySlug(body.subcategorySlug)
    : null;
  const market = getMarketBySlug(body.marketSlug);

  const cleanPhone = normalizePhone(body.privateContact?.phoneNumber ?? "");
  const cleanFullPhone = `${
    body.privateContact?.phoneCountryCode ?? "+1"
  }${cleanPhone}`;

  if (!category || !market) {
    return safeError("Invalid service or location");
  }

  if (body.subcategorySlug && !subcategory) {
    return safeError("Invalid specific service");
  }

  if (!body.streetAddress || body.streetAddress.trim().length < 5) {
    return safeError("Street address is required");
  }

  if (!body.publicDescription || body.publicDescription.trim().length < 20) {
    return safeError("Description is too short");
  }

  if (!body.privateContact?.name || body.privateContact.name.trim().length < 2) {
    return safeError("Name is required");
  }

  if (!body.privateContact?.email || !isValidEmail(body.privateContact.email)) {
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
    description: body.publicDescription.trim(),
  });

  const publicSlug = generateJobSlug({
    city: market.city,
    problem: subcategory?.title ?? category.title,
    id: crypto.randomUUID().slice(0, 8),
  });

  const { data: createdRequest, error: requestError } = await supabase
    .from("service_requests")
    .insert({
      public_slug: publicSlug,
      category_slug: category.slug,
      subcategory_slug: subcategory?.slug ?? null,
      market_slug: market.slug,
      city: market.city,
      state: market.state,
      country_code: market.countryCode,
      public_description: body.publicDescription.trim(),
      status: "open",
      lead_access_policy: "paid_only",
      quality_score: qualityScore,
      index_status: getIndexStatus(qualityScore),
      customer_flow: body.createAccountRequested ? "account_requested" : "guest",
      notify_email: body.notifyEmail ?? true,
      archive_after: getArchiveAfterDate(),
      max_responses: normalizeMaxResponses(body.maxResponses),
    })
    .select("id, public_slug")
    .single();

  if (requestError || !createdRequest) {
    return NextResponse.json(
      { error: "Unable to create public request" },
      { status: 500 }
    );
  }

  const { error: contactError } = await supabase
    .from("request_contacts")
    .insert({
      request_id: createdRequest.id,
      customer_name: body.privateContact.name.trim(),
      street_address: body.streetAddress.trim(),
      phone_country_code: body.privateContact.phoneCountryCode,
      phone_number: cleanPhone,
      full_phone: cleanFullPhone,
      email: body.privateContact.email.trim().toLowerCase(),
      create_account_requested: body.createAccountRequested ?? false,
    });

  if (contactError) {
    return NextResponse.json(
      { error: "Request created, but contact details were not saved" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    requestId: createdRequest.id,
    publicSlug: createdRequest.public_slug,
    requestUrl: `/requests/${createdRequest.public_slug}`,
  });
}