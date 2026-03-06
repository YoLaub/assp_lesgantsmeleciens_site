import { Info } from 'lucide-react';
import InscriptionSection from '@/features/inscriptions/presentation/components/front/InscriptionSection';

export default function InscriptionPage() {
    return (
        <main className="container mx-auto py-20 px-5">
            {/* Ta bannière promotionnelle */}
            <div className="max-w-6xl mx-auto bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 flex items-center gap-3">
                <Info className="text-amber-500 shrink-0" />
                <p className="text-amber-800 font-bold uppercase text-sm tracking-tight">
                    Offre : 3 cours d&apos;essai avant inscription !
                </p>
            </div>

            {/* Le Smart Component qui contient l'image, les tarifs et le formulaire dépliable */}
            <InscriptionSection />
        </main>
    );
}