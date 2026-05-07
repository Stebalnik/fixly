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
  service_requests: {
    public_slug: string;
    city: string;
    state: string;
    category_slug: string;
    subcategory_slug: string | null;
  } | null;
};

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
    .or(`customer_user_id.eq.${account.user.id},pro_user_id.eq.${account.user.id}`)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const conversations = (data ?? []) as unknown as Conversation[];

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
              </div>
            ) : (
              <div className="messages-list">
                {conversations.map((conversation) => {
                  const request = conversation.service_requests;
                  const isCustomer =
                    conversation.customer_user_id === account.user.id;

                  return (
                    <Link
                      key={conversation.id}
                      href={`/account/messages/${conversation.id}`}
                      className="message-list-item"
                    >
                      <div>
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
                          {isCustomer ? "Conversation with pro" : "Conversation with customer"}
                        </p>
                      </div>

                      <span className="badge badge-primary">
                        {conversation.status}
                      </span>
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