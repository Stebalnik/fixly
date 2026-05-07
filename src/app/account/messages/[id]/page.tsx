import Link from "next/link";
import { notFound } from "next/navigation";
import PublicPageShell from "@/components/PublicPageShell";
import { getAccountContext } from "@/lib/auth/account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ConversationMessageForm } from "@/features/account/ConversationMessageForm";

export const metadata = {
  title: "Conversation | Fixly",
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Message = {
  id: string;
  sender_user_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type ConversationRequest = {
  public_slug: string;
  city: string;
  state: string;
  category_slug: string;
  subcategory_slug: string | null;
};

export default async function AccountConversationPage({ params }: PageProps) {
  const account = await getAccountContext();
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: conversation, error: conversationError } = await admin
    .from("conversations")
    .select(
      `
      id,
      request_id,
      customer_user_id,
      pro_user_id,
      status,
      service_requests (
        public_slug,
        city,
        state,
        category_slug,
        subcategory_slug
      )
    `
    )
    .eq("id", id)
    .or(`customer_user_id.eq.${account.user.id},pro_user_id.eq.${account.user.id}`)
    .maybeSingle();

  if (conversationError) {
    throw new Error(conversationError.message);
  }

  if (!conversation) {
    notFound();
  }

  const serviceRequest = Array.isArray(conversation.service_requests)
    ? (conversation.service_requests[0] as ConversationRequest | undefined)
    : (conversation.service_requests as ConversationRequest | null);

  const { data: messagesData, error: messagesError } = await admin
    .from("messages")
    .select("id, sender_user_id, body, read_at, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const messages = (messagesData ?? []) as Message[];

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container-narrow">
          <Link href="/account/messages" className="button button-secondary">
            Back to messages
          </Link>

          <div className="card conversation-card">
            <p className="eyebrow">Fixly conversation</p>

            <h1>
              {serviceRequest?.subcategory_slug ??
                serviceRequest?.category_slug ??
                "Service request"}
            </h1>

            <p className="text-muted">
              {serviceRequest
                ? `${serviceRequest.city}, ${serviceRequest.state}`
                : "Fixly marketplace conversation"}
            </p>

            <div className="conversation-messages">
              {messages.length === 0 ? (
                <div className="conversation-empty">
                  <p>No messages yet.</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_user_id === account.user.id;

                  return (
                    <div
                      key={message.id}
                      className={
                        isOwn
                          ? "conversation-message conversation-message-own"
                          : "conversation-message"
                      }
                    >
                      <p>{message.body}</p>

                      <small>
                        {new Date(message.created_at).toLocaleString()}
                      </small>
                    </div>
                  );
                })
              )}
            </div>

            <ConversationMessageForm conversationId={conversation.id} />
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}