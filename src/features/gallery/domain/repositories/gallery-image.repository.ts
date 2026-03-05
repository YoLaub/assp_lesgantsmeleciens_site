import { GalleryImage } from "@/features/gallery/domain/models/gallery-image.model";
import { ResultAsync } from "@/shared/lib/result";

export interface GalleryImageRepository {
    getAll(): ResultAsync<GalleryImage[], string>;
    getByCategory(category: string): ResultAsync<GalleryImage[], string>;
    getById(id: string): ResultAsync<GalleryImage | null, string>;
    save(image: GalleryImage): ResultAsync<void, string>;
    saveMany(images: GalleryImage[]): ResultAsync<void, string>;
    delete(id: string): ResultAsync<void, string>;
    bulkDelete(ids: string[]): ResultAsync<void, string>;
    reorderMany(items: { id: string; order: number }[]): ResultAsync<void, string>;
}
