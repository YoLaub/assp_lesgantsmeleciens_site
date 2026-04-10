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
