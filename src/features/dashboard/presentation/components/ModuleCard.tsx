import React from 'react';
import { ChevronRight } from 'lucide-react';
// Importation corrigée en chemin relatif pour éviter les erreurs de résolution d'alias
import { StatBadge } from '../../../../shared/components/ui/StatBadge';

interface ModuleLink {
    label: string;
    href: string;
    icon: React.ElementType;
}

interface ModuleCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    links: ModuleLink[];
    color: string;
    stats: { label: string; value: string };
}

/**
 * Composant de pilotage par univers (Club ou Site).
 * Centralise les accès rapides et les KPIs de haut niveau.
 */
export const ModuleCard: React.FC<ModuleCardProps> = ({
                                                          title,
                                                          description,
                                                          icon: Icon,
                                                          links,
                                                          color,
                                                          stats
                                                      }) => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300">
        <div className={`p-6 ${color} text-white`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    <Icon className="w-7 h-7 text-white" />
                </div>
                <StatBadge label={stats.label} value={stats.value} />
            </div>
            <h2 className="text-xl font-bold mb-1">{title}</h2>
            <p className="text-white/80 text-xs leading-relaxed">{description}</p>
        </div>

        <div className="p-5 flex-1 flex flex-col">
            <div className="space-y-2 flex-1">
                {links.map((link, idx) => (
                    <button
                        key={idx}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">
                                <link.icon className="w-4 h-4 text-slate-600" />
                            </div>
                            <span className="font-semibold text-slate-700 text-sm">{link.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                    </button>
                ))}
            </div>
        </div>
    </div>
);