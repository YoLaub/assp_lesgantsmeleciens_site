import Link from "next/link";
import { Navbar } from "./Navbar";

export function Header() {
    return (
        <header className="relative h-100 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 -z-10 ">
                <img
                    src="/Header.webp"
                    alt="Background Header"
                    className=" w-full object-cover object-center"
                />
            </div>

            <div className=" relative sticky top-0 z-50 container mx-auto mt-5 flex h-16 items-center justify-end gap-90 px-4 sm:px-6 lg:px-8 ">
                <div className="flex items-center gap-8">
                    <Navbar />

                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/adhesion"
                        className="rounded-sm border-2 border-white px-4 py-2 text-lg font-medium text-white transition-transform hover:scale-105 dark:bg-white dark:text-black"
                    >
                        Contact
                    </Link>
                </div>
            </div>
            <Link href="/" className="tracking-tighter">
                <img
                    src="/logoBlanc.webp"
                    alt="Logo association"
                    className="absolute top-0 h-90 w-90 object-cover object-center ms-30 mt-3"
                />
            </Link>

        </header>
    );
}