import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/account";
import { createNotification } from "@/lib/notifications";
import { recordPlatformEvent } from "@/lib/analytics/platform-events";

type RequestBody = {
  requestId?: string;
  proUserId?: string;
  initialMessage?: string;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Login required." },
      { status: 401 }
    );
  }

  const body = (await request.json()) as RequestBody;

  const requestId = body.requestId;
  const proUserId = body.proUserId === "self" ? user.id : body.proUserId;
  const initialMessage = body.initialMessage?.trim() ?? "";

  if (!requestId || !proUserId) {
    return NextResponse.json(
      { error: "Missing request or pro." },
      { status: 400 }
    );
  }

  if (initialMessage.length < 2) {
    return NextResponse.json(
      { error: "Message is too short." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: serviceRequest, error: requestError } = await admin
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
      country_code
    `
    )
    .eq("id", requestId)
    .maybeSingle();

  if (requestError) {
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

  if (!serviceRequest.customer_user_id) {
    return NextResponse.json(
      {
        error:
          "This customer has not created a Fixly account yet. Please contact them directly using the phone or email shown above.",
      },
      { status: 409 }
    );
  }

  const isCustomer = serviceRequest.customer_user_id === user.id;
  const isPro = proUserId === user.id;

  if (!isCustomer && !isPro) {
    return NextResponse.json(
      { error: "You are not allowed to start this conversation." },
      { status: 403 }
    );
  }

  if (isCustomer) {
    const { data: unlockedAccess, error: unlockedAccessError } = await admin
      .from("customer_pro_contact_access")
      .select("id")
      .eq("request_id", requestId)
      .eq("customer_user_id", user.id)
      .eq("pro_user_id", proUserId)
      .maybeSingle();

    if (unlockedAccessError) {
      return NextResponse.json(
        { error: "Unable to verify pro contact access." },
        { status: 500 }
      );
    }

    if (!unlockedAccess) {
      return NextResponse.json(
        { error: "Pro contact must be unlocked first." },
        { status: 403 }
      );
    }
  }

  if (isPro) {
    const { data: proLeadAccess, error: proLeadAccessError } = await admin
      .from("pro_lead_access")
      .select("id")
      .eq("request_id", requestId)
      .eq("pro_user_id", user.id)
      .maybeSingle();

    if (proLeadAccessError) {
      return NextResponse.json(
        { error: "Unable to verify lead access." },
        { status: 500 }
      );
    }

    if (!proLeadAccess) {
      return NextResponse.json(
        { error: "Lead must be unlocked first." },
        { status: 403 }
      );
    }
  }

  const { data: existingConversation, error: existingConversationError } =
    await admin
      .from("conversations")
      .select("id")
      .eq("request_id", requestId)
      .eq("customer_user_id", serviceRequest.customer_user_id)
      .eq("pro_user_id", proUserId)
      .maybeSingle();

  if (existingConversationError) {
    return NextResponse.json(
      { error: "Unable to load conversation." },
      { status: 500 }
    );
  }

  const recipientUserId = isCustomer
    ? proUserId
    : serviceRequest.customer_user_id;

  if (existingConversation) {
    const { error: messageError } = await admin.from("messages").insert({
      conversation_id: existingConversation.id,
      sender_user_id: user.id,
      body: initialMessage,
    });

    if (messageError) {
      return NextResponse.json(
        { error: "Unable to send message." },
        { status: 500 }
      );
    }

    await admin
      .from("conversations")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingConversation.id);

    await createNotification({
      userId: recipientUserId,
      type: "new_message",
      title: "New message",
      body: initialMessage,
      href: `/account/messages/${existingConversation.id}`,
      metadata: {
        conversationId: existingConversation.id,
        requestId: serviceRequest.id,
        publicSlug: serviceRequest.public_slug,
        senderUserId: user.id,
        recipientUserId,
        categorySlug: serviceRequest.category_slug,
        subcategorySlug: serviceRequest.subcategory_slug,
        marketSlug: serviceRequest.market_slug,
        city: serviceRequest.city,
        state: serviceRequest.state,
        countryCode: serviceRequest.country_code,
      },
    });

    await recordPlatformEvent({
      eventName: "conversation_message_sent",
      eventGroup: "messages",
      actorUserId: user.id,
      entityType: "conversation",
      entityId: existingConversation.id,
      countryCode: serviceRequest.country_code,
      state: serviceRequest.state,
      marketSlug: serviceRequest.market_slug,
      categorySlug: serviceRequest.category_slug,
      subcategorySlug: serviceRequest.subcategory_slug,
      metadata: {
        requestId: serviceRequest.id,
        publicSlug: serviceRequest.public_slug,
        recipientUserId,
        reusedConversation: true,
      },
    });

    return NextResponse.json({
      ok: true,
      conversationId: existingConversation.id,
      redirectTo: `/account/messages/${existingConversation.id}`,
    });
  }

  const { data: conversation, error: conversationError } = await admin
    .from("conversations")
    .insert({
      request_id: requestId,
      customer_user_id: serviceRequest.customer_user_id,
      pro_user_id: proUserId,
      status: "open",
    })
    .select("id")
    .single();

  if (conversationError || !conversation) {
    return NextResponse.json(
      { error: "Unable to create conversation." },
      { status: 500 }
    );
  }

  const { error: messageError } = await admin.from("messages").insert({
    conversation_id: conversation.id,
    sender_user_id: user.id,
    body: initialMessage,
  });

  if (messageError) {
    return NextResponse.json(
      { error: "Unable to send message." },
      { status: 500 }
    );
  }

  await admin
    .from("conversations")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  await createNotification({
    userId: recipientUserId,
    type: "new_message",
    title: "New message",
    body: initialMessage,
    href: `/account/messages/${conversation.id}`,
    metadata: {
      conversationId: conversation.id,
      requestId: serviceRequest.id,
      publicSlug: serviceRequest.public_slug,
      senderUserId: user.id,
      recipientUserId,
      categorySlug: serviceRequest.category_slug,
      subcategorySlug: serviceRequest.subcategory_slug,
      marketSlug: serviceRequest.market_slug,
      city: serviceRequest.city,
      state: serviceRequest.state,
      countryCode: serviceRequest.country_code,
    },
  });

  await recordPlatformEvent({
    eventName: "conversation_started",
    eventGroup: "messages",
    actorUserId: user.id,
    entityType: "conversation",
    entityId: conversation.id,
    countryCode: serviceRequest.country_code,
    state: serviceRequest.state,
    marketSlug: serviceRequest.market_slug,
    categorySlug: serviceRequest.category_slug,
    subcategorySlug: serviceRequest.subcategory_slug,
    metadata: {
      requestId: serviceRequest.id,
      publicSlug: serviceRequest.public_slug,
      recipientUserId,
    },
  });

  return NextResponse.json({
    ok: true,
    conversationId: conversation.id,
    redirectTo: `/account/messages/${conversation.id}`,
  });
}
