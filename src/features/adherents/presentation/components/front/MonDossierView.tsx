"use client";

import { useEffect, useRef, useState } from "react";
import {
    getMonDossierAction,
    requestAccesDossierAction,
    createCheckoutAction,
    soumettreQuestionnaireAction,
    signerReglementAction,
    setTypePaiementAction,
    patchAutorisationSortieAction,
    updateTelephoneAction,
    updateDroitImageAction,
    validerEngagementAction,
    uploadDocumentAdherentAction,
} from "@/features/adherents/actions/mon-dossier.actions";
import { getReglementAction } from "@/features/adherents/actions/reglement.actions";
import HCaptcha from "@hcaptcha/react-hcaptcha";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatutDocument = "non_fourni" | "declare" | "valide";

interface Questionnaire {
    q1: boolean; q2: boolean; q3: boolean; q4: boolean; q5: boolean;
    q6: boolean; q7: boolean; q8: boolean; q9: boolean;
}

interface DocumentData {
    id: string;
    type: string;
    url: string;
    name: string | null;
}

interface DossierData {
    id: number;
    numeroAdherent: string;
    nom: string;
    prenom: string;
    email: string;
    categorie: string;
    dateDeNaissance: Date;
    telephone1: string | null;
    telephone2: string | null;
    oxygene: boolean;
    documents: DocumentData[];
    reglementSigne: StatutDocument;
    certificatMedical: StatutDocument;
    certificatMedicalReq: boolean;
    autorisationParentale: StatutDocument;
    couponSport: StatutDocument;
    bonCaf: StatutDocument;
    droitImage: boolean;
    engagementPrisConnaissance: boolean;
    montantSnapshot: number | null;
    typePaiement: string | null;
    inscriptionValide: boolean;
    stripeSessionId: string | null;
    questionnaire: Questionnaire | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isMineur(dateDeNaissance: Date | string): boolean {
    const d = new Date(dateDeNaissance);
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age < 18;
}

function StatutBadge({ statut }: { statut: StatutDocument }) {
    const styles: Record<StatutDocument, string> = {
        non_fourni: "bg-gray-100 text-gray-600",
        declare: "bg-orange-100 text-orange-700",
        valide: "bg-green-100 text-green-700",
    };
    const labels: Record<StatutDocument, string> = {
        non_fourni: "Non fourni",
        declare: "Déclaré — en attente de validation",
        valide: "Validé",
    };
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[statut]}`}>{labels[statut]}</span>;
}

// ─── Étape 1 — Identification ─────────────────────────────────────────────────

function IdentificationForm() {
    const hcaptchaRef = useRef<HCaptcha>(null);
    const [email, setEmail] = useState("");
    const [numeroAdherent, setNumeroAdherent] = useState("");
    const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hcaptchaToken) { setError("Veuillez compléter le captcha."); return; }
        setSubmitting(true);
        setError(null);

        const result = await requestAccesDossierAction({ email, numeroAdherent, hcaptchaToken });

        hcaptchaRef.current?.resetCaptcha();
        setHcaptchaToken(null);
        setSubmitting(false);

        if (result.success) {
            setSubmitted(true);
        } else {
            setError(result.error ?? "Erreur");
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-700 font-medium">
                    Si ces informations correspondent à un dossier, un email vient d'être envoyé.
                </p>
            </div>
        );
    }

    const inputCls = "mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00]";

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Accéder à mon dossier</h2>
            <div>
                <label htmlFor="email-dossier" className="block text-sm font-medium text-gray-700">Email</label>
                <input id="email-dossier" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
                <label htmlFor="numero-dossier" className="block text-sm font-medium text-gray-700">Numéro d'adhérent</label>
                <input
                    id="numero-dossier"
                    required
                    value={numeroAdherent}
                    onChange={(e) => setNumeroAdherent(e.target.value.toUpperCase())}
                    placeholder="ex. ADH-X7K2P"
                    className={inputCls}
                />
            </div>
            <div className="flex justify-center">
                <HCaptcha
                    ref={hcaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY ?? "10000000-ffff-ffff-ffff-000000000001"}
                    onVerify={(t) => setHcaptchaToken(t)}
                    onExpire={() => setHcaptchaToken(null)}
                />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <button
                type="submit"
                disabled={submitting || !hcaptchaToken}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
            >
                {submitting ? "Envoi..." : "Recevoir mon lien d'accès"}
            </button>
        </form>
    );
}

// ─── Section Questionnaire santé ──────────────────────────────────────────────

function QuestionnaireSection({
    token,
    onDone,
    questions,
}: {
    token: string;
    onDone: (certificatReq: boolean) => void;
    questions: { code: string; label: string }[];
}) {
    const [reponses, setReponses] = useState<Partial<Record<keyof Questionnaire, boolean>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toutesRepondues = questions.every(({ code }) => reponses[code as keyof Questionnaire] !== undefined);
    const certificatRequis = questions.some(({ code }) => reponses[code as keyof Questionnaire] === true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!toutesRepondues) return;
        setSubmitting(true);
        setError(null);

        const result = await soumettreQuestionnaireAction(token, reponses as Questionnaire);
        setSubmitting(false);

        if (result.success) {
            onDone(result.certificatMedicalReq ?? false);
        } else {
            setError(result.error ?? "Erreur");
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Questionnaire de santé QS-Sport</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Cerfa 15699-01 — détermine si un certificat médical est nécessaire.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {questions.map(({ code, label }) => (
                    <div key={code} className="space-y-1">
                        <p className="text-sm text-gray-800">{label}</p>
                        <div className="flex gap-6">
                            {(["true", "false"] as const).map((val) => (
                                <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name={code}
                                        value={val}
                                        checked={reponses[code as keyof Questionnaire] === (val === "true")}
                                        onChange={() => setReponses((r) => ({ ...r, [code]: val === "true" }))}
                                        className="text-[#FF8A00] focus:ring-[#FF8A00]"
                                    />
                                    {val === "true" ? "OUI" : "NON"}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                {toutesRepondues && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${certificatRequis ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                        {certificatRequis
                            ? "⚠️ Un certificat médical est obligatoire. Consultez un médecin et apportez-le au club."
                            : "✓ Aucun certificat médical requis."}
                    </div>
                )}

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={!toutesRepondues || submitting}
                    className="w-full bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                >
                    {submitting ? "Enregistrement..." : "Valider le questionnaire"}
                </button>
            </form>
        </div>
    );
}

// ─── Section Règlement intérieur ──────────────────────────────────────────────

function ReglementSection({ token, onDone }: { token: string; onDone: () => void }) {
    const [checked, setChecked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contenu, setContenu] = useState<string | null>(null);

    useEffect(() => {
        getReglementAction().then((r) => setContenu(r.contenu));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checked) return;
        setSubmitting(true);
        setError(null);

        const result = await signerReglementAction(token);
        setSubmitting(false);

        if (result.success) {
            onDone();
        } else {
            setError(result.error ?? "Erreur");
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Règlement intérieur</h3>

            {contenu ? (
                <div
                    className="prose prose-sm max-w-none max-h-72 overflow-y-auto border border-gray-100 rounded-lg p-4 bg-gray-50 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: contenu }}
                />
            ) : (
                <p className="text-sm text-gray-400 italic">Chargement du règlement…</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="mt-0.5 text-[#FF8A00] focus:ring-[#FF8A00]"
                    />
                    <span className="text-sm text-gray-700">
                        J'ai lu et j'accepte le règlement intérieur du club.{" "}
                        <span className="text-red-500">*</span>
                    </span>
                </label>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={!checked || submitting}
                    className="w-full bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                >
                    {submitting ? "Enregistrement..." : "Confirmer"}
                </button>
            </form>
        </div>
    );
}

// ─── Section Type de paiement ─────────────────────────────────────────────────

function TypePaiementSection({ token, onDone }: { token: string; onDone: (type: string) => void }) {
    const [choix, setChoix] = useState<"sur_place" | "en_ligne" | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!choix) return;
        setSubmitting(true);
        setError(null);

        const result = await setTypePaiementAction(token, choix);
        setSubmitting(false);

        if (result.success) {
            onDone(choix);
        } else {
            setError(result.error ?? "Erreur");
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Mode de paiement</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                {(["sur_place", "en_ligne"] as const).map((val) => (
                    <label key={val} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 gap-3">
                        <input
                            type="radio"
                            name="typePaiement"
                            value={val}
                            checked={choix === val}
                            onChange={() => setChoix(val)}
                            className="text-[#FF8A00] focus:ring-[#FF8A00]"
                        />
                        <span className="text-sm font-medium text-gray-900">
                            {val === "sur_place" ? "Sur place (chèque / espèces)" : "En ligne (carte bancaire via Stripe)"}
                        </span>
                    </label>
                ))}
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={!choix || submitting}
                    className="w-full bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                >
                    {submitting ? "Enregistrement..." : "Confirmer"}
                </button>
            </form>
        </div>
    );
}

// ─── Section Certificat médical (B3) ─────────────────────────────────────────

function CertificatSection({ token, onDone }: { token: string; onDone: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        setError(null);

        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadDocumentAdherentAction(token, fd, 'MEDICAL_CERTIFICATE');
        setUploading(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => onDone(), 2000);
        } else {
            setError(result.error ?? "Erreur lors de l'upload");
        }
    };

    return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 space-y-4">
            <div>
                <h3 className="font-semibold text-orange-900">⚠️ Certificat médical obligatoire</h3>
                <p className="text-sm text-orange-800 mt-1">
                    Votre questionnaire de santé nécessite un certificat médical.
                </p>
                <p className="text-sm text-orange-800 font-medium mt-2">
                    Vous ne pourrez pas accéder aux cours sans certificat médical à jour.
                </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
                <p className="text-sm font-medium text-orange-900">Déposer mon certificat en ligne</p>
                <label htmlFor="certificat-upload" className="block text-sm text-orange-800">
                    Fichier (JPEG, PNG, WebP ou PDF — 5 Mo max)
                </label>
                <input
                    id="certificat-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-orange-800 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-orange-100 file:text-orange-800 hover:file:bg-orange-200"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {success ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                        ✓ Votre certificat médical a bien été importé. Il sera vérifié par le club.
                    </div>
                ) : (
                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                    >
                        {uploading ? "Envoi en cours..." : "Envoyer le certificat"}
                    </button>
                )}
            </form>
        </div>
    );
}

// ─── Section Photo d'identité (B3) ───────────────────────────────────────────

function PhotoIdSection({
    token,
    documentExistant,
    onDone,
}: {
    token: string;
    documentExistant: boolean;
    onDone: (url: string) => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        setError(null);

        const fd = new FormData();
        fd.append('file', file);
        const result = await uploadDocumentAdherentAction(token, fd, 'ID_PHOTO');
        setUploading(false);

        if (result.success && result.url) {
            setSuccess(true);
            setTimeout(() => onDone(result.url!), 2000);
        } else {
            setError(result.error ?? "Erreur lors de l'upload");
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
            <div>
                <h3 className="font-semibold text-gray-900">
                    Photo d'identité <span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    Un selfie récent peut suffire si vous ne disposez pas d'une photo d'identité formelle.
                </p>
            </div>
            {documentExistant ? (
                <p className="text-sm text-green-700 font-medium">Photo enregistrée ✓</p>
            ) : (
                <form onSubmit={handleUpload} className="space-y-3">
                    <label htmlFor="photo-id-upload" className="block text-sm text-gray-700">
                        Fichier (JPEG, PNG ou WebP — 5 Mo max)
                    </label>
                    <input
                        id="photo-id-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {success ? (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                            ✓ Votre photo d'identité a bien été importée.
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className="w-full bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                        >
                            {uploading ? "Envoi en cours..." : "Envoyer la photo"}
                        </button>
                    )}
                </form>
            )}
        </div>
    );
}

// ─── Section Coordonnées (B2) ─────────────────────────────────────────────────

function CoordonneesSection({
    token,
    mineur,
    telephone1,
    telephone2,
    onDone,
}: {
    token: string;
    mineur: boolean;
    telephone1: string | null;
    telephone2: string | null;
    onDone: (t1: string, t2: string | null) => void;
}) {
    const [tel1, setTel1] = useState(telephone1 ?? "");
    const [tel2, setTel2] = useState(telephone2 ?? "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tel1) return;
        setSubmitting(true);
        setError(null);

        const result = await updateTelephoneAction(token, { telephone1: tel1, telephone2: tel2 || undefined });
        setSubmitting(false);

        if (result.success) {
            setSaved(true);
            onDone(tel1, tel2 || null);
        } else {
            setError(result.error ?? "Erreur");
        }
    };

    const inputCls = "mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-[#FF8A00] focus:outline-none focus:ring-1 focus:ring-[#FF8A00]";

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Coordonnées téléphoniques</h3>
                <p className="text-sm text-gray-500 mt-1">
                    {mineur
                        ? "Renseignez le numéro du représentant légal 1 (obligatoire) et du représentant légal 2 (facultatif). Le contact se fait par WhatsApp."
                        : "Renseignez votre numéro de téléphone (WhatsApp)."}
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label htmlFor="tel1-dossier" className="block text-sm font-medium text-gray-700">
                        {mineur ? "Représentant légal 1 (WhatsApp)" : "Téléphone (WhatsApp)"} <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="tel1-dossier"
                        type="tel"
                        required
                        value={tel1}
                        onChange={(e) => setTel1(e.target.value)}
                        placeholder="06 12 34 56 78"
                        className={inputCls}
                    />
                </div>
                <div>
                    <label htmlFor="tel2-dossier" className="block text-sm font-medium text-gray-700">
                        {mineur ? "Représentant légal 2 (WhatsApp)" : "Téléphone secondaire"}{" "}
                        <span className="text-gray-400 text-xs">(facultatif)</span>
                    </label>
                    <input
                        id="tel2-dossier"
                        type="tel"
                        value={tel2}
                        onChange={(e) => setTel2(e.target.value)}
                        placeholder="06 12 34 56 78"
                        className={inputCls}
                    />
                    {mineur && (
                        <p className="text-xs text-orange-600 mt-1">
                            Pour les mineurs, merci de nous communiquer si possible les deux numéros de téléphone (père et mère) en cas de parents séparés.
                        </p>
                    )}
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {saved ? (
                    <p className="text-green-600 text-sm font-medium">Coordonnées enregistrées ✓</p>
                ) : (
                    <button
                        type="submit"
                        disabled={!tel1 || submitting}
                        className="w-full bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                    >
                        {submitting ? "Enregistrement..." : "Enregistrer"}
                    </button>
                )}
            </form>
        </div>
    );
}

// ─── Section Droit à l'image (B4) ────────────────────────────────────────────

function DroitImageSection({
    token,
    droitImage,
    onDone,
}: {
    token: string;
    droitImage: boolean;
    onDone: (val: boolean) => void;
}) {
    const [checked, setChecked] = useState(droitImage);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const result = await updateDroitImageAction(token, checked);
        setSubmitting(false);

        if (result.success) {
            setSaved(true);
            onDone(checked);
        } else {
            setError(result.error ?? "Erreur");
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Droit à l'image</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="mt-0.5 text-[#FF8A00] focus:ring-[#FF8A00]"
                    />
                    <span className="text-sm text-gray-700">
                        J'autorise le club à utiliser mon image dans ses communications (photos, vidéos, site web, réseaux sociaux).
                    </span>
                </label>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {saved ? (
                    <p className="text-green-600 text-sm font-medium">Préférence enregistrée ✓</p>
                ) : (
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                    >
                        {submitting ? "Enregistrement..." : "Enregistrer"}
                    </button>
                )}
            </form>
        </div>
    );
}

// ─── Section Engagement pris connaissance (B6) ───────────────────────────────

function EngagementSection({ token, onDone }: { token: string; onDone: () => void }) {
    const [checked, setChecked] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checked) return;
        setSubmitting(true);
        setError(null);

        const result = await validerEngagementAction(token);
        setSubmitting(false);

        if (result.success) {
            onDone();
        } else {
            setError(result.error ?? "Erreur");
        }
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-3">
            <h3 className="font-semibold text-blue-900">Engagement</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="mt-0.5 text-blue-600"
                    />
                    <span className="text-sm text-blue-800">
                        Je m'engage à avoir pris connaissance de l'ensemble des informations communiquées par le club.{" "}
                        <span className="text-red-500">*</span>
                    </span>
                </label>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={!checked || submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                >
                    {submitting ? "Enregistrement..." : "Confirmer"}
                </button>
            </form>
        </div>
    );
}

// ─── Section Autorisation sortie seul (US-002) ───────────────────────────────

function AutorisationSortieSection({
    token,
    statut,
    onDone,
}: {
    token: string;
    statut: StatutDocument;
    onDone: (statut: StatutDocument) => void;
}) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = async (autorise: boolean) => {
        setSaving(true);
        setError(null);
        const result = await patchAutorisationSortieAction(token, autorise);
        setSaving(false);
        if (result.success) {
            onDone(autorise ? 'declare' : 'non_fourni');
        } else {
            setError(result.error ?? 'Erreur');
        }
    };

    if (statut === 'declare' || statut === 'valide') {
        return (
            <div className="flex justify-between items-center">
                <span className="text-gray-700">Autorisation de sortie seul</span>
                <StatutBadge statut={statut} />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-gray-700">Autorisation de sortie seul</span>
                <StatutBadge statut={statut} />
            </div>
            <p className="text-sm text-gray-600">
                J'autorise mon enfant à quitter la salle de sport seul à l'issue des cours
            </p>
            <div className="flex gap-6">
                {(['oui', 'non'] as const).map((val) => (
                    <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="radio"
                            name="autorisation-sortie"
                            value={val}
                            disabled={saving}
                            onChange={() => handleChange(val === 'oui')}
                            className="text-[#FF8A00] focus:ring-[#FF8A00]"
                        />
                        {val === 'oui' ? 'OUI' : 'NON'}
                    </label>
                ))}
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
        </div>
    );
}

// ─── Vue dossier ──────────────────────────────────────────────────────────────

function DossierVue({
    dossier: initial,
    paiementStatus,
    token,
    questions,
}: {
    dossier: DossierData;
    paiementStatus?: "succes" | "annule";
    token: string;
    questions: { code: string; label: string }[];
}) {
    const [dossier, setDossier] = useState(initial);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const mineur = isMineur(dossier.dateDeNaissance);

    // Étapes à compléter
    const questionnaireManquant = dossier.questionnaire === null;
    const reglementManquant = dossier.reglementSigne === "non_fourni";
    const typePaiementManquant = dossier.typePaiement === null;
    const telephoneManquant = !dossier.telephone1;
    const engagementManquant = !dossier.engagementPrisConnaissance;
    const photoManquante = !dossier.documents.find((d) => d.type === "ID_PHOTO");
    const certificatADeclarer =
        dossier.certificatMedicalReq && dossier.certificatMedical === "non_fourni";

    // Statut global
    const documentsRequis: StatutDocument[] = [
        dossier.reglementSigne,
        ...(dossier.certificatMedicalReq ? [dossier.certificatMedical] : []),
        ...(mineur ? [dossier.autorisationParentale] : []),
    ];
    const tousValides = documentsRequis.every((s) => s === "valide");
    const tousDeciares = documentsRequis.every((s) => s !== "non_fourni");
    const documentsManquants = documentsRequis.some((s) => s === "non_fourni");
    const dossierIncomplet = questionnaireManquant || reglementManquant || typePaiementManquant || telephoneManquant || engagementManquant || photoManquante;

    let statutLabel = "";
    let statutColor = "";
    if (dossier.inscriptionValide) {
        statutLabel = "Votre inscription est confirmée. Bienvenue !";
        statutColor = "bg-green-100 text-green-800 border-green-200";
    } else if (dossierIncomplet || documentsManquants) {
        statutLabel = "Votre dossier est incomplet.";
        statutColor = "bg-red-100 text-red-800 border-red-200";
    } else if (tousValides && dossier.typePaiement === "en_ligne") {
        statutLabel = "Votre dossier est validé. Vous pouvez procéder au paiement.";
        statutColor = "bg-blue-100 text-blue-800 border-blue-200";
    } else if (tousValides && dossier.typePaiement === "sur_place") {
        statutLabel = "Votre dossier est validé. Merci de régler sur place.";
        statutColor = "bg-blue-100 text-blue-800 border-blue-200";
    } else if (tousDeciares) {
        statutLabel = "Votre dossier est complet. Un gestionnaire va le valider.";
        statutColor = "bg-orange-100 text-orange-800 border-orange-200";
    } else {
        statutLabel = "Votre dossier est incomplet.";
        statutColor = "bg-red-100 text-red-800 border-red-200";
    }

    const handlePayer = async () => {
        setCheckoutLoading(true);
        setCheckoutError(null);
        const result = await createCheckoutAction(token);
        setCheckoutLoading(false);
        if (result.success && result.url) {
            window.location.href = result.url;
        } else {
            setCheckoutError(result.error ?? "Erreur lors de la création du paiement.");
        }
    };

    const afficherBoutonPaiement =
        dossier.typePaiement === "en_ligne" && !dossier.inscriptionValide && tousValides;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">
                    Dossier de {dossier.prenom} {dossier.nom}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Numéro d'adhérent : <strong>{dossier.numeroAdherent}</strong>
                </p>
            </div>

            {/* Retour Stripe */}
            {paiementStatus === "succes" && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium">
                    ✓ Paiement reçu ! Votre inscription est confirmée.
                </div>
            )}
            {paiementStatus === "annule" && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800">
                    Paiement annulé. Vous pouvez réessayer ci-dessous.
                </div>
            )}

            {/* Statut global */}
            <div className={`p-4 rounded-lg border font-medium ${statutColor}`}>
                {statutLabel}
            </div>

            {/* ── Étapes à compléter ─────────────────────────────────────────── */}

            {questionnaireManquant && (
                <QuestionnaireSection
                    token={token}
                    questions={questions}
                    onDone={(certReq) =>
                        setDossier((d) => ({
                            ...d,
                            questionnaire: { q1: false, q2: false, q3: false, q4: false, q5: false, q6: false, q7: false, q8: false, q9: false },
                            certificatMedicalReq: certReq,
                        }))
                    }
                />
            )}

            {!questionnaireManquant && reglementManquant && (
                <ReglementSection
                    token={token}
                    onDone={() => setDossier((d) => ({ ...d, reglementSigne: "declare" }))}
                />
            )}

            {!questionnaireManquant && !reglementManquant && certificatADeclarer && (
                <CertificatSection
                    token={token}
                    onDone={() => setDossier((d) => ({ ...d, certificatMedical: "declare" }))}
                />
            )}

            {!questionnaireManquant && !reglementManquant && typePaiementManquant && (
                <TypePaiementSection
                    token={token}
                    onDone={(type) => setDossier((d) => ({ ...d, typePaiement: type }))}
                />
            )}

            {!questionnaireManquant && !reglementManquant && !typePaiementManquant && telephoneManquant && (
                <CoordonneesSection
                    token={token}
                    mineur={mineur}
                    telephone1={dossier.telephone1}
                    telephone2={dossier.telephone2}
                    onDone={(t1, t2) => setDossier((d) => ({ ...d, telephone1: t1, telephone2: t2 }))}
                />
            )}

            {!questionnaireManquant && !reglementManquant && !typePaiementManquant && !telephoneManquant && engagementManquant && (
                <EngagementSection
                    token={token}
                    onDone={() => setDossier((d) => ({ ...d, engagementPrisConnaissance: true }))}
                />
            )}

            {/* ── Photo d'identité (obligatoire — bloquant) ─────────────────── */}
            {!questionnaireManquant && !reglementManquant && !typePaiementManquant && !telephoneManquant && !engagementManquant && photoManquante && (
                <PhotoIdSection
                    token={token}
                    documentExistant={false}
                    onDone={(url) => setDossier((d) => ({ ...d, documents: [...d.documents, { id: "photo", type: "ID_PHOTO", url, name: null }] }))}
                />
            )}

            {/* ── Droit à l'image (non bloquant) ────────────────────────────── */}
            {!dossierIncomplet && (
                <DroitImageSection
                    token={token}
                    droitImage={dossier.droitImage}
                    onDone={(val) => setDossier((d) => ({ ...d, droitImage: val }))}
                />
            )}

            {/* ── Documents ──────────────────────────────────────────────────── */}
            {!dossierIncomplet && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900">Documents</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">Règlement intérieur</span>
                            <StatutBadge statut={dossier.reglementSigne} />
                        </div>
                        {dossier.certificatMedicalReq && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Certificat médical</span>
                                <StatutBadge statut={dossier.certificatMedical} />
                            </div>
                        )}
                        {mineur && (
                            <AutorisationSortieSection
                                token={token}
                                statut={dossier.autorisationParentale}
                                onDone={(s) => setDossier((d) => ({ ...d, autorisationParentale: s }))}
                            />
                        )}
                        {dossier.couponSport !== "non_fourni" && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Pass Sport</span>
                                <StatutBadge statut={dossier.couponSport} />
                            </div>
                        )}
                        {dossier.bonCaf !== "non_fourni" && (
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Bon CAF</span>
                                    <StatutBadge statut={dossier.bonCaf} />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Envoyez le document signé à votre CAF, vous serez remboursé(e).
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Montant & paiement ─────────────────────────────────────────── */}
            {dossier.montantSnapshot !== null && dossier.typePaiement && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-1 text-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Paiement</h3>
                    <div className="flex justify-between">
                        <span className="text-gray-700">Montant à régler</span>
                        <span className="font-bold">{Number(dossier.montantSnapshot).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>Mode</span>
                        <span>{dossier.typePaiement === "en_ligne" ? "En ligne (carte bancaire)" : "Sur place (chèque / espèces)"}</span>
                    </div>
                </div>
            )}

            {afficherBoutonPaiement && (
                <div className="space-y-3">
                    {checkoutError && <p className="text-red-600 text-sm text-center">{checkoutError}</p>}
                    <button
                        type="button"
                        onClick={handlePayer}
                        disabled={checkoutLoading}
                        className="w-full bg-[#FF8A00] hover:bg-[#e67a00] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        {checkoutLoading
                            ? "Redirection..."
                            : `Payer ${Number(dossier.montantSnapshot).toFixed(2)} € par carte`}
                    </button>
                </div>
            )}

            {dossier.inscriptionValide && (
                <div className="text-center text-sm text-gray-500">Paiement reçu ✓</div>
            )}
        </div>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface MonDossierViewProps {
    token?: string;
    paiementStatus?: "succes" | "annule";
    questions: { code: string; label: string }[];
}

export default function MonDossierView({ token, paiementStatus, questions }: MonDossierViewProps) {
    const [dossier, setDossier] = useState<DossierData | null>(null);
    const [loading, setLoading] = useState(!!token);
    const [tokenError, setTokenError] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!token) return;
        getMonDossierAction(token).then((result) => {
            setLoading(false);
            if (result.success && result.adherent) {
                setDossier(result.adherent as unknown as DossierData);
            } else {
                setTokenError(true);
            }
        });
    }, [token]);

    if (!token || showForm) {
        return (
            <main className="min-h-screen bg-gray-50 py-20 px-4">
                <IdentificationForm />
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 py-20 px-4 flex items-center justify-center">
                <p className="text-gray-500">Chargement de votre dossier...</p>
            </main>
        );
    }

    if (tokenError) {
        return (
            <main className="min-h-screen bg-gray-50 py-20 px-4">
                <div className="max-w-md mx-auto text-center space-y-4">
                    <p className="text-red-700 font-medium">Ce lien est invalide ou a expiré.</p>
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="bg-black text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Faire une nouvelle demande
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-20 px-4">
            {dossier && <DossierVue dossier={dossier} paiementStatus={paiementStatus} token={token} questions={questions} />}
        </main>
    );
}
