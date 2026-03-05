import React from 'react';
import { Search, Bell } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

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

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden lg:block"></div>

            </div>
        </header>
    );
};