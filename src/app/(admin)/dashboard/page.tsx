'use client';

import React, { useState } from 'react';
import {
    Users,
    Search,
    Bell,
    ShieldCheck,
    Clock,
    PlusCircle,
    CreditCard,
    Dumbbell,
    Newspaper,
    Image as ImageIcon,
    Globe,
    Settings
} from 'lucide-react';

import { ModuleCard } from '@/features/dashboard/presentation/components/ModuleCard';
import { ActivityItem } from '@/features/dashboard/presentation/components/ActivityItem';

/**
 * Assemblage final du Cockpit d'Administration.
 * Centralise les deux univers : Gestion Club et Gestion Site.
 */
export default function AdminDashboardPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900">

            <main className="flex-1 flex flex-col">

                <div className="p-8 space-y-10 max-w-7xl mx-auto w-full">
                    {/* Section de Bienvenue et statistiques globales */}
                    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                        <div className="space-y-4 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3" /> Espace Sécurisé
                            </div>
                            <h2 className="text-3xl font-black italic uppercase">Bonjour, Christophe.</h2>
                            <p className="text-slate-500 max-w-sm text-sm">Gestion centralisée de votre association sportive.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100 min-w-[100px]">
                                <p className="text-2xl font-bold">124</p>
                                <p className="text-[10px] text-slate-400 uppercase font-black">Membres</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100 min-w-[100px]">
                                <p className="text-2xl font-bold text-red-600">12</p>
                                <p className="text-[10px] text-slate-400 uppercase font-black">Actus</p>
                            </div>
                        </div>
                    </section>

                    {/* Grille des modules de pilotage */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ModuleCard
                            title="Gestion du Club"
                            description="Administrez les adhérents, la trésorerie et les instances du bureau."
                            icon={Users}
                            color="bg-slate-900"
                            stats={{ label: "Inscriptions à valider", value: "08" }}
                            links={[
                                { label: "Membres de l'association", icon: Users, href: "/admin/club/adherents" },
                                { label: "Trésorerie & Cotisations", icon: CreditCard, href: "/admin/club/finances" },
                                { label: "Organisation du Bureau", icon: ShieldCheck, href: "/admin/club/bureau" }
                            ]}
                        />

                        <ModuleCard
                            title="Gestion du Site"
                            description="CMS pour mettre à jour les disciplines, actualités et la galerie."
                            icon={Globe}
                            color="bg-red-600"
                            stats={{ label: "Dernière mise à jour", value: "Hier" }}
                            links={[
                                // FIX: Suppression du préfixe /admin car (admin) est un route group transparent
                                { label: "Catalogue Disciplines", icon: Dumbbell, href: "/content/disciplines" },
                                { label: "Articles & Actualités", icon: Newspaper, href: "/content/news" },
                                { label: "Médiathèque (Galerie)", icon: ImageIcon, href: "/content/gallery" }
                            ]}
                        />
                    </div>

                    {/* Journal des dernières activités */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200">
                        <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2 tracking-tight">
                            <Clock className="w-5 h-5 text-red-600" />
                            Activités Récentes
                        </h3>
                        <div className="space-y-4">
                            <ActivityItem
                                type="club"
                                text="Nouvelle inscription : Jean Dupont"
                                time="il y a 2h"
                                icon={PlusCircle}
                                dotColor="bg-slate-900"
                            />
                            <ActivityItem
                                type="site"
                                text="Modification : Discipline Muay Thaï"
                                time="il y a 4h"
                                icon={Settings}
                                dotColor="bg-red-600"
                            />
                            <ActivityItem
                                type="club"
                                text="Paiement reçu : Marie Lemoine"
                                time="Hier, 18:30"
                                icon={CreditCard}
                                dotColor="bg-slate-900"
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}