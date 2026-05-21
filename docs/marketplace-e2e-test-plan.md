# Fixly Marketplace E2E Test Plan

Generated: 2026-05-21

## Scope

This plan verifies the customer request to pro review loop across the current marketplace foundation:

- Customer signup and request creation
- Public request SEO page
- Pro signup, profile completion, and service coverage
- Pro lead matching and unlock
- Conversation/contact flow
- Customer request management
- Verified review submission and public pro review display

Security boundaries:

- Do not expose `request_contacts` on public pages.
- Public `/requests/*` and `/pro/*` pages must show only public marketplace/profile data.
- Do not verify by printing secret environment values.

## Test Data Needed

- One customer account.
- One pro account.
- A supported market/city from the geo dataset.
- One service category and one subcategory that match the customer request.
- Enough FIXA balance on the pro account to unlock the test lead.

## Customer Flow

1. Visit `/customer/signup`.
2. Create a customer account and confirm the login/session lands in the customer area.
3. Visit `/book`.
4. Create a request with:
   - Valid market/city
   - Category and subcategory
   - Public-safe problem description
   - Urgency/date fields if available
5. Confirm the customer dashboard shows the new request.
6. Open the public request page at `/requests/[requestSlug]`.
7. Verify the public page includes:
   - Semantic issue summary
   - Urgency/scope guidance
   - FAQ/pricing/internal links where available
   - Unlock CTA for pros
8. Verify the public page does not expose:
   - `request_contacts`
   - Customer email
   - Customer phone
   - Private address/contact fields

Expected result: Customer can create and manage the request, and the public request page is useful without exposing private contact data.

## Pro Signup And Profile Flow

1. Visit `/pro/signup`.
2. Create a pro account and complete onboarding if prompted.
3. Confirm login/session lands in `/pro`.
4. Visit `/pro/profile`.
5. Complete profile fields:
   - Company or display name
   - Bio
   - Years experience
   - Avatar/logo URL placeholder if available
   - License info
6. In Hometown, type at least 3 characters.
7. Select a market from the typeahead suggestions.
8. Select service radius: 5, 15, 30, or 50 miles.
9. Confirm generated service cities preview appears.
10. Select the category that matches the customer request.
11. Confirm subcategories appear only after category selection.
12. Select the matching subcategory.
13. Save the profile.
14. Confirm the profile completion score improves and missing fields update.

Expected result: Profile saves `home_market_slug`, `service_radius_miles`, `derived_service_area_slugs`, `service_categories`, and `service_subcategories`.

## Pro Lead Matching Flow

1. Visit `/pro/leads`.
2. Confirm matching leads are filtered to:
   - Open requests only
   - Available leads only
   - Pro service area markets
   - Pro service categories
3. Confirm the customer test request appears when category and market match.
4. Confirm excluded leads do not appear as new leads:
   - Archived
   - Closed
   - Sold out
   - Unavailable
   - Already purchased by this pro
5. Check the lead card for:
   - Match percentage
   - Service area reason
   - Category/subcategory reason
   - Freshness reason
   - Competition reason
   - Unlock CTA
6. Test filters:
   - Best matches
   - Newest
   - Low competition
   - Exact service match
   - Nearby only

Expected result: `/pro/leads` shows relevant unmatched opportunities with explainable scoring and clear empty states.

## Lead Unlock And Conversation Flow

1. Open the matched public request page from `/pro/leads`.
2. Click the unlock CTA.
3. Confirm unlock succeeds only if:
   - Request is open
   - Lead is available
   - Purchase count is below max purchases
   - Pro has sufficient FIXA balance
4. Refresh and repeat the unlock attempt.
5. Confirm the repeated attempt returns existing access and does not double charge.
6. Confirm the lead appears in purchased leads, not new matched leads.
7. Start or open the conversation/contact flow.
8. Confirm customer receives the relevant notification/status update.

Expected result: Unlock is idempotent, paid access is durable, and purchased leads move out of the new leads list.

## Customer Request Management Flow

1. Log in as the customer.
2. Visit `/customer/requests/[id]/manage`.
3. Confirm connected pros are visible.
4. Confirm any pro contact unlock/conversation state appears only inside authenticated customer management.
5. Confirm public pages still do not expose private contact data.

Expected result: Customer can manage connected pros from authenticated request management only.

## Review Flow

1. On the customer request management page, locate the connected pro.
2. Submit a review with rating and optional text.
3. Confirm success message says the review was submitted for moderation.
4. Attempt to submit a second review for the same request/customer/pro.
5. Confirm duplicate review is blocked.
6. Confirm unrelated customer accounts cannot review the pro for this request.
7. Confirm reviews default to pending moderation.
8. Approve the review in the database/admin workflow.
9. Visit `/pro/[slug]`.
10. Confirm approved review appears with verified label if linked to a valid request/pro relationship.

Expected result: Only valid customers can submit one review per request/pro relationship, and public display requires moderation approval.

## Public Pro Profile Flow

1. Visit `/pro/[slug]`.
2. Verify visible sections:
   - Direct summary
   - Services offered
   - Service areas
   - Trust/verification badges
   - Response metrics
   - Reviews or clean empty state
   - FAQ
   - CTA buttons
3. Inspect page source/structured data.
4. Confirm JSON-LD includes only data that exists:
   - LocalBusiness
   - Service
   - AggregateRating only when review count exists
   - Review only for approved reviews
5. Confirm no private customer/request contact data appears.
6. Confirm category, subcategory, and service area internal links resolve.

Expected result: Public pro profile is indexable, retrieval-friendly, and privacy-safe.

## Role Redirect Checks

1. Customer login with no `next` should land in `/customer`.
2. Customer login with safe customer `next` should preserve that destination.
3. Pro login with no `next` should land in `/pro`.
4. Pro login with safe pro `next` should preserve that destination.
5. A customer account using a pro-only `next=/pro` should not bypass pro role checks.
6. Admin/internal pages should continue to use their existing account/admin guards.

Expected result: Role routing sends pros to the pro workspace and customers to the customer workspace without unsafe open redirects.

## Pass Criteria

- `pnpm db:migrate` passes.
- `pnpm db:schema:dump` passes.
- `pnpm snapshot` creates a new local archive.
- `pnpm lint` passes.
- `pnpm build` passes.
- No public page exposes `request_contacts`.
- No duplicate review can be submitted for the same request/customer/pro.
- Purchased leads are excluded from new matched lead opportunities.
