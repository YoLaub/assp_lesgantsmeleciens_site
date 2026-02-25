import { GalleryManager } from '@/features/gallery/presentation/components/GalleryManager';
import { getAllGalleryImagesAction } from '@/app/(admin)/content/actions/gallery.actions';

export default async function AdminGalleryPage() {
    const result = await getAllGalleryImagesAction();
    const images = result.success && 'images' in result ? result.images : [];

    return (
        <div className="p-8 space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                        Médiathèque
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Gérez les photos et visuels de l&apos;association.
                    </p>
                </div>
            </div>

            <GalleryManager initialImages={images} />
        </div>
    );
}
