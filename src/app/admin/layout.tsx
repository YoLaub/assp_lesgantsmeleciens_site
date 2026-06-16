import React from 'react';
// Correction des imports avec chemins relatifs explicites
import { AdminSidebar } from './_components/AdminSidebar';
import { AdminHeader } from './_components/AdminHeader';

/**
 * Layout principal pour le groupe de routes (admin).
 * Définit la structure globale de l'interface de gestion.
 * Chemin : src/app/(admin)/layout.tsx
 */
export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900">
            {/* Navigation latérale (Sidebar) */}
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Entête commune (Header) */}
                <AdminHeader />

                {/* Zone de contenu dynamique (Pages) */}
                <main className="flex-1 overflow-y-auto">
                    <div className="animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>

                {/* Bas de page administratif */}
                <footer className="p-6 text-center border-t border-slate-200 bg-white/50 backdrop-blur-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} — Système de Gestion Interne • Les Gants Meleciens
                    </p>
                </footer>
            </div>
        </div>
    );
}