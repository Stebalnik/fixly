import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

type ReviewRequestBody = {
  requestId?: string;
  proUserId?: string;
  rating?: number;
  qualityRating?: number | null;
  communicationRating?: number | null;
  valueRating?: number | null;
  punctualityRating?: number | null;
  reviewTitle?: string;
  reviewText?: string;
};

function normalizeRating(value: unknown) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > 5) return null;
  return numeric;
}

function normalizeOptionalRating(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return normalizeRating(value);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as ReviewRequestBody | null;
  const requestId = body?.requestId?.trim();
  const proUserId = body?.proUserId?.trim();
  const rating = normalizeRating(body?.rating);
  const qualityRating = normalizeOptionalRating(body?.qualityRating);
  const communicationRating = normalizeOptionalRating(body?.communicationRating);
  const valueRating = normalizeOptionalRating(body?.valueRating);
  const punctualityRating = normalizeOptionalRating(body?.punctualityRating);
  const reviewTitle = body?.reviewTitle?.trim() ?? "";
  const reviewText = body?.reviewText?.trim() ?? "";

  if (!requestId || !proUserId) {
    return NextResponse.json(
      { error: "Missing request or pro." },
      { status: 400 }
    );
  }

  if (!rating) {
    return NextResponse.json(
      { error: "Choose an overall rating from 1 to 5." },
      { status: 400 }
    );
  }

  if (reviewText.length > 2000 || reviewTitle.length > 120) {
    return NextResponse.json(
      { error: "Review text is too long." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: serviceRequest, error: requestError } = await admin
    .from("service_requests")
    .select("id, public_slug, customer_user_id, category_slug, city, state")
    .eq("id", requestId)
    .eq("customer_user_id", user.id)
    .maybeSingle();

  if (requestError) {
    return NextResponse.json(
      { error: "Unable to verify request ownership." },
      { status: 500 }
    );
  }

  if (!serviceRequest) {
    return NextResponse.json(
      { error: "Request not found." },
      { status: 404 }
    );
  }

  const { data: proProfile, error: proProfileError } = await admin
    .from("pro_profiles")
    .select("user_id, status")
    .eq("user_id", proUserId)
    .eq("status", "active")
    .maybeSingle();

  if (proProfileError) {
    return NextResponse.json(
      { error: "Unable to verify pro profile." },
      { status: 500 }
    );
  }

  if (!proProfile) {
    return NextResponse.json(
      { error: "Pro profile is not available for review." },
      { status: 404 }
    );
  }

  const [
    { data: leadAccess, error: leadAccessError },
    { data: conversation, error: conversationError },
    { data: customerAccess, error: customerAccessError },
  ] = await Promise.all([
      admin
        .from("pro_lead_access")
        .select("id")
        .eq("request_id", requestId)
        .eq("pro_user_id", proUserId)
        .maybeSingle(),
      admin
        .from("conversations")
        .select("id")
        .eq("request_id", requestId)
        .eq("customer_user_id", user.id)
        .eq("pro_user_id", proUserId)
        .maybeSingle(),
      admin
        .from("customer_pro_contact_access")
        .select("id")
        .eq("request_id", requestId)
        .eq("customer_user_id", user.id)
        .eq("pro_user_id", proUserId)
        .maybeSingle(),
    ]);

  if (leadAccessError || conversationError || customerAccessError) {
    return NextResponse.json(
      { error: "Unable to verify review eligibility." },
      { status: 500 }
    );
  }

  if (!leadAccess && !conversation && !customerAccess) {
    return NextResponse.json(
      { error: "You can only review pros connected to this request." },
      { status: 403 }
    );
  }

  const { data: existingReview, error: existingReviewError } = await admin
    .from("pro_reviews")
    .select("id")
    .eq("request_id", requestId)
    .eq("customer_user_id", user.id)
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  if (existingReviewError) {
    return NextResponse.json(
      { error: "Unable to verify existing reviews." },
      { status: 500 }
    );
  }

  if (existingReview) {
    return NextResponse.json(
      { error: "You already reviewed this pro for this request." },
      { status: 409 }
    );
  }

  const { error: insertError } = await admin.from("pro_reviews").insert({
    request_id: requestId,
    customer_user_id: user.id,
    pro_user_id: proUserId,
    rating,
    quality_rating: qualityRating,
    communication_rating: communicationRating,
    value_rating: valueRating,
    punctuality_rating: punctualityRating,
    review_title: reviewTitle || null,
    review_body: reviewText || null,
    review_text: reviewText || null,
    moderation_status: "pending",
  });

  if (insertError) {
    return NextResponse.json(
      { error: "Unable to submit review." },
      { status: 500 }
    );
  }

  await createNotification({
    userId: proUserId,
    type: "pro_review_submitted",
    title: "New customer review submitted",
    body: `A customer submitted a review for your ${serviceRequest.category_slug} request in ${serviceRequest.city}, ${serviceRequest.state}.`,
    href: `/pro`,
    metadata: {
      requestId,
      publicSlug: serviceRequest.public_slug,
      proUserId,
      customerUserId: user.id,
      rating,
      moderationStatus: "pending",
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Review submitted for moderation.",
  });
}
