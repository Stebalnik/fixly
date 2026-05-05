


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."lead_pricing_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_code" "text" NOT NULL,
    "category_slug" "text",
    "subcategory_slug" "text",
    "base_price_fixas" integer NOT NULL,
    "currency_code" "text" DEFAULT 'USD'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."lead_pricing_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pro_credit_accounts" (
    "pro_user_id" "uuid" NOT NULL,
    "balance" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pro_credit_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pro_credit_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pro_user_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "transaction_type" "text" NOT NULL,
    "request_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pro_credit_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pro_lead_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_id" "uuid" NOT NULL,
    "pro_user_id" "uuid" NOT NULL,
    "access_type" "text" DEFAULT 'lead_purchase'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pro_lead_access" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pro_profiles" (
    "user_id" "uuid" NOT NULL,
    "company_name" "text" DEFAULT ''::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pro_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pro_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pro_user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'trialing'::"text" NOT NULL,
    "plan" "text" DEFAULT 'starter'::"text" NOT NULL,
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pro_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."request_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_id" "uuid" NOT NULL,
    "customer_name" "text" NOT NULL,
    "phone_country_code" "text" NOT NULL,
    "phone_number" "text" NOT NULL,
    "full_phone" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "create_account_requested" boolean DEFAULT false NOT NULL,
    "street_address" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "public"."request_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "public_slug" "text" NOT NULL,
    "category_slug" "text" NOT NULL,
    "subcategory_slug" "text",
    "market_slug" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "country_code" "text" DEFAULT 'us'::"text" NOT NULL,
    "public_description" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "quality_score" integer DEFAULT 0 NOT NULL,
    "index_status" "text" DEFAULT 'noindex'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_user_id" "uuid",
    "customer_flow" "text" DEFAULT 'guest'::"text" NOT NULL,
    "notify_email" boolean DEFAULT true NOT NULL,
    "lead_access_policy" "text" DEFAULT 'paid_only'::"text" NOT NULL,
    "lead_price_credits" integer DEFAULT 5 NOT NULL,
    "max_purchases" integer DEFAULT 5 NOT NULL,
    "purchase_count" integer DEFAULT 0 NOT NULL,
    "lead_status" "text" DEFAULT 'available'::"text" NOT NULL,
    "lead_price_fixas" integer DEFAULT 100 NOT NULL
);


ALTER TABLE "public"."service_requests" OWNER TO "postgres";


ALTER TABLE ONLY "public"."lead_pricing_rules"
    ADD CONSTRAINT "lead_pricing_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pro_credit_accounts"
    ADD CONSTRAINT "pro_credit_accounts_pkey" PRIMARY KEY ("pro_user_id");



ALTER TABLE ONLY "public"."pro_credit_transactions"
    ADD CONSTRAINT "pro_credit_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pro_lead_access"
    ADD CONSTRAINT "pro_lead_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pro_lead_access"
    ADD CONSTRAINT "pro_lead_access_request_id_pro_user_id_key" UNIQUE ("request_id", "pro_user_id");



ALTER TABLE ONLY "public"."pro_profiles"
    ADD CONSTRAINT "pro_profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."pro_subscriptions"
    ADD CONSTRAINT "pro_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."request_contacts"
    ADD CONSTRAINT "request_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_public_slug_key" UNIQUE ("public_slug");



CREATE INDEX "pro_credit_transactions_pro_user_id_idx" ON "public"."pro_credit_transactions" USING "btree" ("pro_user_id");



CREATE INDEX "pro_subscriptions_pro_user_id_idx" ON "public"."pro_subscriptions" USING "btree" ("pro_user_id");



CREATE UNIQUE INDEX "pro_subscriptions_pro_user_id_unique" ON "public"."pro_subscriptions" USING "btree" ("pro_user_id");



CREATE INDEX "request_contacts_request_id_idx" ON "public"."request_contacts" USING "btree" ("request_id");



CREATE INDEX "service_requests_category_slug_idx" ON "public"."service_requests" USING "btree" ("category_slug");



CREATE INDEX "service_requests_created_at_idx" ON "public"."service_requests" USING "btree" ("created_at" DESC);



CREATE INDEX "service_requests_lead_status_idx" ON "public"."service_requests" USING "btree" ("lead_status");



CREATE INDEX "service_requests_market_slug_idx" ON "public"."service_requests" USING "btree" ("market_slug");



CREATE INDEX "service_requests_public_slug_idx" ON "public"."service_requests" USING "btree" ("public_slug");



ALTER TABLE ONLY "public"."pro_credit_accounts"
    ADD CONSTRAINT "pro_credit_accounts_pro_user_id_fkey" FOREIGN KEY ("pro_user_id") REFERENCES "public"."pro_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pro_credit_transactions"
    ADD CONSTRAINT "pro_credit_transactions_pro_user_id_fkey" FOREIGN KEY ("pro_user_id") REFERENCES "public"."pro_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pro_credit_transactions"
    ADD CONSTRAINT "pro_credit_transactions_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pro_lead_access"
    ADD CONSTRAINT "pro_lead_access_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pro_profiles"
    ADD CONSTRAINT "pro_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pro_subscriptions"
    ADD CONSTRAINT "pro_subscriptions_pro_user_id_fkey" FOREIGN KEY ("pro_user_id") REFERENCES "public"."pro_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."request_contacts"
    ADD CONSTRAINT "request_contacts_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can create request contacts" ON "public"."request_contacts" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Anyone can create service requests" ON "public"."service_requests" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Anyone can read public service requests" ON "public"."service_requests" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Pros can read own credit account" ON "public"."pro_credit_accounts" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "pro_user_id"));



CREATE POLICY "Pros can read own credit transactions" ON "public"."pro_credit_transactions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "pro_user_id"));



CREATE POLICY "Pros can read own lead access" ON "public"."pro_lead_access" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "pro_user_id"));



CREATE POLICY "Pros can read own profile" ON "public"."pro_profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Pros can read own subscriptions" ON "public"."pro_subscriptions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "pro_user_id"));



ALTER TABLE "public"."lead_pricing_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pro_credit_accounts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pro_credit_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pro_lead_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pro_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pro_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."request_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_requests" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





































































































































































GRANT ALL ON TABLE "public"."lead_pricing_rules" TO "anon";
GRANT ALL ON TABLE "public"."lead_pricing_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."lead_pricing_rules" TO "service_role";



GRANT ALL ON TABLE "public"."pro_credit_accounts" TO "anon";
GRANT ALL ON TABLE "public"."pro_credit_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."pro_credit_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."pro_credit_transactions" TO "anon";
GRANT ALL ON TABLE "public"."pro_credit_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."pro_credit_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."pro_lead_access" TO "anon";
GRANT ALL ON TABLE "public"."pro_lead_access" TO "authenticated";
GRANT ALL ON TABLE "public"."pro_lead_access" TO "service_role";



GRANT ALL ON TABLE "public"."pro_profiles" TO "anon";
GRANT ALL ON TABLE "public"."pro_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."pro_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."pro_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."pro_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."pro_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."request_contacts" TO "anon";
GRANT ALL ON TABLE "public"."request_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."request_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."service_requests" TO "anon";
GRANT ALL ON TABLE "public"."service_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."service_requests" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































