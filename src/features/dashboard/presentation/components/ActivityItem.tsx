import React from 'react';

interface ActivityItemProps {
    text: string;
    time: string;
    icon: React.ElementType;
    dotColor: string;
    type: 'club' | 'site';
}

/**
 * Composant métier pour les entrées du journal d'activité.
 * Gère la mise en forme conditionnelle selon le type de domaine (Club ou Site).
 */
export const ActivityItem: React.FC<ActivityItemProps> = ({
                                                              text,
                                                              time,
                                                              icon: Icon,
                                                              dotColor,
                                                              type
                                                          }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
        <div className="flex items-center gap-4">
            <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
            <div className="p-2 bg-white rounded-lg shadow-sm">
                <Icon className="w-4 h-4 text-slate-600" />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-900">{text}</p>
                <p className="text-xs text-slate-500">{time}</p>
            </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
            type === 'site' ? 'text-red-600 bg-red-50' : 'text-slate-600 bg-slate-200'
        }`}>
      {type}
    </span>
    </div>
);