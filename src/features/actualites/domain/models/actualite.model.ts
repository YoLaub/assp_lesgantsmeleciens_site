import type { Image } from '@/features/gallery/domain/models/image.model'

export type Actualite = {
  id: string
  title: string
  description: string
  tags: string[]
  active: boolean
  featured: boolean
  images: Image[]
  imageOrder: string[]
  seo: {
    metaTitle: string
    metaDescription: string
  }
  order: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
