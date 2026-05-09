import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type RequestUpdateBody = {
  publicDescription?: string;
  action?: "archive" | "reopen";
};

function getSafeRedirectPath(id: string) {
  return `/customer/requests/${id}/manage`;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = (await request.json()) as RequestUpdateBody;
  const admin = createSupabaseAdminClient();

  const { data: existingRequest, error: existingRequestError } = await admin
    .from("service_requests")
    .select(
      `
      id,
      public_slug,
      customer_user_id,
      category_slug,
      subcategory_slug,
      market_slug,
      city,
      state,
      country_code,
      status,
      lead_status
    `
    )
    .eq("id", id)
    .eq("customer_user_id", user.id)
    .maybeSingle();

  if (existingRequestError) {
    return NextResponse.json(
      { error: "Unable to load request." },
      { status: 500 }
    );
  }

  if (!existingRequest) {
    return NextResponse.json(
      { error: "Request not found." },
      { status: 404 }
    );
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.action === "archive") {
    if (existingRequest.status === "deleted") {
      return NextResponse.json(
        { error: "Deleted request cannot be archived." },
        { status: 400 }
      );
    }

    updatePayload.status = "archived";
    updatePayload.lead_status = "closed";
  } else if (body.action === "reopen") {
    if (existingRequest.status === "deleted") {
      return NextResponse.json(
        { error: "Deleted request cannot be reopened." },
        { status: 400 }
      );
    }

    updatePayload.status = "open";
    updatePayload.lead_status = "available";
  }

  if (body.publicDescription !== undefined) {
    if (existingRequest.status !== "open") {
      return NextResponse.json(
        { error: "Only open requests can be edited." },
        { status: 400 }
      );
    }

    const description = body.publicDescription.trim();

    if (description.length < 20) {
      return NextResponse.json(
        { error: "Description must be at least 20 characters." },
        { status: 400 }
      );
    }

    updatePayload.public_description = description;
  }

  if (Object.keys(updatePayload).length === 1) {
    return NextResponse.json(
      { error: "No valid changes provided." },
      { status: 400 }
    );
  }

  const { data: updatedRequest, error: updateError } = await admin
    .from("service_requests")
    .update(updatePayload)
    .eq("id", id)
    .eq("customer_user_id", user.id)
    .select("id, public_slug, status, lead_status")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 400 }
    );
  }

  if (!updatedRequest) {
    return NextResponse.json(
      { error: "Request not found or not updated." },
      { status: 404 }
    );
  }

  if (body.action === "archive") {
    await createNotification({
      userId: user.id,
      type: "request_archived",
      title: "Request archived",
      body: "Your service request has been archived and is no longer available for new pro unlocks.",
      href: getSafeRedirectPath(existingRequest.id),
      metadata: {
        requestId: existingRequest.id,
        publicSlug: existingRequest.public_slug,
        categorySlug: existingRequest.category_slug,
        subcategorySlug: existingRequest.subcategory_slug,
        marketSlug: existingRequest.market_slug,
        city: existingRequest.city,
        state: existingRequest.state,
        countryCode: existingRequest.country_code,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    request: updatedRequest,
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: existingRequest, error: existingRequestError } = await admin
    .from("service_requests")
    .select(
      `
      id,
      public_slug,
      customer_user_id,
      category_slug,
      subcategory_slug,
      market_slug,
      city,
      state,
      country_code,
      status,
      lead_status
    `
    )
    .eq("id", id)
    .eq("customer_user_id", user.id)
    .maybeSingle();

  if (existingRequestError) {
    return NextResponse.json(
      { error: "Unable to load request." },
      { status: 500 }
    );
  }

  if (!existingRequest) {
    return NextResponse.json(
      { error: "Request not found." },
      { status: 404 }
    );
  }

  if (existingRequest.status === "deleted") {
    return NextResponse.json({
      ok: true,
      alreadyDeleted: true,
    });
  }

  const { data: deletedRequest, error: deleteError } = await admin
    .from("service_requests")
    .update({
      status: "deleted",
      lead_status: "closed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("customer_user_id", user.id)
    .select("id, public_slug, status, lead_status")
    .maybeSingle();

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 400 }
    );
  }

  if (!deletedRequest) {
    return NextResponse.json(
      { error: "Request not found or not deleted." },
      { status: 404 }
    );
  }

  await createNotification({
    userId: user.id,
    type: "request_archived",
    title: "Request deleted",
    body: "Your service request has been deleted and closed for new pro unlocks.",
    href: "/customer",
    metadata: {
      requestId: existingRequest.id,
      publicSlug: existingRequest.public_slug,
      categorySlug: existingRequest.category_slug,
      subcategorySlug: existingRequest.subcategory_slug,
      marketSlug: existingRequest.market_slug,
      city: existingRequest.city,
      state: existingRequest.state,
      countryCode: existingRequest.country_code,
    },
  });

  return NextResponse.json({
    ok: true,
    request: deletedRequest,
  });
}