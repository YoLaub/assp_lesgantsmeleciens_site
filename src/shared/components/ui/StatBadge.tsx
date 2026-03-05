import React from 'react';

interface StatBadgeProps {
    label: string;
    value: string;
}

export const StatBadge: React.FC<StatBadgeProps> = ({ label, value }) => (
    <div className="text-right">
        <p className="text-white/80 text-[10px] font-medium uppercase tracking-wider">
            {label}
        </p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);