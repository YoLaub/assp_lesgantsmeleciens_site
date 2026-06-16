import EssaiForm from '@/features/essayants/presentation/components/front/EssaiForm';

export default function EssaiPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Cours d&apos;essai</h1>
                <p className="text-center text-gray-500 text-sm mb-8">3 cours d&apos;essai gratuits avant de rejoindre le club.</p>
                <EssaiForm />
            </div>
        </main>
    );
}
