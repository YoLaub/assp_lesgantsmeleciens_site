import { InscriptionStatus } from "@/generated/prisma/enums";

interface StatusBadgeProps {
    status: InscriptionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styles = {
        VALIDATED: "bg-emerald-50 text-emerald-600",
        PENDING: "bg-amber-50 text-amber-600",
        INCOMPLETE: "bg-orange-50 text-orange-600",
        UNPAID: "bg-red-50 text-red-600",
        CANCELLED: "bg-gray-50 text-gray-600",
    };

    // Style par défaut en cas de statut inconnu
    const currentStyle = styles[status] || "bg-slate-50 text-slate-600";

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${currentStyle}`}>
            {status}
        </span>
    );
}