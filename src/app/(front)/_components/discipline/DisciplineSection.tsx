import Image from 'next/image';

export default function DisciplineSection() {
    return (
        <section className="min-h-screen bg-white py-16 px-6 md:px-12 lg:px-24">
            {/* Header avec ligne orange */}
            <div className="mb-16">
                <div className="w-full h-1 bg-gradient-to-r from-orange-400 to-orange-500 mb-8"></div>
            </div>
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 md:gap-24">
                <div className="flex flex-col items-center md: flex-row justify-between gap-12">
                    {/* Colonne gauche - Texte */}
                    <div className="space-y-8 w-1/3">
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                            KICK BOXING
                        </h2>

                        <div className="prose prose-lg text-gray-700 leading-relaxed">
                            <p>
                                Kick boxing (Pieds-Poings): "Savage", "Transpirer": À partir de 16ans - Le mercredi de 19h à 20h15 avec Tony DEMARIGNY et Paul DESOMBRE: Préparation physique: Pour améliorer la coordination, la souplesse et la rapidité et la confiance en soi et le maintien de soi. Excellent moyen de se défouler au quotidien. Les cours de Cardio Kick anglaise Cardio (enfo et kick boxe sont combinés à partir de marche et autres objectifs: -Activité avec Sami.
                            </p>
                            <p>
                                Description: Entrainement inspiré de la pratique de boxe - Un mix de cardio training et de renforcement musculaire. Brûler des calories, Evacuer le stress et se sentir bien.
                            </p>
                        </div>
                    </div>

                    <div className="w-1/3 text-center">
                        <p className="text-2xl font-bold mb-4">"Les champions ne se font pas dans les gymnases. Les champions sont faits de quelque chose qu'ils ont au plus profond d'eux-mêmes : un désir, un rêve, une vision. Ils doivent avoir l'endurance de la dernière minute, ils doivent être un peu plus rapides, ils doivent avoir le talent et la volonté. Mais la volonté doit être plus forte que le talent."</p>
                    </div>

                    {/* Colonne droite - Citation et Image */}
                    <div className="space-y-8  w-1/3">
                        {/* Card Citation */}
                        <div className="border-4 border-orange-400 rounded-3xl p-8 bg-white shadow-lg">
                            <div className="flex flex-col items-start gap-6">
                                <div className="w-24 h-24 flex-shrink-0">
                                    <Image
                                        src="/placeholder-profile.jpg"
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="rounded-lg object-cover w-full h-full grayscale"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-3xl font-bold mb-2">NOM PRÉNOM</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-4 border-red-600 rounded-3xl p-8 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg min-h-[300px] flex items-center justify-center relative overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Illustration kick boxing */}
                        <svg
                            viewBox="0 0 400 300"
                            className="w-full max-w-md h-auto"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Silhouette simplifiée d'un kick boxer */}
                            <g stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                {/* Tête */}
                                <circle cx="200" cy="80" r="20" fill="white" />

                                {/* Corps */}
                                <line x1="200" y1="100" x2="200" y2="180" />

                                {/* Bras gauche (tendu) */}
                                <line x1="200" y1="120" x2="140" y2="100" />
                                <line x1="140" y1="100" x2="110" y2="110" />

                                {/* Bras droit (coup de poing) */}
                                <line x1="200" y1="120" x2="280" y2="100" />
                                <line x1="280" y1="100" x2="310" y2="90" />

                                {/* Jambe gauche (d'appui) */}
                                <line x1="200" y1="180" x2="180" y2="240" />
                                <line x1="180" y1="240" x2="170" y2="280" />

                                {/* Jambe droite (coup de pied levé) */}
                                <line x1="200" y1="180" x2="260" y2="150" />
                                <line x1="260" y1="150" x2="310" y2="130" />
                            </g>
                        </svg>

                        {/* Numéro en arrière-plan */}
                        <div className="absolute right-4 bottom-4 text-9xl font-bold text-gray-200 opacity-50">
                            4
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}