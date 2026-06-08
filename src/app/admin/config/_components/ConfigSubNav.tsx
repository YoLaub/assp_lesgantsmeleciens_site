'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
    { label: 'Tarifs', href: '/admin/config/tarifs' },
    { label: 'Règlement', href: '/admin/config/reglement' },
    { label: 'Questionnaire santé', href: '/admin/config/sante' },
];

export function ConfigSubNav() {
    const pathname = usePathname();
    return (
        <nav className="flex gap-1 border-b border-slate-200">
            {TABS.map(({ label, href }) => (
                <Link
                    key={href}
                    href={href}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                        pathname === href
                            ? 'border-slate-900 text-slate-900'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {label}
                </Link>
            ))}
        </nav>
    );
}
