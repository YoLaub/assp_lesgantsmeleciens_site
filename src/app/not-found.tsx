import Link from "next/link";
import Image from "next/image";
import { StickyNavbar } from "@/app/(front)/_components/Navbar";
import { Header } from "@/app/(front)/_components/Header";
import { Footer } from "@/app/(front)/_components/Footer";
import { ChevronUpMod } from "@/app/(front)/_components/icon";
import gantDeBoxe from "@/../public/gant_de_boxe.jpg";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white selection:bg-brand-red selection:text-white">
      {/* Global Navigation */}
      <StickyNavbar />
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center py-20 px-5 md:px-0">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center justify-center">
            
            {/* Left Column: Heading and description */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left relative">
              
              {/* Overlapping Chevron Watermark */}
              <div className="absolute -top-12 -left-12 opacity-[0.06] pointer-events-none select-none hidden md:block">
                <ChevronUpMod
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  className="text-brand-red w-48 h-48 lg:w-64 lg:h-64"
                  strokeWidth={0.3}
                />
              </div>

              <h2 className="font-antic text-2xl md:text-3xl lg:text-4xl tracking-[0.3em] text-gray-500 font-light mb-2 uppercase">
                Erreur
              </h2>
              <h1 className="font-antic text-6xl md:text-7xl lg:text-8xl tracking-[0.15em] text-brand-red font-bold drop-shadow-sm mb-6 uppercase">
                404
              </h1>

              {/* Signature Red Accent Line */}
              <div className="w-32 h-1 bg-brand-red mb-8"></div>

              <h3 className="font-antic text-2xl md:text-3xl tracking-wide text-zinc-900 font-bold mb-4 uppercase italic">
                Round perdu !
              </h3>

              <p className="text-gray-600 leading-relaxed text-lg md:text-xl font-light max-w-lg mb-8">
                Vous avez franchi les cordes du ring. La page que vous cherchez a probablement été mise K.O. ou a changé de catégorie de poids.
              </p>

              {/* Action Buttons matching main site layout */}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center lg:justify-start">
                <Link
                  href="/"
                  className="group relative flex justify-center items-center bg-black border-[1px] border-brand-orange rounded-full py-3.5 px-8 shadow-[6px_6px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-900"
                >
                  <span className="text-white font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
                    Retour sur le ring
                  </span>
                </Link>
                <Link
                  href="/disciplines"
                  className="group relative flex justify-center items-center bg-white border-2 border-brand-red rounded-full py-3.5 px-8 shadow-[6px_6px_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[8px_8px_20px_rgba(220,38,38,0.2)]"
                >
                  <span className="text-brand-red font-bold tracking-[0.2em] text-xs md:text-sm uppercase">
                    Nos disciplines
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Grayscale Boxing Gloves Image */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative group w-full max-w-sm">
                
                {/* Decorative horizontal accent line */}
                <div className="absolute -top-5 -right-5 w-48 h-1 bg-brand-red hidden xl:block"></div>

                {/* Photo container with zoom and color transition */}
                <div className="w-full aspect-[3/4] overflow-hidden shadow-2xl relative border border-gray-100 rounded-sm">
                  <Image
                    src={gantDeBoxe}
                    alt="Gants de boxe de l'association"
                    width={768}
                    height={1024}
                    sizes="(max-width: 768px) 100vw, 384px"
                    placeholder="blur"
                    priority
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-1000"></div>
                </div>

                {/* Floating rotating badge */}
                <div className="absolute -bottom-4 -left-4 bg-brand-red text-white py-3 px-6 font-antic font-black text-lg uppercase italic tracking-widest shadow-xl transform -rotate-3 group-hover:rotate-0 transition-all duration-300 select-none">
                  K.O. 404
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
