import { Metadata } from "next";
import {Clock, ShieldCheck, Lock} from "lucide-react";

export const metadata: Metadata = {
    title: "Mentions Légales | Les Gants Méléciens",
    description: "Informations légales concernant l'association sportive Les Gants Méléciens.",
};

export default function MentionsLegalesPage() {
    return (
        <main className="container mx-auto py-20 px-6 max-w-4xl">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-12 border-b-4 border-brand-orange inline-block">
                Mentions Légales
            </h1>

            <div className="prose prose-slate max-w-none space-y-10 text-gray-700">
                <section>
                    <h2 className="text-xl font-bold text-brand-red uppercase tracking-widest mb-4">1. Éditeur du site</h2>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <p><strong>Nom de l’association :</strong> Les Gants Méléciens</p>
                        <p><strong>Statut juridique :</strong> Association sportive régie par la loi du 1er juillet 1901</p>
                        <p><strong>Affiliation :</strong> FNSMR (Fédération Nationale du Sport en Milieu Rural)</p>
                        <p><strong>Numéro RNA :</strong> [À compléter, ex: W123456789]</p>
                        <p><strong>Siège social :</strong> [Adresse complète du club]</p>
                        <p><strong>E-mail :</strong> lesgantsmeleciens@gmail.com</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-red uppercase tracking-widest mb-4">2. Directeur de la publication</h2>
                    <p>Le responsable du site est <strong>Christophe Barbereau</strong>, en sa qualité de gestionnaire/président de l&apos;association.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-red uppercase tracking-widest mb-4">3. Hébergement</h2>
                    <p>Ce site est hébergé par :<br />
                        <strong>[Nom de l&apos;hébergeur, ex: Vercel Inc. / Hostinger]</strong><br />
                        [Adresse de l&apos;hébergeur]</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-red uppercase tracking-widest mb-4">4. Propriété intellectuelle</h2>
                    <p className="text-justify leading-relaxed">
                        L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle.
                        Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques.
                        La reproduction de tout ou partie de ce site sur un support quel qu&apos;il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
                    </p>
                </section>

                <section className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="text-brand-orange w-8 h-8" />
                            <h2 className="text-2xl font-black uppercase italic tracking-tight">Protection des données (RGPD)</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <Clock className="text-brand-orange shrink-0 w-6 h-6" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Durée de conservation limitée</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Conformément au principe de minimisation des données, les informations sensibles (notamment les certificats médicaux et pièces jointes) sont <strong>automatiquement supprimées de nos serveurs 365 jours</strong> après la date de soumission du dossier.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Lock className="text-brand-orange shrink-0 w-6 h-6" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Sécurité gérée par des experts</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        La gestion technique et la sécurisation de vos documents sont confiées à un <strong>service tiers spécialisé</strong> (infrastructure Cloudflare R2 / PostgreSQL sécurisé).
                                        Ce dispositif assure un chiffrement des données au repos et en transit, isolant vos fichiers personnels de tout accès non autorisé.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-400">
                            <p>Pour exercer vos droits d&apos;accès, de rectification ou de suppression, contactez-nous à : <span className="text-white">lesgantsmeleciens@gmail.com</span></p>
                        </div>
                    </div>
                    {/* Décoration en arrière-plan */}
                    <div className="absolute -right-10 -bottom-10 opacity-10">
                        <ShieldCheck size={200} />
                    </div>
                </section>

            </div>
        </main>
    );
}