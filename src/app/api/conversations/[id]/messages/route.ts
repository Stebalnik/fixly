import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/account";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

  const { data: conversation } = await admin
    .from("conversations")
    .select("id, customer_user_id, pro_user_id")
    .eq("id", id)
    .or(`customer_user_id.eq.${user.id},pro_user_id.eq.${user.id}`)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    );
  }

  const { error: messageError } = await admin.from("messages").insert({
    conversation_id: id,
    sender_user_id: user.id,
    body: messageBody,
  });

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 400 });
  }

  await admin
    .from("conversations")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}