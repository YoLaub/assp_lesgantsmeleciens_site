import { render } from '@testing-library/react';
import { GalleryGridSkeleton } from './GalleryCardSkeleton';

describe('GalleryGridSkeleton', () => {
    it('renders default 8 skeleton cards', () => {
        const { container } = render(<GalleryGridSkeleton />);
        const cards = container.querySelectorAll('.animate-pulse');

        expect(cards).toHaveLength(8);
    });

    it('renders specified count of cards', () => {
        const { container } = render(<GalleryGridSkeleton count={3} />);
        const cards = container.querySelectorAll('.animate-pulse');

        expect(cards).toHaveLength(3);
    });

    it('each skeleton has deterministic height', () => {
        const { container } = render(<GalleryGridSkeleton count={2} />);
        const cards = container.querySelectorAll('.animate-pulse');

        cards.forEach((card) => {
            const inner = card.firstElementChild as HTMLElement;
            expect(inner.style.paddingBottom).toBeTruthy();
        });
    });
});
