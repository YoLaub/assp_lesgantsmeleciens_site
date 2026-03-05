'use client';

import React from 'react';
import {LayoutDashboard, Users, Globe, Dumbbell, Images, Newspaper, House} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import Link from "next/link";


export const AdminSidebar = () => (
    <aside className="w-full lg:w-20 bg-slate-900 flex lg:flex-col items-center py-6 gap-8 border-r border-slate-800 px-4 lg:px-0">

        <Link href="/admin/dashboard">
            <button className="p-3 bg-red-500 text-white rounded-xl shadow-inner">
                <House className="text-white w-6 h-6" />
            </button>
        </Link>

        {/* Navigation Icons */}
        <nav className="flex flex-row lg:flex-col gap-4 flex-1">
            <Link href="/admin/content/disciplines">
                <button className="p-3 bg-slate-800 text-white rounded-xl shadow-inner">
                    <Dumbbell className="text-white w-6 h-6" />
                </button>
            </Link>

            <Link href="/admin/club/adherents">
                <button className="p-3 text-slate-500 bg-slate-800 hover:text-white transition-colors rounded-xl shadow-inner">
                    <Users className="w-6 h-6" />
                </button>
            </Link>

            <Link href="/admin/content/actualites">
                <button className="p-3 text-slate-500 bg-slate-800 hover:text-white transition-colors rounded-xl shadow-inner">
                    <Newspaper className="w-6 h-6" />
                </button>
            </Link>

            <Link href="/admin/content/gallery">
                <button className="p-3 text-slate-500 bg-slate-800 hover:text-white transition-colors rounded-xl shadow-inner">
                    <Images className="w-6 h-6" />
                </button>
            </Link>


        </nav>

        {/* User Profile */}
        <UserButton afterSignOutUrl="/login" />
    </aside>
);