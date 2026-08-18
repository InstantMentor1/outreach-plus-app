# Outreach+ private client onboarding

## 1. Environment variables

Add these values in Vercel and to a local, uncommitted `.env.local` file:

```text
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ADMIN_PASSWORD=
SESSION_SECRET=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_GRAPH_API_VERSION=v24.0
META_APP_SECRET=
```

`SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, `SESSION_SECRET` and `GEMINI_API_KEY` are server secrets. Never add them to client code, Git, screenshots or support messages. Generate `SESSION_SECRET` with a cryptographically secure random generator and use at least 32 characters.

## 2. Supabase

Create a Supabase project, then copy its project URL and publishable key. Create a server secret key in Supabase Dashboard → Project Settings → API, and place it only in `SUPABASE_SECRET_KEY`.

Run `supabase/migrations/202608180001_client_onboarding.sql` using the Supabase SQL Editor or your migration workflow.

In Storage, create `brand-books` as a **private** bucket. Set allowed MIME type to `application/pdf` and maximum file size to `15 MB`. Do not create public policies or public URLs for this bucket.

## 3. Vercel

Import this GitHub repository, add every environment variable for the required environment (Production and Preview as appropriate), then redeploy. The application uses server-only Supabase calls; no `NEXT_PUBLIC_SUPABASE_*` variables are used.

## 4. Admin flow

Visit `/admin/login` and sign in with `ADMIN_PASSWORD`. Create a client, supply the exported Pomelli PDF, choose **Retry PDF analysis**, review/edit the Brand Brain, approve it, then generate an invitation. The raw invitation link is returned once and should be sent privately.

## 5. WhatsApp bot flow

Outreach+ is designed to operate as the client's WhatsApp bot. Add a Meta WhatsApp Cloud API phone number and set the five `WHATSAPP_*` / `META_APP_SECRET` values above. In Meta, set the webhook callback URL to `https://your-domain/api/webhooks/whatsapp`, use the exact `WHATSAPP_VERIFY_TOKEN`, and subscribe to WhatsApp messages. Meta verifies the endpoint with the GET challenge; every incoming POST is HMAC-verified with `META_APP_SECRET` before Outreach+ processes it.

Add the client's WhatsApp number in international digits-only format when creating their internal profile. After their Brand Brain is approved, messages from that number are matched server-side, saved to that client's conversation, sent to Gemini with approved brand context, and answered through the WhatsApp Cloud API. Clients do not need to sign in or open the website.

## 6. Client flow

Open the invitation URL in a browser. It exchanges the token for an HTTP-only workspace session and redirects to `/workspace`. Use **End session** to remove that session. A client never receives an admin login or public registration option.

## Security notes

Only the SHA-256 hash of an invitation token is stored. Invitation URLs expire after seven days and can be revoked. PDFs remain private. Gemini extraction is draft-only until an administrator approves it. The public `/chat` route is a demo and does not have persistent client memory.
