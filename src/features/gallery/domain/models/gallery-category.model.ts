export const IMAGE_CATEGORIES = [
  { slug: 'discipline', name: 'Discipline' },
  { slug: 'actualite', name: 'Actualité' },
  { slug: 'carousel', name: 'Carousel' },
] as const

export type ImageCategorySlug = (typeof IMAGE_CATEGORIES)[number]['slug']

export function getCategoryLabel(slug: string): string {
  return IMAGE_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug
}

// Category scoping for admin forms
export const ACTUALITE_IMAGE_CATEGORIES: ImageCategorySlug[] = ['actualite']
export const DISCIPLINE_IMAGE_CATEGORIES: ImageCategorySlug[] = ['discipline']
