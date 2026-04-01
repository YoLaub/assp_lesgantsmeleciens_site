import Link from 'next/link';
import { getActiveActualitesAction, getFeaturedActualiteAction } from '@/app/(front)/actualites/actions/actualite.actions';
import { ActualitesCarousel } from './ActualitesCarousel';
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';
import { sanitizeRichText } from '@/shared/lib/sanitize';

export async function ActualitesSection() {
    const [featuredResult, allResult] = await Promise.all([
        getFeaturedActualiteAction(),
        getActiveActualitesAction(),
    ]);

    const featured = featuredResult.data;
    const allActualites = allResult.data ?? [];

    const carouselActualites = featured
        ? allActualites.filter((a) => a.id !== featured.id)
        : allActualites;

    return (
        <div className="w-full max-w-6xl flex flex-col items-center">
            {/* Section heading */}
            <div className="w-full mb-12 text-center">
                <h2 className="text-xl md:text-2xl tracking-[0.4em] text-gray-700 font-light uppercase mb-6">
                    Actualités
                </h2>
                <p className="text-gray-600 text-lg max-w-4xl mx-auto font-light leading-relaxed">
                    Retrouvez les dernières nouvelles, événements et annonces de l&apos;association.
                </p>
            </div>

            {/* Featured article */}
            {featured && (
                <div className="w-full mb-16">
                    <Link href={`/actualites/${featured.id}`} className="group flex flex-col items-center gap-6">
                        {(() => {
                            const sortedImages = [...featured.images].sort((a, b) => {
                                const aIdx = featured.imageOrder.indexOf(a.id);
                                const bIdx = featured.imageOrder.indexOf(b.id);
                                return (aIdx === -1 ? Infinity : aIdx) - (bIdx === -1 ? Infinity : bIdx);
                            });
                            const coverImage = sortedImages[0];
                            return coverImage ? (
                                <div className="relative w-full max-w-2xl aspect-video border-4 border-brand-red rounded-2xl overflow-hidden">
                                    <CloudImage
                                        asset={toCloudinaryAsset(coverImage)}
                                        alt={coverImage.alt || featured.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 800px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        blurDataUrl={coverImage.blurDataUrl}
                                    />
                                </div>
                            ) : null;
                        })()}
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 uppercase group-hover:text-brand-red transition-colors">
                            {featured.title}
                        </h3>
                        <div
                            className="prose prose-sm text-gray-600 line-clamp-3 text-center max-w-2xl"
                            dangerouslySetInnerHTML={{ __html: sanitizeRichText(featured.description) }}
                        />
                    </Link>
                </div>
            )}

            {/* Carousel of other articles */}
            {carouselActualites.length > 0 && (
                <div className="w-full">
                    <ActualitesCarousel actualites={carouselActualites} />
                </div>
            )}

            {/* Empty state */}
            {!featured && carouselActualites.length === 0 && (
                <p className="text-slate-400 italic text-center">
                    Les actualités seront bientôt publiées.
                </p>
            )}
        </div>
    );
}
