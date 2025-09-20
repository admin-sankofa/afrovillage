# Afro Village – Supabase Auth Hardening

This repo contains a Vite/React client and an Express API backed by Supabase (Postgres + Auth). The recent changes align both layers on Supabase JWT verification, stabilise API consumption in the frontend, and document the database / RLS setup.

## Environment Variables

Configure variables in `.env` (server) and `.env.local` (client). Never expose server secrets to the client.

### Client (`client/.env.local`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Server (`.env`)
- `SUPABASE_URL` (or keep legacy `VITE_SUPABASE_URL` for backward compatibility)
- `SUPABASE_JWKS_URL` (optional, defaults to `${SUPABASE_URL}/auth/v1/keys`)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only tasks like `ensureTestUser`)
- `DATABASE_URL`
- Optional dev helpers: `TEST_AUTH_EMAIL`, `TEST_AUTH_PASSWORD`

## Local Development

```bash
npm install
npm run dev
```

The dev script starts the Express server with Vite in middleware mode. The React app uses `apiFetch` to call `/api/*` routes and automatically attaches the current Supabase access token from `supabase.auth.getSession()`.

## Auth Flow & Middleware

- `server/supabaseAuth.ts` validates `Authorization: Bearer <JWT>` using Supabase JWKS (`RS256`).
- Successful verification stores lightweight audit info on `req.auth` and refreshes the local `users` table via `storage.upsertUser`.
- All protected routes in `server/routes.ts` now consume the same `verifySupabaseAuth` middleware.
- Error responses carry a `reason` (e.g. `missing_header`, `token_expired`, `jwks_fetch_error`) to help the client distinguish between “session expired” and “access denied”.

## Frontend API Usage

- `client/src/lib/queryClient.ts` exposes `apiFetch` / `apiRequest` and a shared query function that always sets the bearer token. Any new fetch should use these helpers.
- Toast copy on 401s is contextual and no longer auto-redirects. Sessions are handled exclusively by Supabase.

## Database Schema & RLS

- `shared/schema.ts` now models primary keys and foreign keys as native `uuid`. 
- Existing databases should run `supabase/migrations/20250218_convert_ids_to_uuid.sql` to migrate columns from `varchar` to `uuid` before pushing the new schema.
- `supabase/rls-policies.sql` enables / defines RLS for `users`, `artist_profiles`, and `messages` using `auth.uid()`.

Apply SQL files via the Supabase SQL editor or `psql`:
```bash
psql "$DATABASE_URL" -f supabase/migrations/20250218_convert_ids_to_uuid.sql
psql "$DATABASE_URL" -f supabase/rls-policies.sql
```

## Suggested Test Flows

1. **Login & Profile** – Authenticate (email/OAuth), load `/api/auth/user`, update profile, confirm 200/JSON responses and DB row changes.
2. **Messaging** – Load community + direct messages, send a message, verify API 200 + UI update.
3. **Token Expiry** – Use Supabase dashboard to shorten token lifetime and ensure the client surfaces the new toast instead of looping redirects.
4. **RLS Guardrails** – In Supabase SQL editor run queries as another user to confirm records from other users are blocked.

## Troubleshooting

- 401 with `reason=token_expired`: the session is stale, ask the user to sign in again.
- 401 with `reason=jwks_fetch_error`: verify `SUPABASE_URL`/network access from the server.
- Ensure the service role key is never loaded in the client bundle.
