import Link from 'next/link';
import { Actualite } from '@/features/actualites/domain/models/actualite.model';
import { CloudImage } from '@/shared/components/CloudImage';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';

interface ActualiteCardProps {
    actualite: Actualite;
}

export function ActualiteCard({ actualite }: ActualiteCardProps) {
    const sortedImages = [...actualite.images].sort((a, b) => {
        const aIdx = actualite.imageOrder.indexOf(a.id);
        const bIdx = actualite.imageOrder.indexOf(b.id);
        return (aIdx === -1 ? Infinity : aIdx) - (bIdx === -1 ? Infinity : bIdx);
    });
    const coverImage = sortedImages[0];

    return (
        <Link href={`/actualites/${actualite.id}`} className="group flex flex-col gap-3">
            <div className="relative aspect-video overflow-hidden border-2 border-brand-orange rounded-xl">
                {coverImage ? (
                    <CloudImage
                        asset={toCloudinaryAsset(coverImage)}
                        alt={coverImage.alt || actualite.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        blurDataUrl={coverImage.blurDataUrl}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <span className="text-slate-400 text-sm">Pas d&apos;image</span>
                    </div>
                )}
            </div>
            <h3 className="font-bold text-slate-900 tracking-tight text-sm uppercase leading-tight group-hover:text-brand-red transition-colors">
                {actualite.title}
            </h3>
        </Link>
    );
}
