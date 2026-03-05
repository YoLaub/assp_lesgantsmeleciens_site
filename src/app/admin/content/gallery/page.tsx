import { GalleryManager } from '@/features/gallery/presentation/components/GalleryManager';
import { getAllGalleryImagesAction } from '@/app/admin/content/actions/gallery.actions';

export default async function AdminGalleryPage() {
    const result = await getAllGalleryImagesAction();
    const images = result.success && 'images' in result ? result.images : [];

    return (
        <div className="p-8 space-y-8 font-sans">
            <GalleryManager initialImages={images} />
        </div>
    );
}
