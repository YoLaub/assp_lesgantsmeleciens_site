import Link from "next/link";
import { Navbar } from "./Navbar";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-xl font-bold tracking-tighter">
                        LES GANTS MÉLECIENS
                    </Link>
                    <Navbar />
                </div>

                <div className="flex items-center gap-4">
                    {/* Ici on pourra ajouter un bouton d'appel à l'action ou un login */}
                    <Link
                        href="/adhesion"
                        className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 dark:bg-white dark:text-black"
                    >
                        Rejoindre le club
                    </Link>
                </div>
            </div>
        </header>
    );
}