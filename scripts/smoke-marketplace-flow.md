# Marketplace Smoke Flow

This is a lightweight manual smoke script for staging/local QA. It is intentionally markdown because the flow depends on authenticated Supabase users, email/session state, and FIXA balances.

## Preflight

- Run `pnpm db:migrate`.
- Run `pnpm db:schema:dump`.
- Run `pnpm lint`.
- Run `pnpm build`.
- Start the app with the normal local command for the environment.
- Confirm no `.env` values are printed during any command.

## Smoke Steps

1. Customer creates a request from `/book`.
2. Public `/requests/[requestSlug]` renders without private contact data.
3. Pro logs in and lands in `/pro`.
4. Pro completes `/pro/profile` with hometown, radius, category, and subcategory.
5. `/pro/leads` shows the customer request as a matched lead.
6. Lead card explains match percentage, service area, category/subcategory, freshness, and competition.
7. Pro unlocks the lead.
8. Repeating unlock does not double-charge and returns existing access.
9. Purchased lead no longer appears as a new matched opportunity.
10. Customer manages the request from `/customer/requests/[id]/manage`.
11. Customer submits one review for the connected pro.
12. Duplicate review for the same request/customer/pro is rejected.
13. Approved review appears on `/pro/[slug]`.

## Privacy Checks

- Search rendered public request/pro pages for customer email, phone, and private address.
- Search public page code paths for `request_contacts`.
- Confirm `request_contacts` is used only in authenticated/API contexts where access is explicitly checked.

## Known Non-Automated Items

- Email verification and auth provider behavior.
- Real payment/FIXA top-up flows.
- Admin review moderation UI.
- External identity/license/background verification providers.
