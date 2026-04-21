export const dynamic = 'force-dynamic';

import { getActualiteAction } from '@/app/(front)/actualites/actions/actualite.actions';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import CTAInscription from '@/app/(front)/_components/CTA-inscription';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const result = await getActualiteAction(id);
    if (!result.success || !result.data) return {};
    return {
        title: result.data.seo.metaTitle || result.data.title,
        description: result.data.seo.metaDescription || '',
    };
}

export default async function ActualiteDetailPage({ params }: PageProps) {
    const { id } = await params;
    const result = await getActualiteAction(id);

    if (!result.success || !result.data || !result.data.active) {
        notFound();
    }

    const actualite = result.data;
    const sortedImages = [...actualite.images].sort((a, b) => {
        const aIdx = actualite.imageOrder.indexOf(a.id);
        const bIdx = actualite.imageOrder.indexOf(b.id);
        return (aIdx === -1 ? Infinity : aIdx) - (bIdx === -1 ? Infinity : bIdx);
    });
    const coverImage = sortedImages[0];

    return (
        <main className="container flex flex-col gap-16 pb-20 mx-auto px-5 md:px-0 max-w-4xl">
            <div className="pt-8">
                <Link href="/actualites" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
                    <ChevronLeft className="w-4 h-4" />
                    Toutes les actualités
                </Link>
            </div>

            {coverImage && (
                <div className="relative w-full aspect-video border-4 border-brand-red rounded-2xl overflow-hidden">
                    <CloudImage
                        asset={toCloudinaryAsset(coverImage)}
                        alt={coverImage.alt || actualite.title}
                        fill
                        sizes="(max-width: 900px) 100vw, 900px"
                        className="object-cover"
                        priority
                        blurDataUrl={coverImage.blurDataUrl}
                    />
                </div>
            )}

            <article className="flex flex-col gap-8">
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900">
                    {actualite.title}
                </h1>

                {actualite.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {actualite.tags.map((tag) => (
                            <span key={tag} className="text-xs font-bold uppercase tracking-widest text-brand-red border border-brand-red px-3 py-1 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: actualite.description }}
                />

                {sortedImages.length > 1 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {sortedImages.slice(1).map((image, index) => (
                            <div key={image.id} className="relative aspect-video overflow-hidden rounded-xl border border-slate-100">
                                <CloudImage
                                    asset={toCloudinaryAsset(image)}
                                    alt={image.alt || `${actualite.title} - photo ${index + 2}`}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 400px"
                                    className="object-cover"
                                    blurDataUrl={image.blurDataUrl}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </article>

            <CTAInscription />
        </main>
    );
}
