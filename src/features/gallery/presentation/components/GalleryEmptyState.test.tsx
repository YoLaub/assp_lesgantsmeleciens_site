import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryEmptyState } from './GalleryEmptyState';

describe('GalleryEmptyState', () => {
    it('renders the empty state heading', () => {
        render(<GalleryEmptyState onAdd={vi.fn()} />);

        expect(screen.getByText('Aucune image')).toBeTruthy();
    });

    it('renders description text', () => {
        render(<GalleryEmptyState onAdd={vi.fn()} />);

        expect(screen.getByText(/galerie est vide/i)).toBeTruthy();
    });

    it('calls onAdd when button is clicked', () => {
        const onAdd = vi.fn();
        render(<GalleryEmptyState onAdd={onAdd} />);

        fireEvent.click(screen.getByText('Ajouter des images'));

        expect(onAdd).toHaveBeenCalledOnce();
    });
});
