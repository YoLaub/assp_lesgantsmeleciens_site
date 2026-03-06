/**
 * One-shot migration script: extract Cloudinary metadata from legacy URL columns
 * and populate the new structured fields.
 *
 * Run with: npx tsx scripts/migrate-cloudinary-metadata.ts
 *
 * Prerequisites:
 * - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env
 * - DATABASE_URL in .env
 * - New schema columns already exist (run prisma migrate first)
 */

import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '../src/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Last time we ever do URL parsing
function extractPublicId(url: string): string {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/)
    return match?.[1] ?? ''
}

async function migrateGalleryImages() {
    console.log('\n--- Migrating GalleryImage ---')
    const images = await prisma.galleryImage.findMany()
    let migrated = 0
    let skipped = 0

    for (const img of images) {
        // Skip if already migrated
        if (img.publicId && img.publicId !== '') {
            skipped++
            continue
        }

        const publicId = extractPublicId(img.src)
        if (!publicId) {
            console.warn(`  SKIP GalleryImage ${img.id}: could not extract publicId from "${img.src}"`)
            skipped++
            continue
        }

        try {
            const resource = await cloudinary.api.resource(publicId)
            await prisma.galleryImage.update({
                where: { id: img.id },
                data: {
                    publicId: resource.public_id,
                    version: resource.version,
                    format: resource.format,
                    width: resource.width,
                    height: resource.height,
                    bytes: resource.bytes,
                },
            })
            migrated++
            console.log(`  OK GalleryImage ${img.id} -> ${resource.public_id}`)
        } catch (err) {
            console.error(`  FAIL GalleryImage ${img.id} (${publicId}):`, err)
        }
    }

    console.log(`  Gallery: ${migrated} migrated, ${skipped} skipped, ${images.length} total`)
}

async function migrateActualites() {
    console.log('\n--- Migrating Actualite ---')
    const actualites = await prisma.actualite.findMany()
    let migrated = 0

    for (const act of actualites) {
        // Skip if photos already populated
        const existingPhotos = act.photos as unknown[]
        if (Array.isArray(existingPhotos) && existingPhotos.length > 0) {
            console.log(`  SKIP Actualite ${act.id}: photos already populated`)
            continue
        }

        if (!act.photo || act.photo.length === 0) {
            continue
        }

        const photos = []
        for (const url of act.photo) {
            const publicId = extractPublicId(url)
            if (!publicId) {
                console.warn(`  SKIP photo in Actualite ${act.id}: could not extract publicId`)
                continue
            }

            try {
                const resource = await cloudinary.api.resource(publicId)
                photos.push({
                    publicId: resource.public_id,
                    version: resource.version,
                    format: resource.format,
                    width: resource.width,
                    height: resource.height,
                    bytes: resource.bytes,
                    resourceType: resource.resource_type,
                })
            } catch (err) {
                console.error(`  FAIL photo in Actualite ${act.id} (${publicId}):`, err)
            }
        }

        if (photos.length > 0) {
            await prisma.actualite.update({
                where: { id: act.id },
                data: { photos },
            })
            migrated++
            console.log(`  OK Actualite ${act.id}: ${photos.length} photos migrated`)
        }
    }

    console.log(`  Actualites: ${migrated} migrated, ${actualites.length} total`)
}

async function migrateDisciplines() {
    console.log('\n--- Migrating Discipline ---')
    const disciplines = await prisma.discipline.findMany()
    let migrated = 0

    for (const disc of disciplines) {
        const updates: Record<string, unknown> = {}

        // Migrate coach photo
        const existingCoachPhoto = disc.coachPhoto as unknown
        if (!existingCoachPhoto && disc.photo_coach) {
            const publicId = extractPublicId(disc.photo_coach)
            if (publicId) {
                try {
                    const resource = await cloudinary.api.resource(publicId)
                    updates.coachPhoto = {
                        publicId: resource.public_id,
                        version: resource.version,
                        format: resource.format,
                        width: resource.width,
                        height: resource.height,
                        bytes: resource.bytes,
                        resourceType: resource.resource_type,
                    }
                } catch (err) {
                    console.error(`  FAIL coach photo for Discipline ${disc.id} (${publicId}):`, err)
                }
            }
        }

        // Migrate gallery photos
        const existingPhotos = disc.photos as unknown[]
        if ((!Array.isArray(existingPhotos) || existingPhotos.length === 0) && disc.photo.length > 0) {
            const photos = []
            for (const url of disc.photo) {
                const publicId = extractPublicId(url)
                if (!publicId) continue

                try {
                    const resource = await cloudinary.api.resource(publicId)
                    photos.push({
                        publicId: resource.public_id,
                        version: resource.version,
                        format: resource.format,
                        width: resource.width,
                        height: resource.height,
                        bytes: resource.bytes,
                        resourceType: resource.resource_type,
                    })
                } catch (err) {
                    console.error(`  FAIL photo in Discipline ${disc.id} (${publicId}):`, err)
                }
            }
            if (photos.length > 0) {
                updates.photos = photos
            }
        }

        if (Object.keys(updates).length > 0) {
            await prisma.discipline.update({
                where: { id: disc.id },
                data: updates,
            })
            migrated++
            console.log(`  OK Discipline ${disc.id}: migrated ${Object.keys(updates).join(', ')}`)
        }
    }

    console.log(`  Disciplines: ${migrated} migrated, ${disciplines.length} total`)
}

async function main() {
    console.log('=== Cloudinary Metadata Migration ===')
    console.log('Cloud:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

    await migrateGalleryImages()
    await migrateActualites()
    await migrateDisciplines()

    console.log('\n=== Migration complete ===')
    await prisma.$disconnect()
}

main().catch((err) => {
    console.error('Migration failed:', err)
    prisma.$disconnect()
    process.exit(1)
})
