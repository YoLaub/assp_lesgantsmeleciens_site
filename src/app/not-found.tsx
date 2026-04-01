import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="font-roboto text-zinc-900 selection:bg-brand-red selection:text-white overflow-hidden">
      <style>{`
        .red-glow-light {
          box-shadow: 0 0 80px 20px rgba(223, 6, 6, 0.1);
        }
        .text-shadow-heavy-light {
          text-shadow: 4px 4px 0px rgba(226, 226, 222, 1);
        }
      `}</style>

      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-8 flex justify-between items-center bg-white/80 backdrop-blur-sm">
        <div className="font-antic font-black text-2xl uppercase tracking-tighter text-zinc-900">
          LES GANTS<span className="text-brand-red"> MÊLÉCIENS</span>
        </div>
        <div className="hidden md:block">
          <span className="font-antic font-bold text-xs uppercase tracking-[0.3em] text-zinc-400">
            {"Code d'Erreur: 404 // Faute Technique"}
          </span>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(223,6,6,0.05)_0%,_rgba(255,255,255,1)_80%)]" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-brand-red/5 to-transparent" />
          {/* Decorative "404" large scale watermark */}
          <div className="absolute -bottom-20 -left-20 font-antic font-black text-[25rem] leading-none select-none text-zinc-100">
            404
          </div>
        </div>

        {/* Central Graphic Module */}
        <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col md:flex-row items-center justify-center gap-12">
          {/* Referee Imagery */}
          <div className="relative group order-2 md:order-1">
            <div className="absolute -inset-4 border-4 border-brand-red opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-zinc-200 w-[280px] h-[400px] md:w-[450px] md:h-[600px] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Arbitre de boxe signalant une faute"
                className="w-full h-full object-cover object-center"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChGfMqSIyQw9unaX8S-FeeJSTmewKD_ijR1pBl4zlMXEQY5ULVjr5b32SiAcaLDWwNzkC_dBAx0FadaYK7FT1gjbQaeR_RepISGSV4m8iarOsdzVJ58CbBu_xzQMZc5jYA6o_f2jsZZKbbrclQuODxoNnjAFpXVD4yzurztXbsQ7slHPH6CttCshyEzFC1vTuaPTUR4OtP506uybloMmnT9LKnX5YXdQW2nupSrwlWLEicEXt-q225_FGGi3A3KgAp94V12OcPUszS"
              />
              {/* Visual Glitch Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent opacity-60" />
            </div>
            {/* Brutalist Floating Label */}
            <div className="red-glow-light absolute -bottom-4 -right-4 bg-brand-red text-white p-6 font-antic font-black text-2xl uppercase italic tracking-widest">
              FAUTE !
            </div>
          </div>

          {/* Typography Content Block */}
          <div className="relative z-20 text-center md:text-left flex flex-col gap-6 order-1 md:order-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-zinc-100 border border-zinc-200 self-center md:self-start px-3 py-1">
              <AlertTriangle className="text-brand-red" size={14} fill="currentColor" />
              <span className="font-antic font-bold text-[10px] uppercase tracking-[0.2em] text-zinc-900">
                {"Manœuvre Illégale Détectée"}
              </span>
            </div>

            <h1 className="text-shadow-heavy-light font-antic font-black text-7xl md:text-[9rem] leading-[0.8] uppercase tracking-tighter text-zinc-900">
              COUP<br />BAS !
            </h1>

            <p className="font-roboto text-xl md:text-2xl text-zinc-500 font-light max-w-md">
              La page que vous cherchez est{" "}
              <span className="text-zinc-900 font-bold border-b-2 border-brand-red">
                en dessous de la ceinture
              </span>{" "}
              {"(elle n'existe pas)."}
            </p>

            {/* CTA Module */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="group relative bg-brand-red hover:bg-red-700 text-white px-10 py-5 font-antic font-black text-lg uppercase tracking-widest transition-all active:translate-y-1"
              >
                <span className="relative z-10 flex items-center gap-3">
                  RETOUR SUR LE RING
                  <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
                </span>
              </Link>
              <Link
                href="/inscription"
                className="bg-transparent border-2 border-zinc-200 hover:border-zinc-900 text-zinc-900 px-10 py-5 font-antic font-black text-lg uppercase tracking-widest transition-all"
              >
                SIGNALER UNE FAUTE
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full z-50 px-8 py-8 flex justify-between items-end bg-white/80 backdrop-blur-sm">
        <div className="flex gap-12 font-antic font-bold text-[10px] uppercase tracking-widest text-zinc-500">
          <Link href="/" className="hover:text-brand-red transition-colors">
            Accueil
          </Link>
          <Link href="/inscription" className="hover:text-brand-red transition-colors">
            Contact
          </Link>
        </div>
        <div className="text-right">
          <p className="font-antic font-black text-xs uppercase tracking-tighter text-zinc-300">
            © {new Date().getFullYear()} LES GANTS MÊLÉCIENS
          </p>
        </div>
      </footer>

      {/* Decorative Corner Elements (Brutalist Style) */}
      <div className="fixed top-0 right-0 w-32 h-32 border-t-[12px] border-r-[12px] border-brand-red/10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-32 h-32 border-b-[12px] border-l-[12px] border-brand-red/10 pointer-events-none" />
    </div>
  );
}
