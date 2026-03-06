import Link from 'next/link';
import { Actualite } from '@/features/actualites/domain/models/actualite.model';
import { CloudImage } from '@/shared/components/CloudImage';

interface ActualiteCardProps {
    actualite: Actualite;
}

export function ActualiteCard({ actualite }: ActualiteCardProps) {
    const coverPhoto = actualite.photos[0];

    return (
        <Link href={`/actualites/${actualite.id}`} className="group flex flex-col gap-3">
            <div className="relative aspect-video overflow-hidden border-2 border-brand-orange rounded-xl">
                {coverPhoto ? (
                    <CloudImage
                        asset={coverPhoto}
                        alt={actualite.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
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
