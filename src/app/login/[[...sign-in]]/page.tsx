'use client'

import Image from 'next/image'
import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
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

      {/* Right Sign-In Panel */}
      <div className="flex-1 bg-slate-100 flex items-center justify-center p-8 lg:p-12">
        <SignIn.Root>
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
    </div>
  )
}
