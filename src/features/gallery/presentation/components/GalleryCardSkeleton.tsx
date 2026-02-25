export function GalleryCardSkeleton() {
    return (
        <div className="break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-slate-100 animate-pulse">
            <div className="w-full" style={{ paddingBottom: `${60 + Math.random() * 40}%` }} />
        </div>
    );
}

export function GalleryGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="[columns:4_280px] gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <GalleryCardSkeleton key={i} />
            ))}
        </div>
    );
}
