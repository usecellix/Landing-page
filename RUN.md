# Run CELLIX Landing Page

Open terminal in the project folder, then:

```bash
npm install
npm run dev
```

Open **http://localhost:5173/** in your browser.

---

### Other commands

```bash
npm run build      # Production build
npm run preview    # Preview production build at http://localhost:4173/
npm run lint       # Run linter
```

---

## The signed-in app surface (`/app`)

The marketing pages are static. Everything under `/login` and `/app/*` is the
signed-in product surface, and it needs `cellix_backend` running — it has no
mock/offline mode.

| Route | What it is |
|---|---|
| `/login` | Google + Microsoft OAuth |
| `/app` | Dashboard — balance, plan, session list |
| `/app/chat` | Ask-mode chat across all your Excel sessions |
| `/app/session/:id` | One session's transcript + a chat scoped to it |
| `/app/billing` | Plans, top-up packs, transaction history |
| `/app/settings` | Profile, plan, retention, sign out |

**This chat is read-only.** It answers questions *about* work already done in
the Excel add-in; it cannot modify a workbook. That is enforced server-side —
`WebChatService` never returns actions, and there is no Office.js host in a
browser to apply one to.

### Setup

1. **Run the backend** (`cellix_backend/`, port 4001):
   ```bash
   cd ../cellix_backend
   npm run start:dev
   ```

2. **Point this app at it.** Create `.env` here if the backend isn't on the
   default `http://localhost:4001`:
   ```
   VITE_API_BASE_URL=http://localhost:4001
   ```

3. **Let the backend trust this origin.** Better Auth only accepts a session
   cookie for an origin in its `trustedOrigins`, and CORS has to allow it too.
   In `cellix_backend/.env`:
   ```
   CLIENT_ORIGIN=http://localhost:5173
   ```
   (Vite picks the next free port if 5173 is taken — use whichever it prints.)

4. **OAuth redirect URIs.** Add this origin's callback to both providers'
   consoles, or sign-in returns an error:
   ```
   http://localhost:4001/api/auth/callback/google
   http://localhost:4001/api/auth/callback/microsoft
   ```
   The callback goes to the **backend**, not this app — Better Auth is mounted
   there and redirects to `/app` afterwards.

### Payments

Checkout is **Razorpay**, not Stripe (see `CREDIT_SYSTEM.md` §7 — the Stripe
integration was deliberately migrated away from on 2026-09-10). Use Razorpay
test mode; `CREDIT_SYSTEM.md` §7 has the full setup and manual test sequence.

A signed-in subscriber returns from checkout to `/app?subscribed=<tier>`, which
raises the success toast and refetches the balance — never to a payment
confirmation page. Credits are granted by the **webhook**, not by that redirect,
so the webhook must be reachable (tunnel it) or the balance won't move.

### Build note

`/login` and `/app/*` are marked `clientOnly` in `src/routes.tsx`, so
`scripts/prerender.mjs` emits an empty shell for them instead of prerendering.
They read the browser's auth session; server-rendering them would bake a
signed-out snapshot into the HTML that flashes before hydration corrects it.
