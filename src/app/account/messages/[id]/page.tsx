export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import PublicPageShell from "@/components/PublicPageShell";
import { getAccountContext } from "@/lib/auth/account";
import { getRequestPublicPath } from "@/lib/routes/marketplace";
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
  country_code: string | null;
  category_slug: string;
  subcategory_slug: string | null;
};

type Conversation = {
  id: string;
  request_id: string;
  customer_user_id: string;
  pro_user_id: string;
  status: string;
  service_requests: ConversationRequest | ConversationRequest[] | null;
};

function getServiceRequest(conversation: Conversation) {
  if (Array.isArray(conversation.service_requests)) {
    return conversation.service_requests[0] ?? null;
  }

  return conversation.service_requests;
}

function formatMessageDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AccountConversationPage({ params }: PageProps) {
  const account = await getAccountContext();
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: conversationData, error: conversationError } = await admin
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
        country_code,
        category_slug,
        subcategory_slug
      )
    `
    )
    .eq("id", id)
    .or(
      `customer_user_id.eq.${account.user.id},pro_user_id.eq.${account.user.id}`
    )
    .maybeSingle();

  if (conversationError) {
    throw new Error(conversationError.message);
  }

  if (!conversationData) {
    notFound();
  }

  const conversation = conversationData as unknown as Conversation;
  const serviceRequest = getServiceRequest(conversation);
  const isCustomer = conversation.customer_user_id === account.user.id;
  const otherPartyLabel = isCustomer ? "Pro" : "Customer";

  const { data: messagesData, error: messagesError } = await admin
    .from("messages")
    .select("id, sender_user_id, body, read_at, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const messages = (messagesData ?? []) as Message[];

  const unreadMessageIds = messages
    .filter(
      (message) => !message.read_at && message.sender_user_id !== account.user.id
    )
    .map((message) => message.id);

  if (unreadMessageIds.length > 0) {
    const { error: readError } = await admin
      .from("messages")
      .update({
        read_at: new Date().toISOString(),
      })
      .in("id", unreadMessageIds)
      .is("read_at", null);

    if (readError) {
      console.error("Failed to mark messages as read", readError);
    }
  }

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container-narrow">
          <div className="flex flex-between gap-md">
            <Link href="/account/messages" className="button button-secondary">
              Back to messages
            </Link>

            {serviceRequest ? (
              <Link
                href={getRequestPublicPath(
                  serviceRequest.public_slug,
                  serviceRequest.country_code || "us"
                )}
                className="button button-secondary"
              >
                View request
              </Link>
            ) : null}
          </div>

          <div className="card conversation-card">
            <p className="eyebrow">Conversation with {otherPartyLabel}</p>

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
                      <div className="conversation-message-meta">
                        <span className="badge">
                          {isOwn ? "You" : otherPartyLabel}
                        </span>

                        <small className="text-muted">
                          {formatMessageDate(message.created_at)}
                        </small>
                      </div>

                      <p>{message.body}</p>
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