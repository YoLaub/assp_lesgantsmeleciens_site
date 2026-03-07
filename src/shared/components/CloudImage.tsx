'use client'

import { CldImage } from 'next-cloudinary'
import Image from 'next/image'
import { type CloudinaryAsset } from '@/shared/types/cloudinary'
import { buildBlurUrl } from '@/shared/lib/cloudinary'

type CropType = 'fill' | 'crop' | 'limit' | 'auto' | 'fill_pad' | 'fit' | 'lfill' | 'lpad' | 'mfit' | 'mpad' | 'pad' | 'scale' | 'thumb'

type CloudImageProps = {
    asset?: CloudinaryAsset
    localSrc?: string
    alt: string
    sizes: string
    width?: number
    height?: number
    fill?: boolean
    priority?: boolean
    crop?: CropType
    gravity?: string
    className?: string
    placeholder?: 'blur' | 'empty'
    draggable?: boolean
    onLoad?: () => void
}

export function CloudImage({
    asset,
    localSrc,
    alt,
    sizes,
    fill,
    width,
    height,
    priority,
    crop = 'limit',
    gravity,
    className,
    placeholder = 'blur',
    draggable,
    onLoad,
}: CloudImageProps) {
    if (asset) {
        return (
            <CldImage
                src={asset.publicId}
                width={fill ? undefined : (width ?? asset.width)}
                height={fill ? undefined : (height ?? asset.height)}
                fill={fill}
                alt={alt}
                sizes={sizes}
                priority={priority}
                crop={crop}
                gravity={gravity}
                className={className}
                placeholder={placeholder}
                blurDataURL={placeholder === 'blur' ? buildBlurUrl(asset) : undefined}
                draggable={draggable}
                onLoad={onLoad}
            />
        )
    }

    if (localSrc) {
        return (
            <Image
                src={localSrc}
                width={width}
                height={height}
                fill={fill}
                alt={alt}
                sizes={sizes}
                priority={priority}
                placeholder={placeholder}
                className={className}
                draggable={draggable}
                onLoad={onLoad}
            />
        )
    }

    return null
}
