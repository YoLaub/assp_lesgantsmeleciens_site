import React from 'react';
import {
    Users, ShieldCheck, Clock, PlusCircle, CreditCard,
    Dumbbell, Newspaper, Image as ImageIcon, Globe
} from 'lucide-react';

import { ModuleCard } from '@/features/dashboard/presentation/components/ModuleCard';
import { ActivityItem } from '@/features/dashboard/presentation/components/ActivityItem';
import { getAdherentsAction } from '@/features/adherents/actions/admin-adherents.actions';
import { prisma } from '@/shared/lib/prisma';

function getTimeAgo(dateInput: Date | string | undefined): string {
    if (!dateInput) return "Récemment";
    const date = new Date(dateInput);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "À l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Hier";
    return `Il y a ${days} jours`;
}

export async function AdminDashboard() {
    const [adherents, actusCount] = await Promise.all([
        getAdherentsAction(),
        prisma.actualite.count(),
    ]);

    // Dossiers en attente = non validés ET questionnaire rempli
    const pendingCount = adherents.filter((adh) => !adh.inscriptionValide).length;
    const formattedPendingCount = pendingCount.toString().padStart(2, '0');
    const recentActivities = adherents.slice(0, 4);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900">
            <main className="flex-1 flex flex-col">
                <div className="p-8 space-y-10 max-w-7xl mx-auto w-full">

                    {/* Section Bienvenue */}
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
                                <p className="text-2xl font-bold">{adherents.length}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-black">Membres</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100 min-w-[100px]">
                                <p className="text-2xl font-bold text-red-600">{actusCount}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-black">Actus</p>
                            </div>
                        </div>
                    </section>

                    {/* Grille des modules */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ModuleCard
                            title="Gestion du Club"
                            description="Administrez les adhérents, la trésorerie et les instances du bureau."
                            icon={Users}
                            color="bg-slate-900"
                            stats={{ label: "Inscriptions à valider", value: formattedPendingCount }}
                            links={[
                                { label: "Membres de l'association", icon: Users, href: "/admin/club/adherents" },
                                { label: "Trésorerie & Cotisations", icon: CreditCard, href: "/admin/club/finances" }
                            ]}
                        />

                        <ModuleCard
                            title="Gestion du Site"
                            description="CMS pour mettre à jour les disciplines, actualités et la galerie."
                            icon={Globe}
                            color="bg-red-600"
                            stats={{ label: "Dernière mise à jour", value: "Hier" }}
                            links={[
                                { label: "Catalogue Disciplines", icon: Dumbbell, href: "/admin/content/disciplines" },
                                { label: "Articles & Actualités", icon: Newspaper, href: "/admin/content/actualites" },
                                { label: "Médiathèque (Galerie)", icon: ImageIcon, href: "/admin/content/gallery" }
                            ]}
                        />
                    </div>

                    {/* Journal d'activités */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200">
                        <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2 tracking-tight">
                            <Clock className="w-5 h-5 text-red-600" />
                            Activités Récentes
                        </h3>
                        <div className="space-y-4">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((adh) => (
                                    <ActivityItem
                                        key={adh.id}
                                        type="club"
                                        text={`Nouvelle inscription : ${adh.prenom} ${adh.nom}`}
                                        time={getTimeAgo(adh.dateInscription ?? undefined)}
                                        icon={PlusCircle}
                                        dotColor="bg-slate-900"
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 italic text-center py-4">
                                    Aucune activité récente.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
