import { render, screen, fireEvent } from '@testing-library/react';
import { SelectionToolbar } from './SelectionToolbar';

const defaultProps = {
    selectedCount: 2,
    onDelete: vi.fn(),
    onSelectAll: vi.fn(),
    onClearSelection: vi.fn(),
};

describe('SelectionToolbar', () => {
    it('returns null when selectedCount is 0', () => {
        const { container } = render(<SelectionToolbar {...defaultProps} selectedCount={0} />);

        expect(container.firstChild).toBeNull();
    });

    it('shows singular text for 1 selection', () => {
        render(<SelectionToolbar {...defaultProps} selectedCount={1} />);

        expect(screen.getByText('1 image sélectionnée')).toBeTruthy();
    });

    it('shows plural text for multiple selections', () => {
        render(<SelectionToolbar {...defaultProps} selectedCount={3} />);

        expect(screen.getByText('3 images sélectionnées')).toBeTruthy();
    });

    it('calls onSelectAll when "Tout" button clicked', () => {
        const onSelectAll = vi.fn();
        render(<SelectionToolbar {...defaultProps} onSelectAll={onSelectAll} />);

        fireEvent.click(screen.getByLabelText('Tout sélectionner'));

        expect(onSelectAll).toHaveBeenCalledOnce();
    });

    it('calls onClearSelection when "Annuler" button clicked', () => {
        const onClearSelection = vi.fn();
        render(<SelectionToolbar {...defaultProps} onClearSelection={onClearSelection} />);

        fireEvent.click(screen.getByLabelText('Annuler la sélection'));

        expect(onClearSelection).toHaveBeenCalledOnce();
    });

    it('calls onDelete when "Supprimer" button clicked', () => {
        const onDelete = vi.fn();
        render(<SelectionToolbar {...defaultProps} onDelete={onDelete} />);

        fireEvent.click(screen.getByLabelText('Supprimer la sélection'));

        expect(onDelete).toHaveBeenCalledOnce();
    });
});
