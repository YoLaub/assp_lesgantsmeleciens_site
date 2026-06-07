"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X, Play } from "lucide-react";
import headerBg from "@/../public/Header.webp";
import logoBlanc from "@/../public/logoBlanc.webp";

const VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? "";

export function Header() {
    const [videoOpen, setVideoOpen] = useState(false);

    return (
        <header
            className={`relative border-b border-zinc-200 -top-16 transition-all duration-500 ease-in-out overflow-hidden ${
                videoOpen
                    ? "h-[calc(100vh+4rem)]"
                    : "h-87.5 sm:h-112.5 md:h-137.5 lg:h-162.5 xl:h-100"
            }`}
        >
            {/* Background Image */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <Image
                    src={headerBg}
                    alt="Background Header"
                    fill
                    priority
                    sizes="100vw"
                    placeholder="blur"
                    className="object-cover object-center transform -scale-x-100"
                />
                {/* Overlay sombre quand la vidéo est ouverte */}
                {videoOpen && (
                    <div className="absolute inset-0 bg-black/60 transition-opacity duration-500" />
                )}
            </div>

            {/* Logo */}
            <Link
                href="/"
                className={`relative z-10 flex justify-center mx-auto items-center transition-all duration-500
                           top-20
                           sm:relative sm:flex sm:justify-center sm:items-center sm:mx-auto sm:top-20
                           md:absolute md:top-24 md:left-14
                           lg:top-25 lg:left-20
                           xl:top-12 xl:left-30
                           hover:scale-105
                           ${videoOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                aria-label="Retour à l'accueil"
            >
                <Image
                    src={logoBlanc}
                    alt="Logo association Les Gants Méléciens"
                    width={432}
                    height={280}
                    sizes="(max-width: 768px) 280px, (max-width: 1536px) 432px, 360px"
                    priority
                    placeholder="blur"
                    className="h-70 w-108 md:h-70 md:w-108 2xl:h-90 2xl:w-90 object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] filter brightness-110"
                />
            </Link>

            {/* Bouton Voir la vidéo — glassmorphism */}
            {!videoOpen && VIDEO_URL && (
                <button
                    type="button"
                    onClick={() => setVideoOpen(true)}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10
                               flex items-center gap-2.5 px-6 py-3 rounded-full
                               bg-white/10 backdrop-blur-md border border-white/30
                               text-white font-semibold text-sm
                               shadow-[0_4px_30px_rgba(0,0,0,0.2)]
                               hover:bg-white/20 hover:border-white/50
                               transition-all duration-200 hover:scale-105 active:scale-95"
                    aria-label="Voir la vidéo de présentation"
                >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/25">
                        <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                    </span>
                    Voir la vidéo
                </button>
            )}

            {/* Section vidéo */}
            {videoOpen && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 py-16 gap-6">
                    {/* Bouton fermer */}
                    <button
                        type="button"
                        onClick={() => setVideoOpen(false)}
                        className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full
                                   bg-white/15 backdrop-blur-md border border-white/30
                                   text-white hover:bg-white/25 transition-colors"
                        aria-label="Fermer la vidéo"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Player vidéo */}
                    <div className="w-full max-w-4xl">
                        <video
                            src={VIDEO_URL}
                            controls
                            autoPlay
                            className="w-full rounded-2xl shadow-2xl max-h-[calc(100vh-10rem)]"
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
