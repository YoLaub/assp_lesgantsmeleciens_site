export const IMAGE_CATEGORIES = [
  { slug: 'entrainements', name: 'Entrainements' },
  { slug: 'competitions', name: 'Competitions' },
  { slug: 'evenements', name: 'Evenements' },
  { slug: 'portraits', name: 'Portraits' },
  { slug: 'installations', name: 'Installations' },
  { slug: 'autre', name: 'Autre' },
  { slug: 'carousel', name: 'Carousel' },
] as const

export type ImageCategorySlug = (typeof IMAGE_CATEGORIES)[number]['slug']

export function getCategoryLabel(slug: string): string {
  return IMAGE_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug
}

// Category scoping for admin forms
export const ACTUALITE_IMAGE_CATEGORIES: ImageCategorySlug[] = ['competitions', 'evenements', 'autre']
export const DISCIPLINE_IMAGE_CATEGORIES: ImageCategorySlug[] = ['entrainements', 'portraits', 'installations']
