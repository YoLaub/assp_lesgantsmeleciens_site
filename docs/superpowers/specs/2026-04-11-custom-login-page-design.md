# Custom Login Page — Design Spec

## Summary

Replace the default Clerk `<SignIn />` widget on the login page with a custom-built split layout using **Clerk Elements** (`@clerk/elements`). The page should feel like a native part of the admin section, not an external service. Google OAuth is the sole sign-in method. No sign-up flow.

## Motivation

The current login page at `/login` renders Clerk's pre-built `<SignIn />` component, which looks like an embedded third-party widget. The goal is full visual cohesion with the admin design language (slate tones, brand-red `#DF0606`, uppercase tracking labels) while keeping Clerk as the auth provider with minimal custom auth logic.

## Approach

**Clerk Elements** — headless UI primitives from `@clerk/elements`. We build the layout and styling entirely in Tailwind; Clerk manages the OAuth flow, session creation, error handling, and redirects behind the scenes.

Why this over alternatives:
- `appearance` prop on `<SignIn />`: can't achieve a split layout or full design control.
- `useSignIn()` hook: same visual result but requires manual OAuth redirect handling and error plumbing. Unnecessary complexity.

## Layout

Full-viewport-height split layout, two panels side by side.

### Left Panel (45% width)

- **Background image:** Static import from `public/accueil_valeur.png` via `next/image` — full cover (`object-cover`), positioned center. Consistent with how the front-end handles static assets (Header.tsx, Footer.tsx).
- **Dark overlay:** `bg-slate-900/70` on top of the image for text readability
- **Brand-red accent bar:** 4px strip along the top edge, `#DF0606`
- **Centered content (vertically and horizontally):**
  - Club logo — static import from `public/logoBlanc.webp` via `next/image`, same pattern as Header.tsx. Displayed in a frosted glass container (`bg-white/10 backdrop-blur border border-white/10 rounded-xl`), ~72px.
  - "Administration" label — uppercase, tracking-widest, brand-red `#DF0606`
  - "Les Gants Meleciens" — large white heading
  - Thin separator line
  - "Systeme de Gestion Interne" — subtle white/45% subtitle
- **Footer:** copyright line at the bottom, very low opacity

### Right Panel (55% width)

- **Background:** `slate-100` (`#f1f5f9`)
- **Centered content:**
  - "Connexion" heading — `text-xl font-bold text-slate-900`
  - Subtitle — "Connectez-vous pour acceder au panneau d'administration" in `text-slate-400`
  - **Google sign-in button:** full-width, brand-red `#DF0606` background, white text + white Google icon, rounded-xl, subtle red shadow (`shadow-brand-red/25`)
  - "Acces reserve aux administrateurs" — small muted footer text
- **Error state:** `<Clerk.GlobalError>` renders in a red-50 banner below the button when auth fails
- **Loading state:** `<Clerk.Loading>` shows a spinner inside the button during OAuth redirect

### Mobile Responsiveness

- On small screens, the split layout stacks vertically
- Left panel becomes a short banner (reduced height, logo + club name only)
- Right panel takes full width below with the Google button

## Technical Details

### New dependency

- `@clerk/elements` — install alongside existing `@clerk/nextjs`

### Files changed

**`src/app/login/[[...sign-in]]/page.tsx`** — the only file that changes. Replace the current implementation:

```tsx
// CURRENT (will be replaced)
import { SignIn } from "@clerk/nextjs";
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Administration</h1>
          <p className="text-2xl font-bold text-slate-900">Les Gants Meleciens</p>
        </div>
        <SignIn afterSignInUrl="/admin/dashboard" />
      </div>
    </div>
  );
}
```

With a new implementation using:
- `'use client'` directive (Clerk Elements requires client components)
- `import * as Clerk from '@clerk/elements/common'`
- `import * as SignIn from '@clerk/elements/sign-in'`
- `SignIn.Root` wrapping the page
- `SignIn.Step name="start"` as the sole step
- `Clerk.Connection name="google"` for the Google OAuth button
- `Clerk.GlobalError` for error display
- `Clerk.Loading` for loading states
- `next/image` with static imports for the background image (`accueil_valeur.png`) and logo (`logoBlanc.webp`) — same pattern as the front-end Header/Footer

### Files NOT changed

- `src/proxy.ts` (middleware) — unchanged, still protects `/admin/*` routes
- `src/app/layout.tsx` — unchanged, `ClerkProvider` stays as-is
- `src/app/admin/_components/AdminSidebar.tsx` — unchanged, `UserButton` stays
- Route structure (`/login/[[...sign-in]]`) — unchanged

### Clerk Elements components used

| Component | Purpose |
|---|---|
| `SignIn.Root` | Wraps the entire sign-in flow |
| `SignIn.Step name="start"` | The initial (and only) step |
| `Clerk.Connection name="google"` | Renders the Google OAuth button trigger |
| `Clerk.GlobalError` | Displays auth errors (e.g. account not found) |
| `Clerk.Loading` | Conditional rendering for loading states |

### Post-sign-in redirect

The current `<SignIn afterSignInUrl="/admin/dashboard" />` prop doesn't exist on Clerk Elements. Use `SignIn.Root`'s `fallbackRedirectUrl="/admin/dashboard"` prop instead. This redirects to `/admin/dashboard` after successful sign-in when no other redirect URL is pending (e.g. if the user was redirected from a specific admin page, they'll go back there instead).

### Auth flow

1. User visits `/login` (or gets redirected there by middleware when accessing `/admin/*`)
2. Custom page renders with the split layout
3. User clicks "Continuer avec Google"
4. Clerk handles the OAuth redirect to Google and back
5. On success, Clerk creates a session and redirects to the originally requested URL (or `/admin/dashboard` as fallback)
6. On failure, `Clerk.GlobalError` displays the error message

### No additional steps needed

Since this is Google OAuth only (no email/password), there are no verification steps, no password strategy, no forgot-password flow. The `SignIn.Step name="start"` with `Clerk.Connection name="google"` is the entire flow.

## Design Tokens

| Token | Value | Usage |
|---|---|---|
| Brand red | `#DF0606` / `brand-red` | Accent bar, "Administration" label, Google button |
| Left panel overlay | `slate-900/70` | Over background image |
| Right panel bg | `slate-100` (`#f1f5f9`) | Form panel background |
| Heading | `slate-900` | "Connexion" title |
| Subtitle | `slate-400` | Descriptive text |
| Logo container | `white/10` + `backdrop-blur` | Frosted glass effect |
| Background image | `public/accueil_valeur.png` | Left panel cover image (static import, `next/image`) |
| Logo | `public/logoBlanc.webp` | White club logo (static import, `next/image`) |

## Scope

- One new package (`@clerk/elements`)
- One file rewritten (`src/app/login/[[...sign-in]]/page.tsx`)
- No new routes, no new API endpoints, no database changes
- No changes to the auth flow logic — Clerk still handles everything
