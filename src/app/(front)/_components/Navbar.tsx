"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
    { label: "Accueil", href: "/" },
    { label: "Disciplines", href: "/disciplines" },
    { label: "Inscription", href: "/inscription" },
    { label: "Actualités", href: "/actualites" },
];

export function StickyNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Sticky Navigation Bar - TOUJOURS VISIBLE */}
            <div className="sticky top-0 z-50 shadow-lg isolate backdrop-blur-sm">
                {/* Background avec blur - en arrière-plan */}
                <div className="absolute inset-0 bg-linear-to-b from-black/40 to-black/20  border-b border-white/10 -z-10"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="flex h-16 items-center justify-between ">
                        {/* Desktop Navbar */}
                        <nav className="hidden md:block flex-1">
                            <ul className="flex gap-8 lg:gap-20 justify-center">
                                {NAV_LINKS.map((link) => (
                                    <li key={link.href} className="mix-blend-difference">
                                        <Link
                                            href={link.href}
                                            className="text-lg lg:text-xl font-bold transition-opacity text-white hover:opacity-70"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Contact Button - Desktop */}
                        <div className="hidden md:flex items-center mix-blend-difference">
                            <Link
                                href="/adhesion"
                                className="rounded-sm border-2 border-white px-4 py-2 text-lg font-medium text-white transition-transform hover:scale-105"
                            >
                                Contact
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors ml-auto"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-8 w-8" />
                            ) : (
                                <Menu className="h-8 w-8" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute bg-black/90 backdrop-blur-md border-t border-white/10 w-full text-center">
                        <nav className=" mx-auto px-4 py-4">
                            <ul className="space-y-4">
                                {NAV_LINKS.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="block text-xl font-bold text-white hover:text-zinc-300 transition-colors py-2"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                                <li className="pt-2 border-t border-white/20">
                                    <Link
                                        href="/adhesion"
                                        className="block text-center rounded-sm border-2 border-white px-4 py-2 text-lg font-medium text-white transition-transform hover:scale-105"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </>
    );
}