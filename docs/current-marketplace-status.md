# Current Marketplace QA Status

Generated: 2026-05-21

## Flow Status

| Area | Status | Notes |
| --- | --- | --- |
| Customer request creation | Ready for manual QA | Verify from `/book` through `/customer` dashboard. |
| Public request pages | Ready for manual QA | Must remain public-safe and never expose `request_contacts`. |
| Pro signup/login | Hardened | Pro-specific login now runs through the central role redirect and defaults to `/pro`. |
| Pro profile edit | Ready for manual QA | Typeahead hometown, radius-derived areas, category-first subcategory selection. |
| Lead matching | Ready for manual QA | `/pro/leads` filters to open, available, profile-matched, not-yet-purchased leads. |
| Lead unlock | Ready for regression QA | Existing unlock hardening should be checked for idempotency and sold-out/status handling. |
| Customer request management | Ready for manual QA | Review form appears only in authenticated customer management for connected pros. |
| Reviews | Foundation ready | API validates ownership, relationship, duplicate reviews, and pending moderation default. |
| Public pro profiles | Hardened | Public JSON-LD no longer emits pro account email/phone fields. |
| Verification trust | Foundation ready | Status/badge fields are displayed; external verification provider is not integrated. |

## QA Checklist

- [ ] Customer signup lands in customer workspace.
- [ ] Customer can create a request from `/book`.
- [ ] Public request page renders SEO/retrieval sections.
- [ ] Public request page does not expose private contact data.
- [ ] Pro signup/login lands in `/pro`.
- [ ] Pro profile saves hometown from typeahead.
- [ ] Radius preview generates service cities.
- [ ] Subcategories show only after category selection.
- [ ] `/pro/leads` shows only matching open/available leads.
- [ ] Already purchased leads do not appear as new opportunities.
- [ ] Lead card explains why it matches.
- [ ] Unlocking a lead is idempotent.
- [ ] Conversation/contact flow opens only after valid access.
- [ ] Customer can manage request from authenticated customer page.
- [ ] Customer can submit one review for a valid connected pro.
- [ ] Duplicate review is rejected.
- [ ] Pending reviews do not appear publicly until approved.
- [ ] Public pro profile shows clean empty states when review/portfolio data is missing.
- [ ] Public pro structured data validates with only existing public data.

## Remaining Production Gaps

- Admin moderation UI for `pro_reviews`.
- Automated browser E2E suite with seeded Supabase test users.
- External identity, license, insurance, and background-check providers.
- Operational alerts for unlock/review/notification failures.
- More granular review eligibility after job completion status exists.
