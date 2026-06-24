import Image from "next/image";
import Link from "next/link";
import {ChevronUpMod, ChevronDownMod} from "@/app/(front)/_components/icon"
import gantDeBoxe from "@/../public/gant_de_boxe.jpg";
import accueilValeur from "@/../public/accueil_valeur.png";
import { getGalleryImagesByCategoryAction } from "@/app/admin/content/actions/gallery.actions";
import { CardStackCarousel } from "@/features/gallery/presentation/components/CardStackCarousel";
import { ActualitesSection } from "@/features/actualites/presentation/components/front/ActualitesSection";

export default async function HomePage() {
    const carouselResult = await getGalleryImagesByCategoryAction('carousel');
    return (
        <main className=" container flex flex-col gap-20 pb-20 mx-auto px-5 md:px-0">

            <section className=" w-full bg-white ">
                <div className=" mx-auto px-4 md:px-8 max-w-7xl">
                    <div className=" flex flex-wrap lg:flex-row gap-8 lg:gap-40 items-center justify-center">

                        {/* Colonne Gauche : Chevrons et Texte */}
                        <div className="lg:col-span-7 flex flex-col items-center lg:items-center">

                            {/* Chevrons Rouges (Haut) */}
                            <div className="relative w-full max-w-md flex justify-center lg:justify-center -mb-4 md:-mb-20">
                                <div className="relative">
                                    <ChevronUpMod
                                        strokeLinecap="square"
                                        strokeLinejoin="miter"
                                        className="text-brand-red w-48 h-48 scale-[2] md:w-56 md:h-56 lg:w-100 lg:h-100"
                                        strokeWidth={0.3}
                                    />
                                    <ChevronUpMod
                                        strokeLinecap="square"
                                        strokeLinejoin="miter"
                                        className="text-brand-red w-48 h-48 scale-[2] md:w-56 md:h-56 lg:w-100 lg:h-100 absolute top-8 md:top-16 left-0"
                                        strokeWidth={0.3}
                                    />
                                </div>
                            </div>

                            {/* Titre Principal */}
                            <div className="text-center text-shadow-lg lg:text-center w-full max-w-md pt-4">
                                <h2 className="text-2xl md:text-3xl lg:text-4xl tracking-[0.3em] text-gray-500 font-light mb-2">
                                    NOTRE
                                </h2>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl tracking-[0.15em] text-gray-900 font-bold drop-shadow-sm mb-6">
                                    ASSOCIATION
                                </h1>

                                {/* Texte descriptif */}
                                <p className="text-gray-600 leading-relaxed text-lg md:text-base font-light">
                                    Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
                                    magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat.
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                                    fugiat nulla pariatur.
                                </p>
                            </div>

                            {/* Chevrons Gris (Bas) */}
                            <div className="relative w-full  flex justify-center lg:justify-center -mt-4 md:-mt-20">
                                <div className="relative">
                                    <ChevronDownMod
                                        strokeLinecap="square"
                                        strokeLinejoin="miter"
                                        className="text-brand-gray scale-[2] w-48 h-48 md:w-56 md:h-56 lg:w-100 lg:h-100"
                                        strokeWidth={0.3}
                                    />
                                    <ChevronDownMod
                                        strokeLinecap="square"
                                        strokeLinejoin="miter"
                                        className="text-brand-gray scale-[2] w-48 h-48 md:w-56 md:h-56 lg:w-100 lg:h-100 absolute top-8 md:top-16 left-0"
                                        strokeWidth={0.3}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Colonne Droite : Image et Boutons */}
                        <div className="lg:col-span-5 flex flex-col items-start space-y-8 lg:space-y-10">

                            {/* Image avec bordure décorative rouge */}
                            <div className="relative group w-full max-w-sm">
                                {/* Ligne horizontale décorative */}
                                <div className="absolute -top-15 -right-5 w-64 md:w-48 lg:w-150 h-1 md:h-1 bg-red-600 hidden xl:block"></div>

                                <div className="w-full aspect-[3/4] overflow-hidden shadow-2xl relative ml-4 md:ml-6">
                                    <Image
                                        src={gantDeBoxe}
                                        alt="Gants de boxe"
                                        width={768}
                                        height={1024}
                                        sizes="(max-width: 768px) 100vw, 384px"
                                        placeholder="blur"
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-1000"></div>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex flex-col space-y-4 w-full max-w-xs px-4">
                                <Link href="/disciplines" className="group relative bg-white border-2 border-brand-red rounded-full py-3 md:py-3.5 shadow-[6px_6px_15px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_20px_rgba(220,38,38,0.2)] text-center">
                                    <span className="text-brand-red font-bold tracking-[0.2em] text-xs md:text-sm">
                                      DISCIPLINES
                                    </span>
                                </Link>

                                <Link href="/inscription" className="group relative border-[1px] border-brand-orange bg-black rounded-full py-3 md:py-3.5 shadow-[6px_6px_20px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 hover:bg-zinc-900 text-center">
                                    <span className="text-white font-bold tracking-[0.2em] text-xs md:text-sm">
                                      INSCRIPTION
                                    </span>
                                </Link>
                            </div>
                        </div>

                    </div>


                </div>
            </section>

            <section className="py-12 bg-white flex flex-col items-center px-4 md:px-8">
                {/* Titre de section */}
                <div className="text-center mb-20">
                    <h2 className="text-2xl md:text-3xl tracking-[0.4em] text-gray-700 font-light text-shadow-lg uppercase">
                        Nos valeurs, nos <br className="md:hidden" /> engagements
                    </h2>
                </div>

                {/* Grille 3 colonnes */}
                <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-12 items-center">

                    {/* Colonne 1 : Texte Gauche */}
                    <div className="flex flex-col items-center space-y-8 mt-4">
                        <p className="text-gray-600 leading-relaxed text-lg text-justify font-light italic">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
                        </p>
                        <button className="border border-brand-red px-6 py-2 rounded-sm text-xs tracking-widest text-gray-700 hover:bg-red-50 transition-colors">
                            Voir plus
                        </button>
                    </div>

                    {/* Colonne 2 : Image Centrale */}
                    <div className="relative flex flex-col items-center">
                        <div className="relative w-full aspect-square max-w-[400px] overflow-hidden shadow-lg border border-gray-100">
                            <Image
                                src={accueilValeur}
                                alt="Entraînement boxe"
                                fill
                                sizes="(max-width: 768px) 100vw, 400px"
                                placeholder="blur"
                                className="object-cover grayscale"
                            />
                        </div>
                    </div>

                    {/* Colonne 3 : Texte Droite */}
                    <div className="flex flex-col items-center space-y-8 mt-4">
                        <p className="text-gray-600 leading-relaxed text-lg text-justify font-light">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
                        </p>
                        <button className="border border-brand-red px-6 py-2 rounded-sm text-xs tracking-widest text-gray-700 hover:bg-red-50 transition-colors">
                            Voir plus
                        </button>
                    </div>
                </div>

                {/* Ligne rouge décorative bas de section */}
                <div className="w-1/3 h-1 bg-brand-red mt-20"></div>
            </section>

            <section className="py-12 bg-white flex flex-col items-center px-4 md:px-8">
                {/* Galerie Photo Carousel */}
                {carouselResult.success && carouselResult.images.length > 0 && (
                    <div className="max-w-6xl w-full mb-24">
                        <h3 className="text-xl md:text-2xl tracking-[0.4em] text-gray-700 font-light uppercase text-center mb-8">
                            Galerie Photo
                        </h3>
                        <CardStackCarousel images={carouselResult.images} />
                    </div>
                )}

                {/* Ligne rouge décorative entre galerie et actualités */}
                <div className="w-1/3 h-1 bg-brand-red mb-20"></div>

                {/* Actualités */}
                <ActualitesSection />
            </section>

        </main>
    );
}