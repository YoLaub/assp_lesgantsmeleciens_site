'use client';

import { Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'default';
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const isDanger = variant === 'danger';

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                <div className="p-6 space-y-3">
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500">{message}</p>
                </div>
                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all
                                    active:scale-95 shadow-lg
                                    ${isDanger
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                                    }`}
                    >
                        {isDanger && <Trash2 className="w-4 h-4" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
