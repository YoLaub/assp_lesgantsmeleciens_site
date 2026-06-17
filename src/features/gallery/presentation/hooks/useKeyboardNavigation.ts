import { useEffect, useRef } from 'react';

interface KeyboardCallbacks {
    onDelete?: () => void;
    onEscape?: () => void;
    onSelectAll?: (e: KeyboardEvent) => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
}

export function useKeyboardNavigation(callbacks: KeyboardCallbacks) {
    const callbacksRef = useRef(callbacks);

    useEffect(() => {
        callbacksRef.current = callbacks;
    });

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const target = e.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();
            if (tagName === 'input' || tagName === 'textarea' || target.isContentEditable) {
                return;
            }

            switch (e.key) {
                case 'Delete':
                    callbacksRef.current.onDelete?.();
                    break;
                case 'Escape':
                    callbacksRef.current.onEscape?.();
                    break;
                case 'a':
                    if (e.ctrlKey || e.metaKey) {
                        callbacksRef.current.onSelectAll?.(e);
                    }
                    break;
                case 'ArrowLeft':
                    callbacksRef.current.onArrowLeft?.();
                    break;
                case 'ArrowRight':
                    callbacksRef.current.onArrowRight?.();
                    break;
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
}
