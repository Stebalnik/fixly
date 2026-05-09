import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/account";
import { createNotification } from "@/lib/notifications";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ConversationRequest = {
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  market_slug: string | null;
  city: string | null;
  state: string | null;
  country_code: string | null;
};

type Conversation = {
  id: string;
  request_id: string;
  customer_user_id: string;
  pro_user_id: string;
  service_requests: ConversationRequest | ConversationRequest[] | null;
};

function getServiceRequest(conversation: Conversation) {
  if (Array.isArray(conversation.service_requests)) {
    return conversation.service_requests[0] ?? null;
  }

  return conversation.service_requests;
}

function truncateNotificationBody(value: string, maxLength = 160) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { id } = await context.params;

  const body = (await request.json()) as {
    body?: string;
  };

  const messageBody = body.body?.trim() ?? "";

  if (messageBody.length < 1) {
    return NextResponse.json(
      { error: "Message cannot be empty." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: conversationData, error: conversationError } = await admin
    .from("conversations")
    .select(
      `
      id,
      request_id,
      customer_user_id,
      pro_user_id,
      service_requests (
        public_slug,
        category_slug,
        subcategory_slug,
        market_slug,
        city,
        state,
        country_code
      )
    `
    )
    .eq("id", id)
    .or(`customer_user_id.eq.${user.id},pro_user_id.eq.${user.id}`)
    .maybeSingle();

  if (conversationError) {
    return NextResponse.json(
      { error: "Unable to load conversation." },
      { status: 500 }
    );
  }

  if (!conversationData) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    );
  }

  const conversation = conversationData as unknown as Conversation;
  const serviceRequest = getServiceRequest(conversation);

  const { data: createdMessage, error: messageError } = await admin
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      sender_user_id: user.id,
      body: messageBody,
    })
    .select("id, created_at")
    .single();

  if (messageError || !createdMessage) {
    return NextResponse.json(
      { error: messageError?.message ?? "Unable to send message." },
      { status: 400 }
    );
  }

  const { error: updateError } = await admin
    .from("conversations")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  if (updateError) {
    console.error("Failed to update conversation timestamp", updateError);
  }

  const recipientUserId =
    user.id === conversation.customer_user_id
      ? conversation.pro_user_id
      : conversation.customer_user_id;

  if (recipientUserId && recipientUserId !== user.id) {
    await createNotification({
      userId: recipientUserId,
      type: "new_message",
      title: "New message",
      body: truncateNotificationBody(messageBody),
      href: `/account/messages/${conversation.id}`,
      metadata: {
        conversationId: conversation.id,
        messageId: createdMessage.id,
        requestId: conversation.request_id,
        publicSlug: serviceRequest?.public_slug ?? null,
        senderUserId: user.id,
        recipientUserId,
        categorySlug: serviceRequest?.category_slug ?? null,
        subcategorySlug: serviceRequest?.subcategory_slug ?? null,
        marketSlug: serviceRequest?.market_slug ?? null,
        city: serviceRequest?.city ?? null,
        state: serviceRequest?.state ?? null,
        countryCode: serviceRequest?.country_code ?? null,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    messageId: createdMessage.id,
    conversationId: conversation.id,
    createdAt: createdMessage.created_at,
  });
}