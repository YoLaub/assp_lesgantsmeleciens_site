'use client';

import { useState } from 'react';
import { useImageCollection } from '@/hooks/useImageCollection';
import { useLightbox } from '@/hooks/useLightbox';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { Lightbox } from '@/components/shared/Lightbox/Lightbox';
import { AddImageDialog } from '@/components/shared/AddImageDialog/AddImageDialog';
import { SelectionToolbar } from '@/components/shared/SelectionToolbar/SelectionToolbar';
import { Toolbar } from '@/components/shared/Toolbar/Toolbar';
import styles from './MasonryGallery.module.css';

export function MasonryGallery() {
  const { images, selectedIds, dispatch, selectedCount, hasSelection } =
    useImageCollection();
  const lightbox = useLightbox(images.length);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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
    onArrowLeft: lightbox.isOpen ? lightbox.prev : undefined,
    onArrowRight: lightbox.isOpen ? lightbox.next : undefined,
  });

  const handleCardClick = (id: string, index: number) => {
    if (hasSelection) {
      dispatch({ type: 'TOGGLE_SELECT', id });
    } else {
      lightbox.open(index);
    }
  };

  const handleCardContextMenu = (
    e: React.MouseEvent,
    id: string,
  ) => {
    e.preventDefault();
    dispatch({ type: 'TOGGLE_SELECT', id });
  };

  return (
    <div className={styles.container}>
      <Toolbar onAdd={() => setAddDialogOpen(true)} />

      {images.length === 0 ? (
        <div className={styles.emptyState}>
          No images yet. Click &quot;Add Image&quot; to get started.
        </div>
      ) : (
        <div className={styles.grid}>
          {images.map((image, index) => {
            const isSelected = selectedIds.has(image.id);
            const isDimmed = hasSelection && !isSelected;

            return (
              <div
                key={image.id}
                className={`${styles.card} ${isSelected ? styles.selected : ''} ${isDimmed ? styles.dimmed : ''}`}
                style={{ '--index': index } as React.CSSProperties}
                onClick={() => handleCardClick(image.id, index)}
                onContextMenu={(e) => handleCardContextMenu(e, image.id)}
                role="button"
                tabIndex={0}
                aria-label={image.alt || `Image ${index + 1}`}
                aria-pressed={isSelected}
              >
                <img
                  className={styles.image}
                  src={image.src}
                  alt={image.alt || ''}
                  width={image.width}
                  height={image.height}
                />
                <div className={styles.checkmark} aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            );
          })}
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
