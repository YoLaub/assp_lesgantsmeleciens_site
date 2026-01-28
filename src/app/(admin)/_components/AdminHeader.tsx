import React from 'react';
import { Search, Bell } from 'lucide-react';

/**
 * Composant d'entête pour la zone d'administration.
 * Chemin : src/app/(admin)/_components/AdminHeader.tsx
 */
export const AdminHeader = () => {
    return (
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
            <div className="flex flex-col">
                <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Administration</h1>
                <p className="text-lg font-bold text-slate-900 leading-none">Les Gants Meleciens</p>
            </div>

            <div className="flex items-center gap-6">
                {/* Barre de recherche discrète */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-red-500 transition-all outline-none"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

                {/* Profil Utilisateur */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-900">C. Barbereau</p>
                        <p className="text-[10px] text-slate-500 font-medium italic">Gestionnaire</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        CB
                    </div>
                </div>
            </div>
        </header>
    );
};