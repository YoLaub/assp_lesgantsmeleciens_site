export default function CTAFAQ() {
    return (
        <section className="bg-white py-16 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                    {/* Texte */}
                    <div className="flex-1">
                        <h3 className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight uppercase leading-tight">
                            Pour encore plus d'infos n'hésitez pas à aller voir la FAQ
                        </h3>
                    </div>

                    {/* Bouton */}
                    <div className="flex-shrink-0">
                        <button className="bg-white text-red-600 px-12 py-5 w-[250px] rounded-full text-lg font-bold uppercase tracking-wide border-4 border-red-600 hover:bg-red-600 hover:text-white transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform">
                            FAQ
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
