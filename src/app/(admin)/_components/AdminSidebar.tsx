import React from 'react';
import { LayoutDashboard, Users, Globe, Settings, Dumbbell } from 'lucide-react';

/**
 * Navigation latérale pour l'espace d'administration.
 * Responsabilité : Navigation globale entre les univers.
 */
export const AdminSidebar = () => (
    <aside className="w-full lg:w-20 bg-slate-900 flex lg:flex-col items-center py-6 gap-8 border-r border-slate-800 px-4 lg:px-0">
        {/* Logo / Home link */}
        <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-900/20">
            <Dumbbell className="text-white w-6 h-6" />
        </div>

        {/* Navigation Icons */}
        <nav className="flex flex-row lg:flex-col gap-4 flex-1">
            <button className="p-3 bg-slate-800 text-white rounded-xl shadow-inner">
                <LayoutDashboard className="w-6 h-6" />
            </button>
            <button className="p-3 text-slate-500 hover:text-white transition-colors">
                <Users className="w-6 h-6" />
            </button>
            <button className="p-3 text-slate-500 hover:text-white transition-colors">
                <Globe className="w-6 h-6" />
            </button>
            <button className="p-3 text-slate-500 hover:text-white transition-colors">
                <Settings className="w-6 h-6" />
            </button>
        </nav>

        {/* User Profile Avatar */}
        <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-white font-bold text-xs">
            CB
        </div>
    </aside>
);