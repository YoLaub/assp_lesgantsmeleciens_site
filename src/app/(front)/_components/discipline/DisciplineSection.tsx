import Image from 'next/image';
import DisciplineCarousel from "@/app/(front)/_components/discipline/CarouselDiscipline";

export default function DisciplineSection() {
    return (
        <section className="min-h-screen bg-white py-2 px-6 md:px-12 lg:px-24">
            {/* Header avec ligne orange */}
            <div className="mb-16">
                <div className="w-full h-0.5 bg-linear-to-r from-brand-orange to-orange-500 mb-8"></div>
            </div>
            <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-col items-center gap-12 md:gap-24">
                <div className="flex flex-col items-center lg:flex-row justify-between gap-12">
                    {/* Colonne gauche - Texte */}
                    <div className="space-y-8 w-full md:w-1/3">
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

                    <div className="w-full md:w-1/3 text-center">
                        <p className="text-2xl font-thin mb-4">“Pour apprendre à boxer il suffit d'une nuit. Il faut une vie entière pour apprendre à combattre.”</p>
                    </div>

                    {/* Colonne droite - Citation et Image */}
                    <div className="space-y-8  w-full md:w-1/3">
                        {/* Card Citation */}
                        <div className="border-0 md:border-6 border-brand-orange rounded-3xl p-4 bg-white shadow-lg">
                            <div className="flex flex-col justify-center gap-6">
                                {/* Conteneur de l'image en position relative pour servir de repère au texte */}
                                <div className="relative w-full h-full flex-shrink-0">
                                    <Image
                                        src="/1.webp"
                                        alt="Profile"
                                        width={150}
                                        height={150}
                                        className="rounded-lg object-cover w-full h-full grayscale"
                                    />

                                    {/* Texte sur la photo en mobile, repositionné normalement sur PC si besoin */}
                                    <h3 className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold md:relative md:text-gray-900 md:mt-4">
                                        NICOLAS
                                    </h3>
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