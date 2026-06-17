"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { exportAdherentsCsvAction } from "@/features/adherents/actions/admin-adherents.actions";

export function ExportCsvButton() {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const { csv, filename } = await exportAdherentsCsvAction();
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-60 transition-all"
        >
            <Download className="w-4 h-4" /> {loading ? "Export…" : "Export CSV"}
        </button>
    );
}
