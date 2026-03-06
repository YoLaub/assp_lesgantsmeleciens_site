import type { ImageCategory } from './image-category.model'

export type Image = {
  id: string
  title: string
  alt: string
  publicId: string
  version: number
  format: string
  width: number
  height: number
  bytes: number
  order: number
  category: ImageCategory
  categoryId: string
  createdAt: Date
  updatedAt: Date
}
