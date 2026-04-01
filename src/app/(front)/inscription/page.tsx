import { Info } from 'lucide-react';
import InscriptionSection from '@/features/inscriptions/presentation/components/front/InscriptionSection';
import { getActiveDisciplinesAction } from '@/app/(front)/disciplines/actions/discipline.actions';
import { toCloudinaryAsset } from '@/shared/lib/cloudinary';

export default async function InscriptionPage() {
    const result = await getActiveDisciplinesAction();
    const firstImage = result.success && result.data?.[0]?.images?.[0];
    const image = firstImage ? toCloudinaryAsset(firstImage) : undefined;
    const blurDataUrl = firstImage ? firstImage.blurDataUrl : undefined;
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
            <InscriptionSection image={image} blurDataUrl={blurDataUrl} />
        </main>
    );
}