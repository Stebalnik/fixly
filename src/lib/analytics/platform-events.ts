import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PlatformEventArgs = {
  eventName: string;
  eventGroup: string;
  actorUserId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  source?: string;
  countryCode?: string | null;
  state?: string | null;
  marketSlug?: string | null;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordPlatformEvent(args: PlatformEventArgs) {
  try {
    const admin = createSupabaseAdminClient();

    const { error } = await admin.from("platform_events").insert({
      event_name: args.eventName,
      event_group: args.eventGroup,
      actor_user_id: args.actorUserId ?? null,
      entity_type: args.entityType ?? null,
      entity_id: args.entityId ?? null,
      source: args.source ?? "server",
      country_code: args.countryCode?.toLowerCase() ?? null,
      state: args.state ?? null,
      market_slug: args.marketSlug ?? null,
      category_slug: args.categorySlug ?? null,
      subcategory_slug: args.subcategorySlug ?? null,
      metadata: args.metadata ?? {},
    });

    if (error) {
      console.error("Failed to record platform event", {
        eventName: args.eventName,
        error,
      });
    }
  } catch (error) {
    console.error("Failed to record platform event", {
      eventName: args.eventName,
      error,
    });
  }
}
