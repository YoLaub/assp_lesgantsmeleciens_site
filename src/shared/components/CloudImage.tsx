'use client'

import { useState } from 'react'
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
    quality?: number | 'auto' | string
    className?: string
    placeholder?: 'blur' | 'empty'
    blurDataUrl?: string
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
    quality,
    className,
    placeholder = 'blur',
    blurDataUrl,
    draggable,
    onLoad,
}: CloudImageProps) {
    const [hasError, setHasError] = useState(false)

    if (hasError) {
        return (
            <div
                className={`bg-slate-100 flex items-center justify-center text-slate-400 ${className ?? ''}`}
                style={fill ? { position: 'absolute', inset: 0 } : { width: width ?? 200, height: height ?? 150 }}
                role="img"
                aria-label={alt}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            </div>
        )
    }

    // Prefer stored base64 blur, fall back to Cloudinary URL blur
    const resolvedBlurDataURL = placeholder === 'blur'
        ? (blurDataUrl || (asset ? buildBlurUrl(asset) : undefined))
        : undefined

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
                quality={quality}
                className={className}
                placeholder={placeholder}
                blurDataURL={resolvedBlurDataURL}
                draggable={draggable}
                onLoad={onLoad}
                onError={() => setHasError(true)}
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
                quality={typeof quality === 'number' ? quality : undefined}
                placeholder={placeholder}
                blurDataURL={resolvedBlurDataURL}
                className={className}
                draggable={draggable}
                onLoad={onLoad}
                onError={() => setHasError(true)}
            />
        )
    }

    return null
}
