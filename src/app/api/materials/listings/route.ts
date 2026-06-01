import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ListingBody = {
  title?: string;
  category?: string;
  condition?: string;
  price?: string | number | null;
  city?: string;
  state?: string;
  description?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
};

const allowedCategories = new Set([
  "lumber",
  "tile-flooring",
  "paint-coatings",
  "doors-windows-trim",
  "fixtures-hardware",
  "tools-supplies",
  "other",
]);

const allowedConditions = new Set([
  "new",
  "open_box",
  "leftover",
  "used",
  "salvaged",
]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanDescription(value: unknown) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 2000);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizePriceCents(value: ListingBody["price"]) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export async function POST(request: Request) {
  let body: ListingBody;

  try {
    body = (await request.json()) as ListingBody;
  } catch {
    return jsonError("Invalid listing payload");
  }

  const title = cleanText(body.title, 120);
  const category = cleanText(body.category, 64);
  const condition = cleanText(body.condition, 32);
  const city = cleanText(body.city, 80);
  const state = cleanText(body.state, 80).toUpperCase();
  const description = cleanDescription(body.description);
  const sellerName = cleanText(body.sellerName, 100);
  const sellerEmail = cleanText(body.sellerEmail, 160).toLowerCase();
  const sellerPhone = cleanText(body.sellerPhone, 40);
  const priceCents = normalizePriceCents(body.price);

  if (title.length < 8) return jsonError("Please add a clearer listing title.");
  if (!allowedCategories.has(category)) return jsonError("Choose a category.");
  if (!allowedConditions.has(condition)) return jsonError("Choose a condition.");
  if (city.length < 2) return jsonError("City is required.");
  if (state.length < 2) return jsonError("State is required.");
  if (description.length < 40) {
    return jsonError("Description should be at least 40 characters.");
  }
  if (sellerName.length < 2) return jsonError("Seller name is required.");
  if (!isValidEmail(sellerEmail)) return jsonError("Valid email is required.");

  const publicSlug = `${slugify(title) || "materials"}-${crypto
    .randomUUID()
    .slice(0, 8)}`;

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("material_listings")
    .insert({
      public_slug: publicSlug,
      title,
      category,
      condition,
      price_cents: priceCents,
      city,
      state,
      description,
      seller_name: sellerName,
      seller_email: sellerEmail,
      seller_phone: sellerPhone || null,
      status: "pending",
    })
    .select("id, public_slug")
    .single();

  if (error || !data) {
    console.error("Failed to create material listing", error);
    return jsonError("Unable to submit material listing", 500);
  }

  return NextResponse.json({
    ok: true,
    listingId: data.id,
    publicSlug: data.public_slug,
  });
}
