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
            <ul className="flex gap-12">
                {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-xl font-bold transition-colors text-white hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}