import Image from 'next/image';
import DisciplineCarousel from "@/app/(front)/_components/discipline/CarouselDiscipline";

export default function DisciplineSection() {
    return (
        <section className="min-h-screen bg-white py-16 px-6 md:px-12 lg:px-24">
            {/* Header avec ligne orange */}
            <div className="mb-16">
                <div className="w-full h-1 bg-gradient-to-r from-brand-orange to-orange-500 mb-8"></div>
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
                        <div className="border-4 border-brand-orange rounded-3xl p-8 bg-white shadow-lg ">
                            <div className="flex flex-col items-start justify-center gap-6">
                                <div className="w-full h-full flex-shrink-0">
                                    <Image
                                        src="/1.webp"
                                        alt="Profile"
                                        width={150}
                                        height={150}
                                        className="rounded-lg object-cover w-full h-full grayscale"
                                    />
                                </div>
                                <div className="flex-1 ">
                                    <h3 className="text-3xl font-bold mb-2">NICOLAS</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DisciplineCarousel/>
            </div>
        </section>
    );
}