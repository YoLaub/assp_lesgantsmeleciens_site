import { useEffect } from 'react';

interface KeyboardCallbacks {
    onDelete?: () => void;
    onEscape?: () => void;
    onSelectAll?: (e: KeyboardEvent) => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
}

export function useKeyboardNavigation(callbacks: KeyboardCallbacks) {
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const target = e.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();
            if (tagName === 'input' || tagName === 'textarea' || target.isContentEditable) {
                return;
            }

            switch (e.key) {
                case 'Delete':
                    callbacks.onDelete?.();
                    break;
                case 'Escape':
                    callbacks.onEscape?.();
                    break;
                case 'a':
                    if (e.ctrlKey || e.metaKey) {
                        callbacks.onSelectAll?.(e);
                    }
                    break;
                case 'ArrowLeft':
                    callbacks.onArrowLeft?.();
                    break;
                case 'ArrowRight':
                    callbacks.onArrowRight?.();
                    break;
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [callbacks]);
}
