


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


CREATE TABLE IF NOT EXISTS "public"."pro_lead_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_id" "uuid" NOT NULL,
    "pro_user_id" "uuid" NOT NULL,
    "access_type" "text" DEFAULT 'lead_purchase'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pro_lead_access" OWNER TO "postgres";


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
    "lead_access_policy" "text" DEFAULT 'paid_only'::"text" NOT NULL
);


ALTER TABLE "public"."service_requests" OWNER TO "postgres";


ALTER TABLE ONLY "public"."pro_lead_access"
    ADD CONSTRAINT "pro_lead_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pro_lead_access"
    ADD CONSTRAINT "pro_lead_access_request_id_pro_user_id_key" UNIQUE ("request_id", "pro_user_id");



ALTER TABLE ONLY "public"."request_contacts"
    ADD CONSTRAINT "request_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_public_slug_key" UNIQUE ("public_slug");



CREATE INDEX "request_contacts_request_id_idx" ON "public"."request_contacts" USING "btree" ("request_id");



CREATE INDEX "service_requests_category_slug_idx" ON "public"."service_requests" USING "btree" ("category_slug");



CREATE INDEX "service_requests_market_slug_idx" ON "public"."service_requests" USING "btree" ("market_slug");



CREATE INDEX "service_requests_public_slug_idx" ON "public"."service_requests" USING "btree" ("public_slug");



ALTER TABLE ONLY "public"."pro_lead_access"
    ADD CONSTRAINT "pro_lead_access_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."request_contacts"
    ADD CONSTRAINT "request_contacts_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."service_requests"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can create request contacts" ON "public"."request_contacts" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Anyone can create service requests" ON "public"."service_requests" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Anyone can read public service requests" ON "public"."service_requests" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."pro_lead_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."request_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_requests" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





































































































































































GRANT ALL ON TABLE "public"."pro_lead_access" TO "anon";
GRANT ALL ON TABLE "public"."pro_lead_access" TO "authenticated";
GRANT ALL ON TABLE "public"."pro_lead_access" TO "service_role";



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































