import { ChevronUp, ChevronDown } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="flex flex-col gap-20 pb-20">
            {/* Hero Section - Exemple simple en attendant le design */}
            <section className="relative flex h-[70vh] items-center justify-center bg-white">
                <div className="min-h-screen  flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
                    <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                        {/* Colonne Gauche : Texte et Graphismes avec Lucide */}
                        <div className="lg:col-span-7 relative flex flex-col items-center">

                            {/* Chevrons Rouges (Haut) - Lucide Icons */}
                            <div className="relative w-full flex flex-col items-center mb-12">
                                <div className="absolute -top-16 flex flex-col items-center">
                                    {/* Double chevron superposé pour matcher le design */}
                                    <ChevronUp
                                        className="text-red-600 w-32 h-32 -mb-24 opacity-80"
                                        strokeWidth={1}
                                    />
                                    <ChevronUp
                                        className="text-red-600 w-32 h-32"
                                        strokeWidth={1}
                                    />
                                </div>

                                {/* Titre Principal */}
                                <div className="relative z-10 text-center mt-16 py-8">
                                    <h2 className="text-3xl md:text-4xl tracking-[0.3em] text-gray-500 font-light mb-2">
                                        NOTRE
                                    </h2>
                                    <h1 className="text-3xl md:text-5xl tracking-[0.15em] text-gray-900 font-bold drop-shadow-sm">
                                        ASSOCIATION
                                    </h1>
                                </div>
                            </div>

                            {/* Bloc de texte descriptif */}
                            <div className="max-w-md text-center lg:text-left">
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base text-justify font-light">
                                    Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem.
                                </p>
                            </div>

                            {/* Chevrons Gris (Bas) - Lucide Icons */}
                            <div className="relative w-full flex flex-col items-center mt-12">
                                <div className="flex flex-col items-center">
                                    <ChevronDown
                                        className="text-gray-200 w-32 h-32 -mb-24"
                                        strokeWidth={1}
                                    />
                                    <ChevronDown
                                        className="text-gray-200 w-32 h-32"
                                        strokeWidth={1}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Colonne Droite : Image et Actions */}
                        <div className="lg:col-span-5 flex flex-col items-center lg:items-end space-y-10">

                            {/* Image avec bordure décorative rouge */}
                            <div className="relative group">
                                <div className="absolute -left-6 top-0 bottom-0 w-3 bg-red-600 hidden md:block z-20"></div>

                                <div className="w-72 h-96 md:w-80 md:h-[480px] overflow-hidden shadow-2xl relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1549713486-82fe459073d7?q=80&w=2070&auto=format&fit=crop"
                                        alt="Gants de boxe"
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex flex-col space-y-5 w-64">
                                <button className="group relative bg-white border-2 border-red-600 rounded-full py-3.5 shadow-[6px_6px_15px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_20px_rgba(220,38,38,0.2)]">
              <span className="text-red-600 font-bold tracking-[0.2em] text-xs">
                DISCIPLINES
              </span>
                                </button>

                                <button className="group relative bg-black rounded-full py-3.5 shadow-[6px_6px_20px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 hover:bg-zinc-900">
              <span className="text-white font-bold tracking-[0.2em] text-xs">
                INSCRIPTION
              </span>
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Ligne horizontale décorative */}
                    <div className="absolute top-12 right-0 w-1/4 h-1 bg-red-600 hidden xl:block"></div>
                </div>
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