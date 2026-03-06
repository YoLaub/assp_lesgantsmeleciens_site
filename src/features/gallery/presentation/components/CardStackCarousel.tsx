'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GalleryImage } from '@/features/gallery/domain/models/gallery-image.model';
import { useLightbox } from '@/features/gallery/presentation/hooks/useLightbox';
import { Lightbox } from '@/features/gallery/presentation/components/Lightbox';
import { CloudImage } from '@/shared/components/CloudImage';
import styles from './CardStackCarousel.module.css';

const DRAG_THRESHOLD = 50;

function getPositionClass(offset: number): string {
  switch (offset) {
    case -2:
      return styles.posLeft2;
    case -1:
      return styles.posLeft1;
    case 0:
      return styles.posCenter;
    case 1:
      return styles.posRight1;
    case 2:
      return styles.posRight2;
    default:
      return styles.posHidden;
  }
}

interface CardStackCarouselProps {
  images: GalleryImage[];
}

export function CardStackCarousel({ images }: CardStackCarouselProps) {
  const lightbox = useLightbox(images.length);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragDeltaX = useRef(0);
  const hasDragged = useRef(false);

  const goToNext = useCallback(() => {
    if (images.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    if (images.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToIndex = useCallback(
    (index: number) => {
      if (images.length === 0) return;
      setActiveIndex(((index % images.length) + images.length) % images.length);
    },
    [images.length],
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (lightbox.isOpen) {
        if (e.key === 'ArrowLeft') lightbox.prev();
        else if (e.key === 'ArrowRight') lightbox.next();
        else if (e.key === 'Escape') lightbox.close();
      } else {
        if (e.key === 'ArrowLeft') goToPrev();
        else if (e.key === 'ArrowRight') goToNext();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, goToPrev, goToNext]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
    hasDragged.current = false;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      dragDeltaX.current = e.clientX - dragStartX.current;
      if (Math.abs(dragDeltaX.current) > 10) {
        hasDragged.current = true;
      }
    },
    [isDragging],
  );

  const finishDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragDeltaX.current < -DRAG_THRESHOLD) goToNext();
    else if (dragDeltaX.current > DRAG_THRESHOLD) goToPrev();
  }, [isDragging, goToNext, goToPrev]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragDeltaX.current = 0;
    hasDragged.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    dragDeltaX.current = e.touches[0].clientX - dragStartX.current;
    if (Math.abs(dragDeltaX.current) > 10) {
      hasDragged.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragDeltaX.current < -DRAG_THRESHOLD) goToNext();
    else if (dragDeltaX.current > DRAG_THRESHOLD) goToPrev();
  }, [goToNext, goToPrev]);

  const handleCardClick = useCallback(
    (imageIndex: number, offset: number) => {
      if (hasDragged.current) return;
      if (offset === 0) {
        lightbox.open(imageIndex);
      } else {
        goToIndex(imageIndex);
      }
    },
    [lightbox, goToIndex],
  );

  const getOffset = (imageIndex: number): number => {
    const len = images.length;
    if (len === 0) return 0;
    let diff = imageIndex - activeIndex;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    return diff;
  };

  if (images.length === 0) return null;

  return (
    <div className={styles.container}>
      <div
        className={`${styles.viewport} ${isDragging ? styles.dragging : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={finishDrag}
        onMouseLeave={finishDrag}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.cardsContainer}>
          {images.map((image, index) => {
            const offset = getOffset(index);
            const positionClass = getPositionClass(offset);

            return (
              <div
                key={image.id}
                className={`${styles.card} ${positionClass}`}
                onClick={() => handleCardClick(index, offset)}
                role="button"
                tabIndex={offset === 0 ? 0 : -1}
                aria-label={image.alt || image.title}
              >
                <CloudImage
                  asset={image.asset}
                  alt={image.alt || image.title}
                  width={image.asset.width || 800}
                  height={image.asset.height || 600}
                  sizes="400px"
                  className={styles.cardImage}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* Navigation arrows */}
        <button
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          aria-label="Image précédente"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          aria-label="Image suivante"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Dot indicators */}
      <div className={styles.dots}>
        {images.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
            onClick={() => goToIndex(index)}
            aria-label={`Aller à l'image ${index + 1}`}
            type="button"
          />
        ))}
      </div>

      <Lightbox
        images={images}
        currentIndex={lightbox.currentIndex}
        isOpen={lightbox.isOpen}
        onClose={lightbox.close}
        onNext={lightbox.next}
        onPrev={lightbox.prev}
      />
    </div>
  );
}
