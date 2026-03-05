export const GALLERY_CATEGORIES = [
    { value: 'entrainements', label: 'Entraînements' },
    { value: 'competitions', label: 'Compétitions' },
    { value: 'evenements', label: 'Événements' },
    { value: 'portraits', label: 'Portraits' },
    { value: 'installations', label: 'Installations' },
    { value: 'autre', label: 'Autre' },
    { value: 'carousel', label: 'Carousel' },
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]['value'];

export function getCategoryLabel(value: string): string {
    return GALLERY_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
