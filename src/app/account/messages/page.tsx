export const dynamic = "force-dynamic";

import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import { getAccountContext } from "@/lib/auth/account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Messages | Fixly",
};

type Conversation = {
  id: string;
  request_id: string;
  customer_user_id: string;
  pro_user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  service_requests:
    | {
        public_slug: string;
        city: string;
        state: string;
        category_slug: string;
        subcategory_slug: string | null;
      }
    | {
        public_slug: string;
        city: string;
        state: string;
        category_slug: string;
        subcategory_slug: string | null;
      }[]
    | null;
};

type MessagePreview = {
  conversation_id: string;
  sender_user_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

function getRequest(conversation: Conversation) {
  if (Array.isArray(conversation.service_requests)) {
    return conversation.service_requests[0] ?? null;
  }

  return conversation.service_requests;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function truncateText(value: string, maxLength = 120) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export default async function AccountMessagesPage() {
  const account = await getAccountContext();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("conversations")
    .select(
      `
      id,
      request_id,
      customer_user_id,
      pro_user_id,
      status,
      created_at,
      updated_at,
      service_requests (
        public_slug,
        city,
        state,
        category_slug,
        subcategory_slug
      )
    `
    )
    .or(
      `customer_user_id.eq.${account.user.id},pro_user_id.eq.${account.user.id}`
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const conversations = (data ?? []) as unknown as Conversation[];
  const conversationIds = conversations.map((conversation) => conversation.id);

  let messagePreviewByConversation = new Map<string, MessagePreview>();
  let unreadCountByConversation = new Map<string, number>();

  if (conversationIds.length > 0) {
    const { data: messagesData, error: messagesError } = await admin
      .from("messages")
      .select("conversation_id, sender_user_id, body, read_at, created_at")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    if (messagesError) {
      throw new Error(messagesError.message);
    }

    const messages = (messagesData ?? []) as MessagePreview[];

    messagePreviewByConversation = new Map();

    unreadCountByConversation = new Map();

    for (const message of messages) {
      if (!messagePreviewByConversation.has(message.conversation_id)) {
        messagePreviewByConversation.set(message.conversation_id, message);
      }

      if (!message.read_at && message.sender_user_id !== account.user.id) {
        unreadCountByConversation.set(
          message.conversation_id,
          (unreadCountByConversation.get(message.conversation_id) ?? 0) + 1
        );
      }
    }
  }

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container">
          <div className="flex flex-between gap-md">
            <div>
              <p className="eyebrow">Fixly inbox</p>

              <h1>Messages</h1>

              <p className="hero-text">
                Conversations between customers and pros appear here.
              </p>
            </div>

            <Link href="/account" className="button button-secondary">
              Back to account
            </Link>
          </div>

          <div className="card messages-list-card">
            {conversations.length === 0 ? (
              <div className="messages-empty-state">
                <h2>No messages yet</h2>

                <p>
                  When you start a conversation with a customer or pro, it will
                  appear here.
                </p>

                <Link href="/requests" className="button button-primary">
                  Browse open requests
                </Link>
              </div>
            ) : (
              <div className="messages-list">
                {conversations.map((conversation) => {
                  const request = getRequest(conversation);
                  const isCustomer =
                    conversation.customer_user_id === account.user.id;
                  const preview = messagePreviewByConversation.get(
                    conversation.id
                  );
                  const unreadCount =
                    unreadCountByConversation.get(conversation.id) ?? 0;

                  return (
                    <Link
                      key={conversation.id}
                      href={`/account/messages/${conversation.id}`}
                      className={
                        unreadCount > 0
                          ? "message-list-item message-list-item-unread"
                          : "message-list-item"
                      }
                    >
                      <div>
                        <div className="flex gap-sm">
                          <span className="badge">
                            {isCustomer ? "Pro" : "Customer"}
                          </span>

                          {unreadCount > 0 ? (
                            <span className="badge badge-primary">
                              {unreadCount > 99 ? "99+" : unreadCount} unread
                            </span>
                          ) : null}
                        </div>

                        <h3>
                          {request?.subcategory_slug ??
                            request?.category_slug ??
                            "Service request"}
                        </h3>

                        <p className="text-muted">
                          {request
                            ? `${request.city}, ${request.state}`
                            : "Fixly conversation"}
                        </p>

                        <p className="text-muted">
                          {preview
                            ? truncateText(preview.body)
                            : "No messages yet."}
                        </p>
                      </div>

                      <div className="message-list-meta">
                        <span className="badge badge-primary">
                          {conversation.status}
                        </span>

                        <small className="text-muted">
                          {formatDate(preview?.created_at ?? conversation.updated_at)}
                        </small>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}