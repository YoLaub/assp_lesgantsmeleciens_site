"use client";

import Link from "next/link";

export function Header() {

    return (
        <header className="relative h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px] xl:h-100 -top-16 border-b border-zinc-200">
            {/* Background Image */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <img
                    src="/Header.webp"
                    alt="Background Header"
                    className="w-full h-full object-cover object-center transform -scale-x-100"
                />
            </div>

            {/* Logo  */}
            <Link
                href="/"
                className="relative top-20 flex justify-center mx-auto  items-center
                           sm:relative sm:flex sm:justify-center sm:items-center sm:mx-auto sm:top-20
                           md:absolute
                           md:top-24 md:left-14
                           lg:top-25 lg:left-20
                           xl:top-12 xl:left-30
                           z-10 transition-transform hover:scale-105 duration-300"
                aria-label="Retour à l'accueil"
            >
                <img
                    src="/logoBlanc.webp"
                    alt="Logo association Les Gants Méléciens"
                    className="h-70 w-108
                               md:h-70 md:w-108
                               2xl:h-90 2xl:w-90
                               object-contain
                               drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]
                               filter brightness-110"
                />
            </Link>
        </header>
    );
}