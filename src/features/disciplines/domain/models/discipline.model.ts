import type { Image } from '@/features/gallery/domain/models/image.model'

export type Discipline = {
  id: string
  title: string
  coach: string
  coachImage: Image | null
  coachImageId: string | null
  citation: string | null
  category: string
  description: string
  tags: string[]
  active: boolean
  images: Image[]
  imageOrder: string[]
  seo: {
    metaTitle: string
    metaDescription: string
  }
  order: number
  createdAt: Date
  updatedAt: Date
}
