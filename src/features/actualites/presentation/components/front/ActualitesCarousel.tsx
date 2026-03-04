'use client';

import { useState, useRef, useCallback } from 'react';
import { Actualite } from '@/features/actualites/domain/models/actualite.model';
import { ActualiteCard } from './ActualiteCard';

const DRAG_THRESHOLD = 50;

interface ActualitesCarouselProps {
    actualites: Actualite[];
}

export function ActualitesCarousel({ actualites }: ActualitesCarouselProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);
    const dragDeltaX = useRef(0);
    const hasDragged = useRef(false);

    const pageSize = 3;
    const pages: Actualite[][] = [];
    for (let i = 0; i < actualites.length; i += pageSize) {
        pages.push(actualites.slice(i, i + pageSize));
    }

    const goToNext = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, pages.length - 1));
    }, [pages.length]);

    const goToPrev = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    }, []);

    // Mouse drag handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
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

    // Prevent link navigation when dragging
    const handleClickCapture = useCallback((e: React.MouseEvent) => {
        if (hasDragged.current) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, []);

    if (pages.length === 0) return null;

    return (
        <>
        <div
            className={`w-full overflow-hidden mb-8 select-none [&_*]:!cursor-[inherit] ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={finishDrag}
            onMouseLeave={finishDrag}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClickCapture={handleClickCapture}
        >
            <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentPage * 100}%)` }}
            >
                {pages.map((page, pageIndex) => (
                    <div
                        key={pageIndex}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full shrink-0"
                    >
                        {page.map((actualite) => (
                            <ActualiteCard key={actualite.id} actualite={actualite} />
                        ))}
                    </div>
                ))}
            </div>
        </div>

            {pages.length > 1 && (
                <div className="flex justify-center gap-2">
                    {pages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index)}
                            className={`h-3 rounded-full transition-all duration-300 ${
                                index === currentPage
                                    ? 'bg-brand-red w-8'
                                    : 'w-3 bg-slate-300 hover:bg-slate-400'
                            }`}
                            aria-label={`Page ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
