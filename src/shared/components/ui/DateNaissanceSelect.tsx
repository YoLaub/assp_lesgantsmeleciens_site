"use client";

import { useId, useMemo } from "react";

/**
 * Sélecteur de date de naissance en trois menus (jour / mois / année).
 *
 * Remplace `<input type="date">` dont le rendu natif varie selon l'appareil
 * (Pixel autorise la saisie manuelle, Samsung force un calendrier sans clavier)
 * et qui oblige à remonter les années une par une — pénible pour une date
 * de naissance.
 *
 * La valeur émise via `onChange` reste au format ISO `"AAAA-MM-JJ"` (ou `""`
 * tant que la date est incomplète), strictement compatible avec la validation
 * existante (`Date.parse`, `new Date(value)`, calcul d'âge).
 */

const MOIS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface DateNaissanceSelectProps {
    value: string; // "AAAA-MM-JJ" ou ""
    onChange: (value: string) => void;
    /** Année la plus ancienne proposée. Par défaut : année courante − 100. */
    minYear?: number;
    disabled?: boolean;
    /** id de base, relié au <label> via aria-labelledby si besoin. */
    name?: string;
}

function parse(value: string): { y: string; m: string; d: string } {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return { y: "", m: "", d: "" };
    return { y: match[1], m: match[2], d: match[3] };
}

/** Nombre de jours dans un mois donné (gère les années bissextiles). */
function daysInMonth(year: number, month: number): number {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
}

export function DateNaissanceSelect({
    value,
    onChange,
    minYear,
    disabled = false,
    name = "date-naissance",
}: DateNaissanceSelectProps) {
    const baseId = useId();
    const { y, m, d } = parse(value);

    const currentYear = new Date().getFullYear();
    const firstYear = minYear ?? currentYear - 100;

    const years = useMemo(() => {
        const list: number[] = [];
        for (let year = currentYear; year >= firstYear; year--) list.push(year);
        return list;
    }, [currentYear, firstYear]);

    const nbDays = daysInMonth(Number(y), Number(m));
    const days = useMemo(
        () => Array.from({ length: nbDays }, (_, i) => i + 1),
        [nbDays],
    );

    const emit = (next: { y: string; m: string; d: string }) => {
        // On borne le jour si le mois/année réduit le nombre de jours
        // (ex. 31 → 28 en février) pour ne jamais émettre une date invalide.
        let day = next.d;
        if (day && next.y && next.m) {
            const max = daysInMonth(Number(next.y), Number(next.m));
            if (Number(day) > max) day = String(max).padStart(2, "0");
        }
        if (next.y && next.m && day) {
            onChange(`${next.y}-${next.m}-${day}`);
        } else {
            onChange("");
        }
    };

    const selectCls =
        "mt-1 w-full rounded-md border border-gray-300 p-2 bg-white text-gray-900 focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00] disabled:bg-gray-100";

    return (
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Date de naissance">
            <select
                id={`${baseId}-jour`}
                name={`${name}-jour`}
                aria-label="Jour"
                value={d}
                disabled={disabled}
                onChange={(e) => emit({ y, m, d: e.target.value })}
                className={selectCls}
            >
                <option value="">Jour</option>
                {days.map((day) => {
                    const v = String(day).padStart(2, "0");
                    return <option key={v} value={v}>{day}</option>;
                })}
            </select>

            <select
                id={`${baseId}-mois`}
                name={`${name}-mois`}
                aria-label="Mois"
                value={m}
                disabled={disabled}
                onChange={(e) => emit({ y, m: e.target.value, d })}
                className={selectCls}
            >
                <option value="">Mois</option>
                {MOIS.map((label, i) => {
                    const v = String(i + 1).padStart(2, "0");
                    return <option key={v} value={v}>{label}</option>;
                })}
            </select>

            <select
                id={`${baseId}-annee`}
                name={`${name}-annee`}
                aria-label="Année"
                value={y}
                disabled={disabled}
                onChange={(e) => emit({ y: e.target.value, m, d })}
                className={selectCls}
            >
                <option value="">Année</option>
                {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
        </div>
    );
}
