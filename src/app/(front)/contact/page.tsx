import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact | Les Gants Méléciens",
    description: "Retrouvez les coordonnées, le lieu et le bureau de l'association Les Gants Méléciens à Plumelec.",
};

export default function ContactPage() {
    return (
        <main className="container mx-auto py-20 px-6 max-w-6xl">

            {/* Ligne rouge décorative */}
            <div className="flex justify-center mb-10">
                <div className="w-80 max-w-full h-1 bg-brand-red"></div>
            </div>

            {/* Titre */}
            <h1 className="font-antic text-3xl md:text-4xl tracking-[0.3em] text-brand-orange text-center mb-10">
                Infos pratiques
            </h1>

            {/* Intro */}
            <p className="font-antic text-lg md:text-xl tracking-wide text-gray-600 text-center max-w-2xl mx-auto leading-relaxed mb-16">
                N&apos;hésitez à venir nous voir directement à l&apos;association aux horaires indiquées
                ou à prendre contact avec nous un peu plus bas ! Nous nous ferons un plaisir de
                répondre à vos questions et de vous accueillir.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

                {/* Carte (OpenStreetMap — sans cookies ni traceurs, conforme RGPD) */}
                <div className="w-full aspect-square md:aspect-auto md:h-[420px] overflow-hidden shadow-md border border-gray-100">
                    <iframe
                        title="Complexe sportif de la Madeleine, Plumelec"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=-2.6474%2C47.8388%2C-2.6314%2C47.8478&layer=mapnik&marker=47.84331%2C-2.63938"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                    <a
                        href="https://www.openstreetmap.org/?mlat=47.84331&mlon=-2.63938#map=17/47.84331/-2.63938"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sr-only"
                    >
                        Voir le Complexe sportif de la Madeleine sur OpenStreetMap
                    </a>
                </div>

                {/* Colonne Contact + Bureau */}
                <div className="flex flex-col gap-16 text-center ">

                    {/* CONTACT */}
                    <section>
                        <h2 className="text-2xl font-bold tracking-widest text-zinc-800 mb-6">CONTACT</h2>
                        <div className="space-y-4 text-zinc-600 leading-relaxed">
                            <p>
                                <span className="font-bold text-zinc-800">Lieu :</span> Complexe sportif de la Madeleine,
                                Route Josselin 56420 PLUMELEC
                            </p>
                            <p>
                                <span className="font-bold text-zinc-800">Mail :</span>{" "}
                                <a
                                    href="mailto:lesgantsmeleciens@gmail.com"
                                    className="hover:text-brand-red transition-colors underline decoration-gray-300 underline-offset-4"
                                >
                                    lesgantsmeleciens@gmail.com
                                </a>
                            </p>
                            <p>
                                <span className="font-bold text-zinc-800">WhatsApp :</span> 07 66 99 94 80
                            </p>
                        </div>
                    </section>

                    {/* LE BUREAU */}
                    <section>
                        <h2 className="text-2xl font-bold tracking-widest text-center text-zinc-800 mb-6">LE BUREAU</h2>
                        <div className="space-y-3 text-zinc-600">
                            <p><span className="font-bold text-zinc-800">Président :</span> Christophe Barbereau</p>
                            <p><span className="font-bold text-zinc-800">Secrétaire :</span> Sophie Le Guennec</p>
                            <p><span className="font-bold text-zinc-800">Vice-secrétaire :</span> Dephine Ciotta</p>
                            <p><span className="font-bold text-zinc-800">Trésorier :</span> Sylvain Trouillard</p>
                            <p><span className="font-bold text-zinc-800">Vice-trésorière :</span> Emmanuelle Trouillard</p>
                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
}
