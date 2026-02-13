export default function CTAInscription() {
    return (
        <section className=" py-16 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Texte */}
                    <div className="flex-1">
                        <h3 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight uppercase leading-tight">
                            Chez les Méléciens, nous proposons un forfait découverte de
                            trois cours au choix pour vous permettre de découvrir au
                            mieux nos disciplines ...
                        </h3>
                    </div>

                    {/* Bouton */}
                    <div className="flex-shrink-0">
                        <button className="bg-black border-1 border-brand-orange text-white px-12 py-5 w-[250px] rounded-full text-lg font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform">
                            Inscription
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}