import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-black">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div>
                        <h3 className="text-lg font-bold italic tracking-tighter">LES GANTS MÉLECIENS</h3>
                        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                            Boxe Française et Savate à Meaux. <br />
                            Dépassement de soi, respect et tradition.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Navigation</h4>
                        <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <li><Link href="/disciplines" className="hover:text-black dark:hover:text-white">Nos Disciplines</Link></li>
                            <li><Link href="/planning" className="hover:text-black dark:hover:text-white">Horaires & Planning</Link></li>
                            <li><Link href="/mentions-legales" className="hover:text-black dark:hover:text-white">Mentions Légales</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider">Contact</h4>
                        <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <li>📍 Gymnase Fontaine, Meaux</li>
                            <li>✉️ contact@lesgantsmeleciens.fr</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-zinc-200 pt-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
                    <p>© {currentYear} Les Gants Méleciens. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}