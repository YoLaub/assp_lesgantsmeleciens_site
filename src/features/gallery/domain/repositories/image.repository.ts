import { Image } from "@/features/gallery/domain/models/image.model";
import { ResultAsync } from "@/shared/lib/result";

export interface ImageRepository {
    getAll(): ResultAsync<Image[], string>;
    getByCategory(categorySlug: string): ResultAsync<Image[], string>;
    getById(id: string): ResultAsync<Image | null, string>;
    getByIds(ids: string[]): ResultAsync<Image[], string>;
    save(image: Image): ResultAsync<void, string>;
    saveMany(images: Image[]): ResultAsync<void, string>;
    delete(id: string): ResultAsync<void, string>;
    bulkDelete(ids: string[]): ResultAsync<void, string>;
    reorderMany(items: { id: string; order: number }[]): ResultAsync<void, string>;
}
