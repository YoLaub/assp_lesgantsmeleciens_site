import { useMemo } from 'react';

function GalleryCardSkeleton({ paddingBottom }: { paddingBottom: number }) {
    return (
        <div className="break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-slate-100 animate-pulse">
            <div className="w-full" style={{ paddingBottom: `${paddingBottom}%` }} />
        </div>
    );
}

export function GalleryGridSkeleton({ count = 8 }: { count?: number }) {
    const heights = useMemo(
        () => Array.from({ length: count }, (_, i) => 60 + ((i * 37 + 13) % 40)),
        [count],
    );

    return (
        <div className="[columns:4_280px] gap-4">
            {heights.map((h, i) => (
                <GalleryCardSkeleton key={i} paddingBottom={h} />
            ))}
        </div>
    );
}
