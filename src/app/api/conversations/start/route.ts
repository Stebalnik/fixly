import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/account";

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
  const proUserId = body.proUserId;
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

  const { data: serviceRequest } = await admin
    .from("service_requests")
    .select("id, customer_user_id")
    .eq("id", requestId)
    .eq("customer_user_id", user.id)
    .maybeSingle();

  if (!serviceRequest) {
    return NextResponse.json(
      { error: "Request not found." },
      { status: 404 }
    );
  }

  const { data: unlockedAccess } = await admin
    .from("customer_pro_contact_access")
    .select("id")
    .eq("request_id", requestId)
    .eq("customer_user_id", user.id)
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  if (!unlockedAccess) {
    return NextResponse.json(
      { error: "Pro contact must be unlocked first." },
      { status: 403 }
    );
  }

  const { data: existingConversation } = await admin
    .from("conversations")
    .select("id")
    .eq("request_id", requestId)
    .eq("customer_user_id", user.id)
    .eq("pro_user_id", proUserId)
    .maybeSingle();

  if (existingConversation) {
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
      customer_user_id: user.id,
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

  const { error: messageError } = await admin
    .from("messages")
    .insert({
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

  return NextResponse.json({
    ok: true,
    conversationId: conversation.id,
    redirectTo: `/account/messages/${conversation.id}`,
  });
}