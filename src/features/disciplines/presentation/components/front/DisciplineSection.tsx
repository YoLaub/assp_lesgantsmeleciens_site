import DisciplineCarousel from "@/features/disciplines/presentation/components/front/CarouselDiscipline";
import { Discipline } from "@/features/disciplines/domain/models/discipline.model";
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';
import { sanitizeRichText } from '@/shared/lib/sanitize';

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
                <div className="flex flex-col-reverse items-center lg:flex-row justify-between gap-12">
                    {/* Colonne gauche - Texte */}
                    <div className="space-y-8 w-full lg:w-1/3">
                        <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                            {discipline.title}
                        </h2>

                        <div
                            className="prose prose-lg text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: sanitizeRichText(discipline.description) }}
                        >
                        </div>
                    </div>

                    <p className="text-2xl font-bold mb-4 italic">
                        {discipline.citation || "L'effort est la seule route qui mène au succès."}
                    </p>

                    {/* Colonne droite - Citation et Image */}
                    <div className="space-y-8 w-full  lg:w-1/3">
                        {/* Card Citation */}
                        <div className="border-4 border-brand-orange rounded-3xl p-8 bg-white shadow-lg ">
                            <div className="flex flex-col items-start justify-center gap-6">
                                <div className="w-full h-full flex-shrink-0">
                                    {discipline.coachImage ? (
                                        <CloudImage
                                            asset={toCloudinaryAsset(discipline.coachImage)}
                                            alt={`Coach ${discipline.coach}`}
                                            width={150}
                                            height={150}
                                            crop="fill"
                                            gravity="face"
                                            sizes="150px"
                                            className="rounded-lg object-cover w-full h-full grayscale"
                                            blurDataUrl={discipline.coachImage.blurDataUrl}
                                        />
                                    ) : (
                                        <div className="w-full aspect-square bg-slate-200 rounded-lg flex items-center justify-center">
                                            <span className="text-slate-400 text-sm">Pas de photo</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 ">
                                    <h3 className="text-3xl font-bold mb-2">{discipline.coach}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DisciplineCarousel
                    images={discipline.images}
                    imageOrder={discipline.imageOrder}
                    disciplineName={discipline.title}
                />
            </div>
        </section>
    );
}
