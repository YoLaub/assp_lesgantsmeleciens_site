import Image from 'next/image';
import DisciplineCarousel from "@/features/disciplines/presentation/components/front/CarouselDiscipline";
import { Discipline } from "@/features/disciplines/domain/models/discipline.model";

interface DisciplineSectionProps {
    discipline: Discipline;
}

export default function DisciplineSection({ discipline }: DisciplineSectionProps) {
    return (
        <section className="min-h-screen bg-white py-4 px-6 md:px-12 lg:px-24">
            {/* Header avec ligne orange */}
            <div className="mb-16">
                <div className="w-full h-1 bg-gradient-to-r from-brand-orange to-orange-500 mb-8"></div>
            </div>
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 md:gap-24">
                <div className="flex flex-col-reverse items-center md:flex-row justify-between gap-12">
                    {/* Colonne gauche - Texte */}
                    <div className="space-y-8 w-full md:w-1/3">
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                            {discipline.title}
                        </h2>

                        <div
                            className="prose prose-lg text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: discipline.description }}
                        >
                        </div>
                    </div>

                    <p className="text-2xl font-bold mb-4 italic">
                        {discipline.citation || "L'effort est la seule route qui mène au succès."}
                    </p>

                    {/* Colonne droite - Citation et Image */}
                    <div className="space-y-8 w-full  md:w-1/3">
                        {/* Card Citation */}
                        <div className="border-4 border-brand-orange rounded-3xl p-8 bg-white shadow-lg ">
                            <div className="flex flex-col items-start justify-center gap-6">
                                <div className="w-full h-full flex-shrink-0">
                                    <Image
                                        src={discipline.photo_coach || '/default-coach.jpg'}
                                        alt={discipline.coach}
                                        width={150}
                                        height={150}
                                        className="rounded-lg object-cover w-full h-full grayscale"
                                    />
                                </div>
                                <div className="flex-1 ">
                                    <h3 className="text-3xl font-bold mb-2">{discipline.coach}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DisciplineCarousel images={discipline.photo}/>
            </div>
        </section>
    );
}