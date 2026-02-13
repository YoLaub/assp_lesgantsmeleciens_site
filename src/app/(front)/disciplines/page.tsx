import DisciplineSection from "@/app/(front)/_components/discipline/DisciplineSection";
import CTAInscription from "@/app/(front)/_components/discipline/CTA-inscription";
import CTAFAQ from "@/app/(front)/_components/discipline/FAQ";

export default function Page() {
    return (
        <main className=" container flex flex-col gap-20 pb-20 mx-auto px-5 md:px-0">
            <section className="flex flex-col gap-10 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">Les Disciplines</h1>
                <p className="text-slate-500 text-lg">
                    Au sein de notre association, nous célébrons la richesse des sports de combat à travers une offre disciplinaire variée et complémentaire. Que vous soyez attiré par la précision technique de la Boxe Anglaise, l’engagement total du Muay Thaï ou l'explosivité du Kick-Boxing, notre structure vous propose un cadre d'apprentissage rigoureux et sécurisé.
                    Chaque discipline est enseignée avec le même souci du détail : allier la préparation physique athlétique à la maîtrise des gestes ancestraux. Du loisir à la compétition, de la boxe éducative au perfectionnement technique, nos cours s'adaptent à tous les profils pour forger le corps et l'esprit. Rejoignez une communauté passionnée où le respect de l'adversaire et le dépassement de soi sont les seuls maîtres mots sur le ring.</p>
            </section>
            <DisciplineSection />
            <section className="flex flex-col gap-10">
                <div className="flex gap-4">
                    <CTAInscription />
                </div>
                <div className="flex gap-4">
                    <CTAFAQ />
                </div>

            </section>
        </main>
    );
}