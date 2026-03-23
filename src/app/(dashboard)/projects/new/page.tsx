"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { addProject, generateProjectCode, type ComponentData, type SousComposantData } from "@/lib/projectStore";
import { toast } from "@/lib/toastStore";

// ══════════════════════════════════════
// CAMEROON ADMINISTRATIVE DATA
// ══════════════════════════════════════

const CAMEROON_DATA: Record<string, Record<string, string[]>> = {
    "Région de l'Est": {
        "Lom-et-Djérem": ["Bertoua", "Bélabo", "Garoua-Boulaï", "Diang", "Ngoura"],
        "Kadey": ["Batouri", "Kette", "Ndelele", "Mbang", "Kentzou"],
        "Boumba-et-Ngoko": ["Yokadouma", "Moloundou", "Salapoumbé", "Gari-Gombo"],
        "Haut-Nyong": ["Abong-Mbang", "Doumé", "Lomié", "Messamena", "Mindourou"],
    },
    "Région du Sud": {
        "Mvila": ["Ebolowa", "Ambam", "Biwong-Bane", "Mengong"],
        "Dja-et-Lobo": ["Sangmélima", "Djoum", "Mintom", "Meyomessala", "Bengbis"],
        "Océan": ["Kribi", "Lolodorf", "Akom II", "Campo", "Bipindi"],
        "Vallée-du-Ntem": ["Ambam", "Ma'an", "Olamze", "Kyé-Ossi"],
    },
    "Région du Centre": {
        "Mfoundi": ["Yaoundé"],
        "Lékié": ["Monatélé", "Obala", "Okola", "Sa'a", "Evodoula"],
        "Mefou-et-Afamba": ["Mfou", "Nkolafamba", "Awae", "Edzendouan"],
        "Nyong-et-So'o": ["Mbalmayo", "Ngoumou", "Akoeman"],
        "Mbam-et-Inoubou": ["Bafia", "Kiiki", "Ndikinimeki", "Bokito"],
    },
    "Région du Littoral": {
        "Wouri": ["Douala"],
        "Sanaga-Maritime": ["Édéa", "Dizangué", "Mouanko", "Pouma", "Ndom"],
        "Nkam": ["Yabassi", "Nkondjock", "Yingui", "Nord-Makombé"],
        "Moungo": ["Nkongsamba", "Loum", "Manjo", "Mbanga", "Melong"],
    },
    "Région de l'Ouest": {
        "Mifi": ["Bafoussam"],
        "Menoua": ["Dschang", "Penka-Michel", "Nkong-Ni", "Fongo-Tongo"],
        "Bamboutos": ["Mbouda", "Galim", "Batcham"],
        "Haut-Nkam": ["Bafang", "Bandja", "Bana", "Kekem"],
        "Koung-Khi": ["Bandjoun", "Bayangam", "Poumougne"],
    },
    "Région de l'Adamaoua": {
        "Vina": ["Ngaoundéré", "Belel", "Martap", "Mbé"],
        "Mbere": ["Meiganga", "Dir", "Djohong", "Ngaoui"],
        "Djerem": ["Tibati", "Ngaoundal", "Banyo"],
        "Mayo-Banyo": ["Banyo", "Mayo-Darlé", "Bankim"],
    },
    "Région du Nord": {
        "Bénoué": ["Garoua", "Lagdo", "Pitoa", "Bibémi"],
        "Mayo-Louti": ["Guider", "Figuil", "Mayo-Oulo"],
        "Faro": ["Poli", "Béka"],
        "Mayo-Rey": ["Tcholliré", "Rey-Bouba", "Touboro", "Madingring"],
    },
    "Région de l'Extrême-Nord": {
        "Diamaré": ["Maroua", "Bogo", "Pétté", "Gazawa"],
        "Logone-et-Chari": ["Kousséri", "Goulfey", "Makary", "Blangoua"],
        "Mayo-Danay": ["Yagoua", "Maga", "Vélé", "Kar-Hay"],
        "Mayo-Tsanaga": ["Mokolo", "Koza", "Mora", "Bourha"],
        "Mayo-Sava": ["Mora", "Tokombéré", "Kolofata"],
    },
    "Région du Nord-Ouest": {
        "Mezam": ["Bamenda", "Bali", "Santa", "Tubah"],
        "Bui": ["Kumbo", "Noni", "Jakiri", "Mbiame"],
        "Ngo-Ketunjia": ["Ndop", "Babessi", "Balikumbat"],
        "Donga-Mantung": ["Nkambé", "Ako", "Misaje", "Ndu"],
    },
    "Région du Sud-Ouest": {
        "Fako": ["Buéa", "Limbé", "Tiko", "Muyuka", "Idenau"],
        "Mémé": ["Kumba", "Mbonge", "Konye"],
        "Ndian": ["Mundemba", "Bamusso", "Isanguele", "Ekondo-Titi"],
        "Koupé-Manengouba": ["Bangem", "Tombel", "Nguti"],
    },
};

const REGIONS = Object.keys(CAMEROON_DATA);

// ══════════════════════════════════════
// CITY GPS COORDINATES (approximate)
// ══════════════════════════════════════

const CITY_COORDS: Record<string, [number, number]> = {
    // Est
    "Bertoua": [4.5772, 13.6846], "Bélabo": [4.9333, 13.3000], "Garoua-Boulaï": [5.8917, 14.5500],
    "Diang": [5.1500, 13.2000], "Ngoura": [4.8833, 14.1667], "Batouri": [4.4333, 14.3500],
    "Kette": [4.1667, 14.2000], "Ndelele": [4.0500, 14.9167], "Mbang": [4.5833, 13.7333],
    "Kentzou": [4.1500, 14.5500], "Yokadouma": [3.5167, 15.0500], "Moloundou": [2.0500, 15.2167],
    "Salapoumbé": [2.8667, 14.9000], "Gari-Gombo": [3.4667, 15.0667], "Abong-Mbang": [3.9833, 13.1833],
    "Doumé": [4.2333, 13.4500], "Lomié": [3.1583, 13.6167], "Messamena": [3.6333, 12.8500],
    "Mindourou": [3.5833, 14.0833],
    // Sud
    "Ebolowa": [2.9000, 11.1500], "Ambam": [2.3833, 11.2833], "Biwong-Bane": [2.8667, 11.0333],
    "Mengong": [2.7167, 11.0333], "Sangmélima": [2.9333, 11.9833], "Djoum": [2.6667, 12.6667],
    "Mintom": [2.4167, 13.2667], "Meyomessala": [3.1000, 11.7500], "Bengbis": [3.1667, 12.1833],
    "Kribi": [2.9500, 9.9167], "Lolodorf": [3.2333, 10.7333], "Akom II": [2.7833, 10.5667],
    "Campo": [2.3667, 9.8333], "Bipindi": [3.0833, 10.4000],
    "Ma'an": [2.3833, 10.6167], "Olamze": [2.1000, 11.4000], "Kyé-Ossi": [2.1833, 11.3333],
    // Centre
    "Yaoundé": [3.8480, 11.5021], "Monatélé": [4.2500, 11.2000], "Obala": [4.1667, 11.5333],
    "Okola": [4.0167, 11.3833], "Sa'a": [4.3667, 11.4500], "Evodoula": [4.0833, 11.2000],
    "Mfou": [3.7167, 11.6333], "Nkolafamba": [3.7000, 11.6667], "Awae": [3.6500, 11.6833],
    "Edzendouan": [3.6500, 11.5500], "Mbalmayo": [3.5167, 11.5000], "Ngoumou": [3.6500, 11.3667],
    "Akoeman": [3.4667, 11.3667], "Bafia": [4.7500, 11.2333], "Kiiki": [4.7000, 11.0000],
    "Ndikinimeki": [4.7667, 10.8333], "Bokito": [4.5667, 11.1167],
    // Littoral
    "Douala": [4.0511, 9.7679], "Édéa": [3.8000, 10.1333], "Dizangué": [3.7667, 9.9833],
    "Mouanko": [3.6167, 9.7833], "Pouma": [3.9167, 10.5667], "Ndom": [4.0000, 10.5500],
    "Yabassi": [4.4500, 9.9667], "Nkondjock": [4.7500, 9.9500], "Yingui": [4.6333, 9.8833],
    "Nord-Makombé": [4.6833, 9.9333], "Nkongsamba": [4.9500, 9.9333], "Loum": [4.7167, 9.7333],
    "Manjo": [4.8333, 9.8167], "Mbanga": [4.5000, 9.5667], "Melong": [5.1167, 9.9667],
    // Ouest
    "Bafoussam": [5.4737, 10.4176], "Dschang": [5.4500, 10.0667], "Penka-Michel": [5.5333, 10.0500],
    "Nkong-Ni": [5.5667, 10.1167], "Fongo-Tongo": [5.5000, 10.0000], "Mbouda": [5.6333, 10.2500],
    "Galim": [5.6667, 10.4000], "Batcham": [5.6167, 10.2833], "Bafang": [5.1500, 10.1833],
    "Bandja": [5.1500, 10.3667], "Bana": [5.1500, 10.0667], "Kekem": [5.2000, 9.8667],
    "Bandjoun": [5.3833, 10.4167], "Bayangam": [5.3333, 10.3500], "Poumougne": [5.3500, 10.3000],
    // Adamaoua
    "Ngaoundéré": [7.3167, 13.5833], "Belel": [7.0667, 14.4667], "Martap": [7.3333, 13.7333],
    "Mbé": [7.8500, 13.6000], "Meiganga": [6.5167, 14.2833], "Dir": [6.4000, 14.0667],
    "Djohong": [6.8333, 14.7000], "Ngaoui": [6.4833, 15.3167], "Tibati": [6.4667, 12.6333],
    "Ngaoundal": [6.4833, 13.2667], "Banyo": [6.7500, 11.8167], "Mayo-Darlé": [6.5833, 11.5333],
    "Bankim": [6.0833, 11.4667],
    // Nord
    "Garoua": [9.3000, 13.4000], "Lagdo": [9.0500, 13.6667], "Pitoa": [9.3833, 13.5000],
    "Bibémi": [9.3167, 13.8667], "Guider": [9.9333, 13.9500], "Figuil": [9.7667, 13.9667],
    "Mayo-Oulo": [9.7667, 13.7333], "Poli": [8.4833, 13.2333], "Béka": [8.0167, 12.9167],
    "Tcholliré": [8.4000, 14.1667], "Rey-Bouba": [8.6667, 14.1833], "Touboro": [7.7833, 15.3500],
    "Madingring": [7.5833, 14.8167],
    // Extrême-Nord
    "Maroua": [10.5958, 14.3159], "Bogo": [10.7333, 14.6000], "Pétté": [10.4833, 14.4333],
    "Gazawa": [10.5167, 14.2167], "Kousséri": [12.0833, 15.0333], "Goulfey": [12.3833, 14.9167],
    "Makary": [12.5667, 14.4667], "Blangoua": [12.6333, 14.5500], "Yagoua": [10.3500, 15.2333],
    "Maga": [10.8333, 14.9500], "Vélé": [10.2500, 15.1500], "Kar-Hay": [10.5000, 14.9833],
    "Mokolo": [10.7333, 13.8000], "Koza": [10.8833, 13.8833], "Mora": [11.0500, 14.1500],
    "Bourha": [10.3833, 13.6833], "Tokombéré": [10.8667, 14.1833], "Kolofata": [11.1667, 14.0833],
    // Nord-Ouest
    "Bamenda": [5.9631, 10.1591], "Bali": [5.8833, 10.0167], "Santa": [5.7833, 10.1500],
    "Tubah": [5.9500, 10.2000], "Kumbo": [6.2000, 10.6833], "Noni": [6.1667, 10.8000],
    "Jakiri": [6.1000, 10.6500], "Mbiame": [6.2667, 10.8500], "Ndop": [5.9667, 10.4167],
    "Babessi": [6.0333, 10.4833], "Balikumbat": [5.9500, 10.3667], "Nkambé": [6.6167, 10.6667],
    "Ako": [6.8000, 10.9167], "Misaje": [6.4833, 10.9667], "Ndu": [6.3833, 10.7500],
    // Sud-Ouest
    "Buéa": [4.1560, 9.2632], "Limbé": [4.0204, 9.2072], "Tiko": [4.0750, 9.3500],
    "Muyuka": [4.2833, 9.4167], "Idenau": [4.2167, 8.9833], "Kumba": [4.6333, 9.4333],
    "Mbonge": [4.5333, 9.1667], "Konye": [4.9500, 9.4833], "Mundemba": [4.9500, 8.8833],
    "Bamusso": [4.4167, 8.9000], "Isanguele": [4.7667, 8.5667], "Ekondo-Titi": [4.9667, 9.1833],
    "Bangem": [5.1500, 9.6833], "Tombel": [4.7500, 9.6667], "Nguti": [5.3333, 9.4167],
};

// ══════════════════════════════════════
// COMBOBOX COMPONENT
// ══════════════════════════════════════

function ComboBox({ label, placeholder, options, value, onChange, disabled = false, required = false }: {
    label: string; placeholder: string; options: string[]; value: string;
    onChange: (val: string) => void; disabled?: boolean; required?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="relative">
            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className={`relative ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
                <input
                    type="text"
                    value={query || value}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); onChange(""); }}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all pr-8"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </div>

            {open && filtered.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] max-h-48 overflow-y-auto">
                    {filtered.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => { onChange(opt); setQuery(""); setOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-[var(--bg-surface-hover)] transition-colors ${opt === value ? "text-[var(--accent)] font-semibold bg-[var(--accent-subtle)]" : "text-[var(--text-primary)]"
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {open && <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setQuery(""); }} />}
        </div>
    );
}

// ══════════════════════════════════════
// LOCALISATION STEP
// ══════════════════════════════════════

function LocalisationStep({ region, setRegion, departement, setDepartement, ville, setVille, localite, setLocalite, lat, setLat, lng, setLng, autoDetected, setAutoDetected }: {
    region: string; setRegion: (v: string) => void; departement: string; setDepartement: (v: string) => void;
    ville: string; setVille: (v: string) => void; localite: string; setLocalite: (v: string) => void;
    lat: string; setLat: (v: string) => void; lng: string; setLng: (v: string) => void;
    autoDetected: boolean; setAutoDetected: (v: boolean) => void;
}) {
    // GPS and cascading handled via props

    const departements = region ? Object.keys(CAMEROON_DATA[region] || {}) : [];
    const villes = region && departement ? (CAMEROON_DATA[region]?.[departement] || []) : [];

    const handleVilleChange = (val: string) => {
        setVille(val);
        // Auto-fill GPS from lookup
        const coords = CITY_COORDS[val];
        if (coords) {
            setLat(coords[0].toFixed(4));
            setLng(coords[1].toFixed(4));
            setAutoDetected(true);
        } else {
            setLat("");
            setLng("");
            setAutoDetected(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Info */}
            <div className="flex gap-3 p-3 rounded-[var(--radius-md)] bg-blue-500/10 border border-blue-500/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 flex-shrink-0 mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                    Localisez votre projet en sélectionnant la région, le département et la ville. Les coordonnées GPS seront <strong>détectées automatiquement</strong>.
                </p>
            </div>

            {/* Cascading selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ComboBox
                    label="Région"
                    placeholder="Sélectionner une région..."
                    options={REGIONS}
                    value={region}
                    onChange={(val) => { setRegion(val); setDepartement(""); setVille(""); setLat(""); setLng(""); setAutoDetected(false); }}
                    required
                />
                <ComboBox
                    label="Département"
                    placeholder={region ? "Choisir le département..." : "Sélectionnez d'abord une région"}
                    options={departements}
                    value={departement}
                    onChange={(val) => { setDepartement(val); setVille(""); setLat(""); setLng(""); setAutoDetected(false); }}
                    disabled={!region}
                    required
                />
                <ComboBox
                    label="Ville / Arrondissement"
                    placeholder={departement ? "Choisir la ville..." : "Sélectionnez d'abord un département"}
                    options={villes}
                    value={ville}
                    onChange={handleVilleChange}
                    disabled={!departement}
                    required
                />
            </div>

            {/* Localité précise */}
            <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Localité précise</label>
                <input
                    type="text"
                    value={localite}
                    onChange={(e) => setLocalite(e.target.value)}
                    placeholder="ex: Rive droite du fleuve Sanaga, PK 42..."
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all"
                />
            </div>

            {/* GPS Coordinates */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Coordonnées GPS</label>
                    {autoDetected ? (
                        <span className="text-[10px] text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full font-bold border border-green-500/20 flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                            Auto-détecté
                        </span>
                    ) : (
                        <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-inset)] px-2 py-0.5 rounded-full font-medium border border-[var(--border-default)]">Sélectionnez une ville</span>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <input
                            type="text"
                            value={lat}
                            onChange={(e) => { setLat(e.target.value); setAutoDetected(false); }}
                            placeholder="Latitude (ex: 5.5321)"
                            className={`w-full border rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all ${autoDetected
                                ? "bg-green-500/5 border-green-500/30 text-[var(--text-primary)]"
                                : "bg-[var(--bg-inset)] border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                                }`}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            value={lng}
                            onChange={(e) => { setLng(e.target.value); setAutoDetected(false); }}
                            placeholder="Longitude (ex: 13.6163)"
                            className={`w-full border rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all ${autoDetected
                                ? "bg-green-500/5 border-green-500/30 text-[var(--text-primary)]"
                                : "bg-[var(--bg-inset)] border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                                }`}
                        />
                    </div>
                </div>
                {autoDetected && (
                    <p className="text-[10px] text-green-600 mt-1.5 flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                        Position approximative de {ville}. Vous pouvez ajuster manuellement si nécessaire.
                    </p>
                )}
            </div>

            {/* Preview with mini-map */}
            {lat && lng && (
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] overflow-hidden shadow-[var(--shadow-sm)]">
                    {/* Static map tile */}
                    <div className="relative h-40 bg-[var(--bg-inset)]">
                        <img
                            src={`https://static-maps.yandex.ru/v1?lang=fr_FR&ll=${lng},${lat}&z=10&size=650,200&l=map&pt=${lng},${lat},pm2rdl`}
                            alt="Carte"
                            className="w-full h-full object-cover opacity-90"
                            onError={(e) => {
                                // Fallback: show OpenStreetMap embed
                                const target = e.currentTarget;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                    const iframe = document.createElement("iframe");
                                    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(lng) - 0.5},${parseFloat(lat) - 0.3},${parseFloat(lng) + 0.5},${parseFloat(lat) + 0.3}&layer=mapnik&marker=${lat},${lng}`;
                                    iframe.className = "w-full h-full border-0";
                                    parent.appendChild(iframe);
                                }
                            }}
                        />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-[var(--radius-sm)]">
                            📍 Aperçu
                        </div>
                    </div>
                    {/* Info bar */}
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-surface)]">
                        <span className="text-[12px] text-[var(--text-secondary)]">
                            📍 <strong className="text-[var(--text-primary)]">{[ville, departement, region].filter(Boolean).join(", ")}</strong>
                            {localite && <span className="text-[var(--text-tertiary)]"> — {localite}</span>}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-inset)] px-2 py-0.5 rounded-[var(--radius-sm)]">
                            {lat}°N, {lng}°E
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════
// STEPS
// ══════════════════════════════════════


const steps = [
    { id: 1, name: "Informations" },
    { id: 2, name: "Localisation" },
    { id: 3, name: "Structure" },
    { id: 4, name: "Résumé" },
];

// ══════════════════════════════════════
// PAGE
// ══════════════════════════════════════

export default function NewProjectPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [projectCode] = useState(generateProjectCode());

    // Step 1 state
    const [titre, setTitre] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [capacite, setCapacite] = useState("");
    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");
    const [financement, setFinancement] = useState<string[]>([]);
    const [bailleur, setBailleur] = useState("Banque Mondiale");

    // Step 2 state (lifted from LocalisationStep)
    const [region, setRegion] = useState("");
    const [departement, setDepartement] = useState("");
    const [ville, setVille] = useState("");
    const [localite, setLocalite] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [autoDetected, setAutoDetected] = useState(false);

    // Step 3 state (structure)
    const [components, setComponents] = useState<ComponentData[]>([
        { id: "c1", name: "Barrage", sousComposants: [{ id: "sc1", name: "Fondations", activities: ["Fouilles", "Béton de propreté"] }] },
    ]);

    const addComponent = () => {
        setComponents(prev => [...prev, { id: `c${Date.now()}`, name: "", sousComposants: [] }]);
    };
    const removeComponent = (idx: number) => {
        setComponents(prev => prev.filter((_, i) => i !== idx));
    };
    const updateComponentName = (idx: number, name: string) => {
        setComponents(prev => prev.map((c, i) => i === idx ? { ...c, name } : c));
    };
    const addSousComposant = (compIdx: number) => {
        setComponents(prev => prev.map((c, i) => i === compIdx ? { ...c, sousComposants: [...c.sousComposants, { id: `sc${Date.now()}`, name: "", activities: [] }] } : c));
    };
    const removeSousComposant = (compIdx: number, scIdx: number) => {
        setComponents(prev => prev.map((c, ci) => ci === compIdx ? { ...c, sousComposants: c.sousComposants.filter((_, si) => si !== scIdx) } : c));
    };
    const updateSCName = (compIdx: number, scIdx: number, name: string) => {
        setComponents(prev => prev.map((c, ci) => ci === compIdx ? { ...c, sousComposants: c.sousComposants.map((sc, si) => si === scIdx ? { ...sc, name } : sc) } : c));
    };
    const addActivity = (compIdx: number, scIdx: number) => {
        setComponents(prev => prev.map((c, ci) => ci === compIdx ? { ...c, sousComposants: c.sousComposants.map((sc, si) => si === scIdx ? { ...sc, activities: [...sc.activities, ""] } : sc) } : c));
    };
    const updateActivity = (compIdx: number, scIdx: number, actIdx: number, val: string) => {
        setComponents(prev => prev.map((c, ci) => ci === compIdx ? { ...c, sousComposants: c.sousComposants.map((sc, si) => si === scIdx ? { ...sc, activities: sc.activities.map((a, ai) => ai === actIdx ? val : a) } : sc) } : c));
    };
    const removeActivity = (compIdx: number, scIdx: number, actIdx: number) => {
        setComponents(prev => prev.map((c, ci) => ci === compIdx ? { ...c, sousComposants: c.sousComposants.map((sc, si) => si === scIdx ? { ...sc, activities: sc.activities.filter((_, ai) => ai !== actIdx) } : sc) } : c));
    };

    const toggleFinancement = (label: string) => {
        setFinancement(prev => prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]);
    };

    const totalActivities = components.reduce((sum, c) => sum + c.sousComposants.reduce((s, sc) => s + sc.activities.length, 0), 0);
    const totalSC = components.reduce((sum, c) => sum + c.sousComposants.length, 0);

    const formatBudget = (val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) return val + " FCFA";
        if (num >= 1e9) return (num / 1e9).toFixed(0) + " Mrd FCFA";
        if (num >= 1e6) return (num / 1e6).toFixed(0) + " M FCFA";
        return num.toLocaleString() + " FCFA";
    };

    const handleCreate = () => {
        addProject({
            id: projectCode, name: titre || "Nouveau Projet", code: projectCode,
            description: description || "Projet d'infrastructure",
            region, departement, ville, budget: formatBudget(budget),
            capacite: capacite ? capacite + " MW" : "", dateDebut, dateFin,
            financement, bailleur, progress: 0, alerts: 0,
            components, createdAt: new Date().toISOString().split("T")[0],
        });
        toast.success("Projet créé avec succès. Redirection...");
        setTimeout(() => router.push(`/projects/${projectCode}`), 1500);
    };

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
        else handleCreate();
    };
    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <div className="px-[var(--page-px)] py-[var(--page-py)] min-h-full max-w-4xl mx-auto relative">
            {/* ── Header ── */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <Link href="/projects" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                        Nouveau Projet
                    </h1>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium ml-[30px]">
                    Créez un nouveau projet en suivant les étapes ci-dessous
                </p>
            </div>

            {/* ── Stepper ── */}
            <div className="flex items-center justify-between mb-8 px-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                        {/* Step circle + label */}
                        <div className="flex flex-col items-center relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all duration-300
                                ${step.id < currentStep
                                    ? "bg-green-500 border-green-500 text-white"
                                    : step.id === currentStep
                                        ? "bg-[var(--text-primary)] border-[var(--text-primary)] text-[var(--text-inverted)]"
                                        : "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-tertiary)]"
                                }`}
                            >
                                {step.id < currentStep ? <Check size={14} /> : step.id}
                            </div>
                            <span className={`mt-2 text-[11px] font-semibold whitespace-nowrap transition-colors
                                ${step.id === currentStep
                                    ? "text-[var(--text-primary)]"
                                    : step.id < currentStep
                                        ? "text-green-500"
                                        : "text-[var(--text-tertiary)]"
                                }`}
                            >
                                {step.name}
                            </span>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-3 mt-[-20px]">
                                <div className={`h-[2px] rounded-full transition-colors duration-300
                                    ${step.id < currentStep ? "bg-green-500" : "bg-[var(--border-default)]"}`}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Content Card ── */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)] mb-6">

                {/* Step 1: Informations */}
                {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Titre du projet <span className="text-red-500">*</span></label>
                            <input type="text" value={titre} onChange={e => setTitre(e.target.value)} placeholder="ex: Barrage de Lom Pangar" className="w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Code du projet</label>
                            <div className="flex items-center gap-2">
                                <input type="text" value={projectCode} readOnly className="flex-1 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] text-[var(--text-tertiary)] cursor-not-allowed opacity-60" />
                                <span className="bg-[var(--accent-subtle)] text-[var(--accent)] text-[10px] px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--accent)]/20 font-bold">Auto</span>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Description</label>
                            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez le projet..." className="w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all resize-none" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Budget (FCFA) <span className="text-red-500">*</span></label>
                            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="ex: 420000000000" className="w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Capacité (MW)</label>
                            <input type="number" value={capacite} onChange={e => setCapacite(e.target.value)} placeholder="ex: 30" className="w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Date début <span className="text-red-500">*</span></label>
                            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Date fin prévue <span className="text-red-500">*</span></label>
                            <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Source de financement</label>
                            <div className="flex gap-6">
                                {["Budget National", "Bailleur", "PPP"].map((label) => (
                                    <label key={label} className="flex items-center gap-2 text-[13px] text-[var(--text-primary)] cursor-pointer hover:text-[var(--accent)] transition-colors font-medium">
                                        <input type="checkbox" checked={financement.includes(label)} onChange={() => toggleFinancement(label)} className="w-4 h-4 rounded-[var(--radius-sm)] border-[var(--border-default)] bg-[var(--bg-inset)] accent-[var(--accent)]" />
                                        {label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Bailleur</label>
                            <select value={bailleur} onChange={e => setBailleur(e.target.value)} className="w-full bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all cursor-pointer">
                                <option>Banque Mondiale</option><option>BAD</option><option>BDEAC</option><option>Eximbank China</option><option>AFD</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 2: Localisation */}
                {currentStep === 2 && <LocalisationStep region={region} setRegion={setRegion} departement={departement} setDepartement={setDepartement} ville={ville} setVille={setVille} localite={localite} setLocalite={setLocalite} lat={lat} setLat={setLat} lng={lng} setLng={setLng} autoDetected={autoDetected} setAutoDetected={setAutoDetected} />}

                {/* Step 3: Structure */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="flex gap-3 p-3 rounded-[var(--radius-md)] bg-blue-500/10 border border-blue-500/20">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 flex-shrink-0 mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            <div className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                                <p>Définissez l&apos;arborescence physique du projet. <strong>{components.length}</strong> composant{components.length > 1 ? "s" : ""}, <strong>{totalSC}</strong> sous-composant{totalSC > 1 ? "s" : ""}, <strong>{totalActivities}</strong> activité{totalActivities > 1 ? "s" : ""}.</p>
                            </div>
                        </div>
                        <div className="bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-4 space-y-3">
                            {components.map((comp, ci) => (
                                <div key={comp.id} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-5 h-5 bg-blue-500/10 text-blue-500 rounded flex items-center justify-center font-bold text-[10px]">C</div>
                                        <input type="text" value={comp.name} onChange={e => updateComponentName(ci, e.target.value)} placeholder="Nom du composant..." className="flex-1 bg-transparent border-b border-transparent hover:border-[var(--border-default)] focus:border-[var(--accent)] outline-none text-[13px] font-bold text-[var(--text-primary)] px-1 py-0.5 transition-colors" />
                                        <button onClick={() => removeComponent(ci)} className="text-[var(--text-tertiary)] hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="ml-7 pl-3 border-l-2 border-[var(--border-subtle)] space-y-2">
                                        {comp.sousComposants.map((sc, si) => (
                                            <div key={sc.id}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-4 h-4 bg-amber-500/10 text-amber-500 rounded flex items-center justify-center font-bold text-[9px]">SC</div>
                                                    <input type="text" value={sc.name} onChange={e => updateSCName(ci, si, e.target.value)} placeholder="Sous-composant..." className="flex-1 bg-transparent border-b border-transparent hover:border-[var(--border-default)] focus:border-[var(--accent)] outline-none text-[12px] font-semibold text-[var(--text-secondary)] px-1 py-0.5 transition-colors" />
                                                    <button onClick={() => removeSousComposant(ci, si)} className="text-[var(--text-tertiary)] hover:text-red-500"><Trash2 size={12} /></button>
                                                </div>
                                                <div className="ml-5 pl-3 border-l border-[var(--border-subtle)] space-y-1">
                                                    {sc.activities.map((act, ai) => (
                                                        <div key={ai} className="flex items-center gap-2">
                                                            <div className="w-3 h-3 bg-purple-500/10 rounded-full flex-shrink-0" />
                                                            <input type="text" value={act} onChange={e => updateActivity(ci, si, ai, e.target.value)} placeholder="Activité..." className="flex-1 bg-[var(--bg-inset)] border border-[var(--border-default)] rounded-[var(--radius-sm)] outline-none text-[11px] text-[var(--text-secondary)] px-2 py-1 focus:border-[var(--accent)] transition-colors" />
                                                            <button onClick={() => removeActivity(ci, si, ai)} className="text-[var(--text-tertiary)] hover:text-red-500"><Trash2 size={10} /></button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addActivity(ci, si)} className="flex items-center gap-1 text-[10px] font-medium text-[var(--accent)] hover:underline mt-1 py-1"><Plus size={10} /> Ajouter une activité</button>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addSousComposant(ci)} className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mt-2 pt-1"><Plus size={12} /> Ajouter un sous-composant</button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={addComponent} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[var(--border-default)] rounded-[var(--radius-md)] text-[12px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-all">
                                <Plus size={14} /> Ajouter un composant
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Summary */}
                {currentStep === 4 && (
                    <div className="text-center py-12">
                        <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                            <Check size={24} className="text-green-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Projet prêt à être créé</h3>
                        <p className="text-[11px] text-[var(--text-tertiary)] max-w-xs mx-auto">Vérifiez les informations puis cliquez sur &quot;Créer le projet&quot;.</p>
                        <div className="grid grid-cols-2 gap-3 mt-8 text-left max-w-lg mx-auto">
                            <div className="bg-[var(--bg-inset)] rounded-[var(--radius-md)] p-3 border border-[var(--border-default)]">
                                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Nom</div>
                                <div className="text-[13px] font-semibold text-[var(--text-primary)]">{titre || "—"}</div>
                            </div>
                            <div className="bg-[var(--bg-inset)] rounded-[var(--radius-md)] p-3 border border-[var(--border-default)]">
                                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Code</div>
                                <div className="text-[13px] font-semibold text-[var(--text-primary)]">{projectCode}</div>
                            </div>
                            <div className="bg-[var(--bg-inset)] rounded-[var(--radius-md)] p-3 border border-[var(--border-default)]">
                                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Localisation</div>
                                <div className="text-[13px] font-semibold text-[var(--text-primary)]">{ville || region || "—"}</div>
                            </div>
                            <div className="bg-[var(--bg-inset)] rounded-[var(--radius-md)] p-3 border border-[var(--border-default)]">
                                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Budget</div>
                                <div className="text-[13px] font-semibold text-[var(--text-primary)]">{budget ? formatBudget(budget) : "—"}</div>
                            </div>
                            <div className="bg-[var(--bg-inset)] rounded-[var(--radius-md)] p-3 border border-[var(--border-default)]">
                                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Financement</div>
                                <div className="text-[13px] font-semibold text-[var(--text-primary)]">{financement.length > 0 ? financement.join(", ") : bailleur}</div>
                            </div>
                            <div className="bg-[var(--bg-inset)] rounded-[var(--radius-md)] p-3 border border-[var(--border-default)]">
                                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Structure</div>
                                <div className="text-[13px] font-semibold text-[var(--text-primary)]">{components.length} Comp. <span className="text-[11px] text-[var(--text-tertiary)] font-normal">({totalSC} SC, {totalActivities} Act)</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Footer Actions ── */}
            <div className="flex justify-between items-center">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] border border-[var(--border-default)] text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <ArrowLeft size={14} />
                    Précédent
                </button>

                <div className="flex items-center gap-3">
                    <Link href="/projects" className="px-5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                        Annuler
                    </Link>
                    <button
                        onClick={handleNext}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-semibold shadow-[var(--shadow-sm)] transition-all ${currentStep === 4 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-[var(--text-primary)] text-[var(--text-inverted)] hover:opacity-90"}`}
                    >
                        {currentStep === 4 ? "✓ Créer le projet" : "Suivant"}
                        {currentStep < 4 && <ArrowRight size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
