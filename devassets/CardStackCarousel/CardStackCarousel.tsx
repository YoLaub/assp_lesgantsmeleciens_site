'use client';

import { useState, useRef, useCallback } from 'react';
import { useImageCollection } from '@/hooks/useImageCollection';
import { useLightbox } from '@/hooks/useLightbox';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { Lightbox } from '@/components/shared/Lightbox/Lightbox';
import { AddImageDialog } from '@/components/shared/AddImageDialog/AddImageDialog';
import { SelectionToolbar } from '@/components/shared/SelectionToolbar/SelectionToolbar';
import { Toolbar } from '@/components/shared/Toolbar/Toolbar';
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

export function CardStackCarousel() {
  const { images, selectedIds, dispatch, selectedCount, hasSelection } =
    useImageCollection();
  const lightbox = useLightbox(images.length);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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

  useKeyboardNavigation({
    onDelete: () => dispatch({ type: 'DELETE_SELECTED' }),
    onEscape: () => {
      lightbox.close();
      dispatch({ type: 'CLEAR_SELECTION' });
    },
    onSelectAll: (e) => {
      e.preventDefault();
      dispatch({ type: 'SELECT_ALL' });
    },
    onArrowLeft: lightbox.isOpen ? lightbox.prev : goToPrev,
    onArrowRight: lightbox.isOpen ? lightbox.next : goToNext,
  });

  // Keep activeIndex within bounds (render-time correction)
  if (images.length === 0 && activeIndex !== 0) {
    setActiveIndex(0);
  } else if (images.length > 0 && activeIndex >= images.length) {
    setActiveIndex(images.length - 1);
  }

  // Drag handlers
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

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragDeltaX.current < -DRAG_THRESHOLD) {
      goToNext();
    } else if (dragDeltaX.current > DRAG_THRESHOLD) {
      goToPrev();
    }
  }, [isDragging, goToNext, goToPrev]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (dragDeltaX.current < -DRAG_THRESHOLD) {
        goToNext();
      } else if (dragDeltaX.current > DRAG_THRESHOLD) {
        goToPrev();
      }
    }
  }, [isDragging, goToNext, goToPrev]);

  const handleCardClick = useCallback(
    (imageIndex: number, offset: number) => {
      // If user was dragging, ignore the click
      if (hasDragged.current) return;

      if (offset === 0) {
        // Center card
        if (hasSelection) {
          dispatch({ type: 'TOGGLE_SELECT', id: images[imageIndex].id });
        } else {
          lightbox.open(imageIndex);
        }
      } else {
        // Non-center card: navigate to it
        goToIndex(imageIndex);
      }
    },
    [hasSelection, dispatch, images, lightbox, goToIndex],
  );

  // Calculate the offset of each image from the center
  const getOffset = (imageIndex: number): number => {
    const len = images.length;
    if (len === 0) return 0;

    let diff = imageIndex - activeIndex;
    // Wrap around for circular behavior
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;

    return diff;
  };

  return (
    <div className={styles.container}>
      <Toolbar onAdd={() => setAddDialogOpen(true)} />

      {images.length === 0 ? (
        <div className={styles.emptyState}>
          No images yet. Click &quot;Add Image&quot; to get started.
        </div>
      ) : (
        <div
          className={`${styles.viewport} ${isDragging ? styles.dragging : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.cardsContainer}>
            {images.map((image, index) => {
              const offset = getOffset(index);
              const positionClass = getPositionClass(offset);
              const isSelected = selectedIds.has(image.id);

              return (
                <div
                  key={image.id}
                  className={`${styles.card} ${positionClass} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleCardClick(index, offset)}
                  role="button"
                  tabIndex={offset === 0 ? 0 : -1}
                  aria-label={image.alt || `Card ${index + 1}`}
                >
                  <img
                    className={styles.cardImage}
                    src={image.src}
                    alt={image.alt || ''}
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
            aria-label="Previous card"
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
            aria-label="Next card"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      <Lightbox
        images={images}
        currentIndex={lightbox.currentIndex}
        isOpen={lightbox.isOpen}
        onClose={lightbox.close}
        onNext={lightbox.next}
        onPrev={lightbox.prev}
      />

      <AddImageDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={(img) => dispatch({ type: 'ADD_IMAGE', image: img })}
      />

      <SelectionToolbar
        selectedCount={selectedCount}
        onDelete={() => dispatch({ type: 'DELETE_SELECTED' })}
        onSelectAll={() => dispatch({ type: 'SELECT_ALL' })}
        onClearSelection={() => dispatch({ type: 'CLEAR_SELECTION' })}
      />
    </div>
  );
}
