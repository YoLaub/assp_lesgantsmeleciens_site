import Link from "next/link";

const NAV_LINKS = [
    { label: "Accueil", href: "/" },
    { label: "Disciplines", href: "/disciplines" },
    { label: "Inscription", href: "/inscription" },
    { label: "Contact", href: "/contact" },
];

export function Navbar() {
    return (
        <nav className="hidden md:block">
            <ul className="flex gap-8">
                {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-lg font-bold transition-colors text-white hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}