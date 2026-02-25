import { GalleryGridSkeleton } from '@/features/gallery/presentation/components/GalleryCardSkeleton';

export default function GalleryLoading() {
    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="h-7 w-40 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-64 bg-slate-100 rounded-md animate-pulse mt-2" />
                </div>
            </div>

            {/* Toolbar skeleton */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <div className="flex gap-3">
                    <div className="flex-1 h-10 bg-slate-50 rounded-lg animate-pulse" />
                    <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-10 w-28 bg-slate-100 rounded-xl animate-pulse" />
                </div>
                <div className="flex gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="h-7 w-20 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>

            <GalleryGridSkeleton count={8} />
        </div>
    );
}
