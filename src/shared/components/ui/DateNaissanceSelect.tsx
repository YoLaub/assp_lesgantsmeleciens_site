"use client";

import { useId, useMemo, useState } from "react";

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
 *
 * Le composant conserve un état interne des trois parties : une sélection
 * partielle (ex. jour choisi avant l'année) reste affichée même si la `value`
 * ISO émise est encore vide.
 */

const MOIS = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

interface DateParts {
    y: string;
    m: string;
    d: string;
}

interface DateNaissanceSelectProps {
    value: string; // "AAAA-MM-JJ" ou ""
    onChange: (value: string) => void;
    /** Année la plus ancienne proposée. Par défaut : année courante − 100. */
    minYear?: number;
    disabled?: boolean;
    /** Préfixe des `name`/`id` des menus. */
    name?: string;
}

function parse(value: string): DateParts {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return { y: "", m: "", d: "" };
    return { y: match[1], m: match[2], d: match[3] };
}

/** Nombre de jours dans un mois donné (gère les années bissextiles). */
function daysInMonth(year: number, month: number): number {
    if (!year || !month) return 31;
    return new Date(year, month, 0).getDate();
}

/** Reconstruit l'ISO depuis les trois parties, ou "" si incomplet. */
function toISO({ y, m, d }: DateParts): string {
    return y && m && d ? `${y}-${m}-${d}` : "";
}

export function DateNaissanceSelect({
    value,
    onChange,
    minYear,
    disabled = false,
    name = "date-naissance",
}: DateNaissanceSelectProps) {
    const baseId = useId();
    const [parts, setParts] = useState<DateParts>(() => parse(value));

    // Synchronise l'état interne quand la `value` change de l'extérieur
    // (prefill renouvellement, reset…). Pattern React « ajuster un état pendant
    // le rendu » plutôt qu'un effet : on mémorise la dernière `value` vue. On
    // ignore les passages à "" pour ne pas effacer une saisie partielle en cours
    // (chaque sélection incomplète émet "").
    const [prevValue, setPrevValue] = useState(value);
    if (value !== prevValue) {
        setPrevValue(value);
        if (value && value !== toISO(parts)) {
            setParts(parse(value));
        }
    }

    const currentYear = new Date().getFullYear();
    const firstYear = minYear ?? currentYear - 100;

    const years = useMemo(() => {
        const list: number[] = [];
        for (let year = currentYear; year >= firstYear; year--) list.push(year);
        return list;
    }, [currentYear, firstYear]);

    const nbDays = daysInMonth(Number(parts.y), Number(parts.m));
    const days = useMemo(
        () => Array.from({ length: nbDays }, (_, i) => i + 1),
        [nbDays],
    );

    const update = (next: DateParts) => {
        // On borne le jour si le mois/année réduit le nombre de jours
        // (ex. 31 → 28 en février) pour ne jamais produire une date invalide.
        let day = next.d;
        if (day && next.y && next.m) {
            const max = daysInMonth(Number(next.y), Number(next.m));
            if (Number(day) > max) day = String(max).padStart(2, "0");
        }
        const resolved = { ...next, d: day };
        setParts(resolved);
        onChange(toISO(resolved));
    };

    const selectCls =
        "mt-1 w-full rounded-md border border-gray-300 p-2 bg-white text-gray-900 focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00] disabled:bg-gray-100";

    return (
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Date de naissance">
            <select
                id={`${baseId}-jour`}
                name={`${name}-jour`}
                aria-label="Jour"
                value={parts.d}
                disabled={disabled}
                onChange={(e) => update({ ...parts, d: e.target.value })}
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
                value={parts.m}
                disabled={disabled}
                onChange={(e) => update({ ...parts, m: e.target.value })}
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
                value={parts.y}
                disabled={disabled}
                onChange={(e) => update({ ...parts, y: e.target.value })}
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
