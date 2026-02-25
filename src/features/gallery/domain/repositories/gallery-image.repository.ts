import { GalleryImage } from "@/features/gallery/domain/models/gallery-image.model";

export interface GalleryImageRepository {
    getAll(): Promise<GalleryImage[]>;
    getById(id: string): Promise<GalleryImage | null>;
    save(image: GalleryImage): Promise<void>;
    delete(id: string): Promise<void>;
    bulkDelete(ids: string[]): Promise<void>;
}
