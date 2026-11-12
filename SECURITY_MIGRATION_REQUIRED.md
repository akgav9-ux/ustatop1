# Security migration required before public launch

## Current blocker

The legacy phone/password flow stores the password in the `users` table and checks it in browser code. A browser cannot safely protect a password column or enforce account identity. The localStorage `user_session` value is also editable by the visitor.

This branch reduces unnecessary exposure by:
- stopping automatic profile creation from a browser-supplied user ID;
- removing `select('*')` from public profile reads and the startup diagnostic query;
- returning only safe profile fields from registration.

These are containment improvements, not a replacement for authentication.

## Required migration

1. Confirm the actual Supabase table definitions, ID types, foreign keys, triggers, and current RLS policies. Do not apply guessed SQL to production.
2. Move password verification to a trusted authentication service. Preferred path: Supabase Auth with a supported verified sign-in method. If phone/password must remain, use a server-side endpoint with a password hash (Argon2id or bcrypt), rate limiting, and secure HttpOnly session cookies. Never compare passwords in React.
3. Link each profile row to the authenticated principal. The server/database must derive the acting user ID from the verified session, not from request payloads or localStorage.
4. Enable and test RLS for every private table:
   - users: public profile fields only; private phone/account fields owner-only;
   - orders: public read for visible/open listings; create/update/delete only by the authenticated author;
   - responses: create only as the authenticated master; status changes only by the order author;
   - messages: read/write only for chat participants;
   - notifications: read/update only by the recipient.
5. Remove the legacy `users.password` column only after accounts have been migrated and the new sign-in flow is verified.
6. Test two separate accounts against each other, including attempts to change IDs in requests, read another user's phone/profile data, edit another user's order, accept another user's responses, and read another user's messages/notifications.

## Deployment gate

Do not publish the application as production-ready until the migration and cross-account authorization tests above pass. The current repository inspection did not include the live Supabase schema or RLS policy definitions, so this branch intentionally does not invent or apply database SQL.
