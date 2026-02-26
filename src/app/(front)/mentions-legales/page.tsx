import { Metadata } from "next";

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
                    <p>Le responsable du site est <strong>Christophe Barbereau</strong>, en sa qualité de gestionnaire/président de l'association.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-red uppercase tracking-widest mb-4">3. Hébergement</h2>
                    <p>Ce site est hébergé par :<br />
                        <strong>[Nom de l'hébergeur, ex: Vercel Inc. / Hostinger]</strong><br />
                        [Adresse de l'hébergeur]</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-red uppercase tracking-widest mb-4">4. Propriété intellectuelle</h2>
                    <p className="text-justify leading-relaxed">
                        L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
                        Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques.
                        La reproduction de tout ou partie de ce site sur un support quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-brand-red uppercase tracking-widest mb-4">5. Protection des données (RGPD)</h2>
                    <p className="text-justify leading-relaxed">
                        Conformément à la loi "Informatique et Libertés" et au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.
                        Les informations collectées via le formulaire d'inscription sont strictement réservées à la gestion administrative du club et ne sont jamais cédées à des tiers.
                    </p>
                </section>
            </div>
        </main>
    );
}