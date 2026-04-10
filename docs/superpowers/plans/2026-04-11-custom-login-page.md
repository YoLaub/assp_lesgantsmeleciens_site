# Custom Login Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the default Clerk `<SignIn />` widget with a custom split-layout login page using Clerk Elements, Google OAuth only.

**Architecture:** Single file rewrite of `src/app/login/[[...sign-in]]/page.tsx`. Uses `@clerk/elements` headless primitives for the auth flow, `next/image` static imports for logo and background, and Tailwind for all styling. The existing middleware, ClerkProvider, and route structure remain untouched.

**Tech Stack:** Next.js 16, React 19, @clerk/elements, @clerk/nextjs 6.39, Tailwind CSS 4, next/image

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/app/login/[[...sign-in]]/page.tsx` | Full rewrite — split layout with Clerk Elements Google OAuth |
| None | `package.json` | `@clerk/elements` added via npm install |

This is a single-file change. No new files created, no other files modified.

---

### Task 1: Install @clerk/elements

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the package**

Run:
```bash
npm install @clerk/elements
```

Expected: Package installs successfully. `@clerk/elements` appears in `package.json` dependencies.

- [ ] **Step 2: Verify the install**

Run:
```bash
npm ls @clerk/elements
```

Expected: Shows `@clerk/elements@<version>` in the dependency tree, no peer dependency warnings related to `@clerk/nextjs`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @clerk/elements for custom login page"
```

---

### Task 2: Build the left branding panel

Implement the left side of the split layout — background image, dark overlay, centered logo and branding text. No Clerk logic yet — just the visual shell.

**Files:**
- Modify: `src/app/login/[[...sign-in]]/page.tsx`

- [ ] **Step 1: Replace the current login page with the split layout shell and left panel**

Replace the entire contents of `src/app/login/[[...sign-in]]/page.tsx` with:

```tsx
'use client'

import Image from 'next/image'
import logoBlanc from '@/../public/logoBlanc.webp'
import bgImage from '@/../public/accueil_valeur.png'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Branding Panel */}
      <div className="relative w-full lg:w-[45%] min-h-[240px] lg:min-h-screen overflow-hidden">
        {/* Background image */}
        <Image
          src={bgImage}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          placeholder="blur"
          className="object-cover object-center"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/70" />

        {/* Brand-red accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-red z-10" />

        {/* Centered content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 py-12 text-center">
          {/* Logo in frosted glass container */}
          <div className="w-[72px] h-[72px] rounded-xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center mb-7">
            <Image
              src={logoBlanc}
              alt="Logo Les Gants Méléciens"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>

          <p className="text-xs font-black uppercase tracking-widest text-brand-red mb-1">
            Administration
          </p>
          <h1 className="text-2xl font-bold text-white leading-tight">
            Les Gants<br />Méléciens
          </h1>

          <div className="w-15 h-px bg-white/10 my-4" />

          <p className="text-xs text-white/45">
            Système de Gestion Interne
          </p>

          {/* Footer — only visible on desktop */}
          <p className="hidden lg:block absolute bottom-6 text-[9px] uppercase tracking-widest text-white/20">
            &copy; {new Date().getFullYear()} Les Gants Méléciens
          </p>
        </div>
      </div>

      {/* Right Panel placeholder */}
      <div className="flex-1 bg-slate-100 flex items-center justify-center p-12">
        <p className="text-slate-400">Sign-in form goes here</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run the dev server and verify visually**

Run:
```bash
npm run dev
```

Open `http://localhost:3000/login` in the browser. Verify:
- Split layout: left panel with background image, dark overlay, red accent bar, centered logo/branding
- Right panel: slate-100 background with placeholder text
- On mobile viewport: left panel stacks above as a short banner, right panel below
- Logo renders inside the frosted glass container
- "Administration" label is in brand-red

- [ ] **Step 3: Commit**

```bash
git add src/app/login/[[...sign-in]]/page.tsx
git commit -m "feat: add split layout shell with left branding panel for login page"
```

---

### Task 3: Build the right panel with Clerk Elements Google OAuth

Add the Clerk Elements sign-in flow to the right panel — Google button, error state, loading state.

**Files:**
- Modify: `src/app/login/[[...sign-in]]/page.tsx`

- [ ] **Step 1: Add Clerk Elements imports and replace the right panel placeholder**

Update the imports at the top of `src/app/login/[[...sign-in]]/page.tsx`:

```tsx
'use client'

import Image from 'next/image'
import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import logoBlanc from '@/../public/logoBlanc.webp'
import bgImage from '@/../public/accueil_valeur.png'
```

Then replace the right panel placeholder (`<div className="flex-1 bg-slate-100 ...">...</div>`) with:

```tsx
      {/* Right Sign-In Panel */}
      <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 lg:p-12">
        <SignIn.Root fallbackRedirectUrl="/admin/dashboard">
          <SignIn.Step
            name="start"
            className="w-full max-w-[360px] text-center"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Connexion
            </h2>
            <p className="text-sm text-slate-400 mb-8">
              Connectez-vous pour accéder au panneau d&apos;administration
            </p>

            <Clerk.GlobalError className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600" />

            <Clerk.Connection
              name="google"
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-brand-red px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(223,6,6,0.25)] transition-colors hover:bg-red-700 active:bg-red-800"
            >
              <Clerk.Loading scope="provider:google">
                {(isLoading) =>
                  isLoading ? (
                    <svg
                      className="size-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <>
                      <svg
                        className="size-5"
                        viewBox="0 0 17 16"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          fill="currentColor"
                          d="M8.82 7.28v2.187h5.227c-.16 1.226-.57 2.124-1.192 2.755-.764.765-1.955 1.6-4.035 1.6-3.218 0-5.733-2.595-5.733-5.813 0-3.218 2.515-5.814 5.733-5.814 1.733 0 3.005.685 3.938 1.565l1.538-1.538C12.998.96 11.256 0 8.82 0 4.41 0 .705 3.591.705 8s3.706 8 8.115 8c2.382 0 4.178-.782 5.582-2.24 1.44-1.44 1.893-3.475 1.893-5.111 0-.507-.035-.978-.115-1.369H8.82Z"
                        />
                      </svg>
                      Continuer avec Google
                    </>
                  )
                }
              </Clerk.Loading>
            </Clerk.Connection>

            <p className="mt-10 text-[11px] text-slate-300">
              Accès réservé aux administrateurs
            </p>
          </SignIn.Step>
        </SignIn.Root>
      </div>
```

- [ ] **Step 2: Run the dev server and verify the full page**

Run:
```bash
npm run dev
```

Open `http://localhost:3000/login` in the browser. Verify:
- Left panel: unchanged — branding, background image, overlay
- Right panel: "Connexion" heading, subtitle, brand-red Google button with Google icon
- Click the Google button: should redirect to Google OAuth flow (may fail in dev if Google OAuth not configured in Clerk dashboard — that's OK, verify the redirect initiates)
- Loading state: button shows a spinner while the redirect is processing
- "Accès réservé aux administrateurs" footer text visible below the button
- Mobile: stacks vertically — short branding banner on top, Google button below

- [ ] **Step 3: Verify error state**

To test error rendering, you can temporarily force an error by trying to sign in with a Google account that is not in the Clerk allowlist (if applicable). The `Clerk.GlobalError` should display in a red-50 banner above the Google button.

If you can't trigger an error easily, visually verify the `Clerk.GlobalError` element is present in the DOM (it renders empty when there's no error, which is correct).

- [ ] **Step 4: Commit**

```bash
git add src/app/login/[[...sign-in]]/page.tsx
git commit -m "feat: add Clerk Elements Google OAuth to custom login page"
```

---

### Task 4: Final verification and cleanup

**Files:**
- None (verification only)

- [ ] **Step 1: Build the project to check for type errors**

Run:
```bash
npm run build
```

Expected: Build completes successfully with no type errors.

- [ ] **Step 2: Run existing tests to check for regressions**

Run:
```bash
npm test
```

Expected: All existing tests pass. No test changes needed since the login page had no tests before and we're not adding new routes or API logic.

- [ ] **Step 3: Full manual verification**

Open `http://localhost:3000/login` in the browser and check:
1. Desktop — split layout renders correctly, left panel ~45%, right ~55%
2. Mobile — stacks vertically, branding banner on top, form below
3. Google button initiates OAuth flow on click
4. After successful sign-in, redirects to `/admin/dashboard`
5. Navigating to `/admin/dashboard` while unauthenticated redirects to `/login`
6. After sign-in, the admin sidebar `UserButton` still works for sign-out
7. Sign-out redirects back to `/login`

- [ ] **Step 4: Commit if any adjustments were made**

Only if changes were needed:
```bash
git add src/app/login/[[...sign-in]]/page.tsx
git commit -m "fix: polish custom login page after final review"
```
