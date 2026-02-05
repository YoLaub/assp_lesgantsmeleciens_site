import {ChevronUpMod, ChevronDownMod} from "@/app/(admin)/_components/icon"

export default function HomePage() {
    return (
        <div className="flex flex-col gap-20 pb-20">

            <section className="relative flex h-[70vh] items-center justify-center bg-white my-60">
                <div className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans">
                    <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                        <div className="lg:col-span-7 relative flex flex-col items-center">

                            <div className="relative w-full flex flex-col items-center">
                                <div className="absolute top-75 flex flex-col items-center">
                                    {/* Double chevron superposé  */}
                                    <ChevronUpMod
                                        strokeLinecap="square"   // Remplace "round" pour les extrémités
                                        strokeLinejoin="miter"
                                        className="text-red-600 w-250 h-250 -mb-240"
                                        strokeWidth={0.2}
                                    />
                                    <ChevronUpMod
                                        strokeLinecap="square"   // Remplace "round" pour les extrémités
                                        strokeLinejoin="miter"
                                        className="text-red-600 w-250 h-250 "
                                        strokeWidth={0.2}
                                    />
                                </div>

                            </div>

                            {/* Bloc de texte descriptif */}
                            <div className="max-w-md text-center lg:text-left">
                                {/* Titre Principal */}
                                <div className="relative z-10 text-center mt-200 py-8">
                                    <h2 className="text-3xl md:text-4xl tracking-[0.3em] text-gray-500 font-light mb-2">
                                        NOTRE
                                    </h2>
                                    <h1 className="text-3xl md:text-5xl tracking-[0.15em] text-gray-900 font-bold drop-shadow-sm">
                                        ASSOCIATION
                                    </h1>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base text-left font-light">
                                    Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
                                    magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat.
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                                    fugiat nulla pariatur.
                                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                                    mollit anim id est laborum.
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem.
                                </p>
                            </div>

                            {/* Chevrons Gris (Bas) */}
                            <div className="relative w-full flex flex-col items-center -top-35.75 ">
                                <div className="flex flex-col items-center">
                                    <ChevronDownMod
                                        strokeLinecap="square"   // Remplace "round" pour les extrémités
                                        strokeLinejoin="miter"
                                        className="text-gray-200 w-250 h-250 -mb-240"
                                        strokeWidth={0.2}
                                    />
                                    <ChevronDownMod
                                        strokeLinecap="square"   // Remplace "round" pour les extrémités
                                        strokeLinejoin="miter"
                                        className="text-gray-200 w-250 h-250"
                                        strokeWidth={0.2}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Colonne Droite : Image et Actions */}
                        <div className="lg:col-span-5 flex flex-col items-center lg:items-center space-y-10">

                            {/* Image avec bordure décorative rouge */}
                            <div className="relative group">
                                <div
                                    className="absolute -left-6 top-0 bottom-0 w-3 bg-red-600 hidden md:block z-20 me-5"></div>

                                <div className="w-72 h-96 md:w-80 md:h-[480px] overflow-hidden shadow-2xl relative">
                                    <img
                                        src="/gant_de_boxe.jpg"
                                        alt="Gants de boxe"
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110"
                                    />
                                    <div
                                        className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex flex-col space-y-5 w-64">
                                <button
                                    className="group relative bg-white border-2 border-red-600 rounded-full py-3.5 shadow-[6px_6px_15px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_20px_rgba(220,38,38,0.2)]">
              <span className="text-red-600 font-bold tracking-[0.2em] text-xs">
                DISCIPLINES
              </span>
                                </button>

                                <button
                                    className="group relative bg-black rounded-full py-3.5 shadow-[6px_6px_20px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 hover:bg-zinc-900">
              <span className="text-white font-bold tracking-[0.2em] text-xs">
                INSCRIPTION
              </span>
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Ligne horizontale décorative */}
                    <div className="absolute -top-40 right-100 w-1/4 h-1 bg-red-600 hidden xl:block"></div>
                </div>
            </section>

            <section className="py-24 bg-white flex flex-col items-center px-4 md:px-8">
                {/* Titre de section */}
                <div className="text-center mb-20">
                    <h2 className="text-2xl md:text-3xl tracking-[0.4em] text-gray-700 font-light uppercase">
                        Nos valeurs, nos <br className="md:hidden" /> engagements
                    </h2>
                </div>

                {/* Grille 3 colonnes */}
                <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

                    {/* Colonne 1 : Texte Gauche */}
                    <div className="flex flex-col items-center space-y-8 mt-4">
                        <p className="text-gray-600 leading-relaxed text-sm text-justify font-light italic">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
                        </p>
                        <button className="border border-red-600 px-6 py-2 rounded-sm text-xs tracking-widest text-gray-700 hover:bg-red-50 transition-colors">
                            Voir plus
                        </button>
                    </div>

                    {/* Colonne 2 : Image Centrale */}
                    <div className="relative flex flex-col items-center">
                        <div className="w-full aspect-square max-w-[400px] overflow-hidden shadow-lg border border-gray-100">
                            <img
                                src="/accueil_valeur.png"
                                alt="Entraînement boxe"
                                className="w-full h-full object-cover grayscale"
                            />
                        </div>
                    </div>

                    {/* Colonne 3 : Texte Droite */}
                    <div className="flex flex-col items-center space-y-8 mt-4">
                        <p className="text-gray-600 leading-relaxed text-sm text-justify font-light">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
                        </p>
                        <button className="border border-red-600 px-6 py-2 rounded-sm text-xs tracking-widest text-gray-700 hover:bg-red-50 transition-colors">
                            Voir plus
                        </button>
                    </div>
                </div>

                {/* Ligne rouge décorative bas de section */}
                <div className="w-1/3 h-1 bg-red-600 mt-20"></div>
            </section>

            {/* Contenu temporaire pour tester le scroll et le footer */}
            <section className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="h-64 rounded-xl bg-zinc-100 dark:bg-zinc-900"/>
                    <div className="h-64 rounded-xl bg-zinc-100 dark:bg-zinc-900"/>
                </div>
            </section>
        </div>
    );
}