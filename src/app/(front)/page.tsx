export default function HomePage() {
    return (
        <div className="flex flex-col gap-20 pb-20">
            {/* Hero Section - Exemple simple en attendant le design */}
            <section className="relative flex h-[70vh] items-center justify-center bg-zinc-900 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tighter sm:text-7xl">
                        S'ENTRAÎNER POUR <span className="text-red-600">GAGNER</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
                        Rejoignez Les Gants Méleciens : Boxe Française, Savate et préparation physique à Meaux.
                    </p>
                </div>
            </section>

            {/* Contenu temporaire pour tester le scroll et le footer */}
            <section className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="h-64 rounded-xl bg-zinc-100 dark:bg-zinc-900"/>
                    <div className="h-64 rounded-xl bg-zinc-100 dark:bg-zinc-900"/>
                </div>
            </section>
        </div>
    );
}