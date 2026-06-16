import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryToolbar } from './GalleryToolbar';

const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    activeCategory: null as string | null,
    onCategoryChange: vi.fn(),
    selectionMode: false,
    onSelectionModeChange: vi.fn(),
    viewMode: 'masonry' as const,
    onViewModeChange: vi.fn(),
    sortField: 'date' as const,
    sortDirection: 'desc' as const,
    onSortChange: vi.fn(),
};

describe('GalleryToolbar', () => {
    it('renders search input with placeholder', () => {
        render(<GalleryToolbar {...defaultProps} />);

        expect(screen.getByPlaceholderText('Rechercher une image...')).toBeTruthy();
    });

    it('calls onSearchChange when typing in search', () => {
        const onSearchChange = vi.fn();
        render(<GalleryToolbar {...defaultProps} onSearchChange={onSearchChange} />);

        fireEvent.change(screen.getByPlaceholderText('Rechercher une image...'), {
            target: { value: 'test' },
        });

        expect(onSearchChange).toHaveBeenCalledWith('test');
    });

    it('renders category filter buttons including "Tout"', () => {
        render(<GalleryToolbar {...defaultProps} />);

        expect(screen.getByText('Tout')).toBeTruthy();
        expect(screen.getByText('Discipline')).toBeTruthy();
        expect(screen.getByText('Actualité')).toBeTruthy();
        expect(screen.getByText('Carousel')).toBeTruthy();
    });

    it('calls onCategoryChange when a category chip is clicked', () => {
        const onCategoryChange = vi.fn();
        render(<GalleryToolbar {...defaultProps} onCategoryChange={onCategoryChange} />);

        fireEvent.click(screen.getByText('Discipline'));

        expect(onCategoryChange).toHaveBeenCalledWith('discipline');
    });

    it('calls onCategoryChange(null) when "Tout" is clicked', () => {
        const onCategoryChange = vi.fn();
        render(<GalleryToolbar {...defaultProps} activeCategory="discipline" onCategoryChange={onCategoryChange} />);

        fireEvent.click(screen.getByText('Tout'));

        expect(onCategoryChange).toHaveBeenCalledWith(null);
    });

    it('calls onViewModeChange when view mode toggle clicked', () => {
        const onViewModeChange = vi.fn();
        render(<GalleryToolbar {...defaultProps} onViewModeChange={onViewModeChange} />);

        fireEvent.click(screen.getByLabelText('Vue liste'));

        expect(onViewModeChange).toHaveBeenCalledWith('list');
    });
});
