"use client";

import { useEffect, useRef, useState } from "react";

export interface AdresseSelection {
  adresse: string;
  codePostal: string;
  codeInsee: string;
  communeNom: string;
}

interface BanFeature {
  properties: { name: string; postcode: string; citycode: string; city: string; label: string };
}

export default function AdresseAutocomplete({
  defaultValue = "",
  onSelect,
}: {
  defaultValue?: string;
  onSelect: (sel: AdresseSelection) => void;
}) {
  const [query, setQuery] = useState(defaultValue);
  const [features, setFeatures] = useState<BanFeature[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.trim().length < 4) {
      setFeatures([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=housenumber&limit=5`;
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        setFeatures(json.features ?? []);
        setOpen(true);
      } catch {
        setFeatures([]);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (f: BanFeature) => {
    const p = f.properties;
    setQuery(p.label);
    setOpen(false);
    onSelect({ adresse: p.name, codePostal: p.postcode, codeInsee: p.citycode, communeNom: p.city });
  };

  const inputCls = "mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00]";

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => features.length > 0 && setOpen(true)}
        placeholder="Commencez à taper votre adresse…"
        className={inputCls}
        autoComplete="off"
      />
      {open && features.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {features.map((f, i) => (
            <li key={`${f.properties.label}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(f)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                {f.properties.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
