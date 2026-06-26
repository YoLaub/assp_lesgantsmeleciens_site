import {Instagram, Twitter, Youtube} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logoNoir from "@/../public/logoNoir.webp";
import {getAssociationAction} from "@/features/association/actions/association.actions";

export async function Footer() {
    const currentYear = new Date().getFullYear();
    const asso = await getAssociationAction();
    const reseaux = [
        { url: asso.instagramUrl, label: "Instagram", Icon: Instagram },
        { url: asso.xUrl, label: "X", Icon: Twitter },
        { url: asso.youtubeUrl, label: "YouTube", Icon: Youtube },
    ].filter((r) => r.url);

    return (
        <footer className="bg-brand-light-gray pt-16 font-sans border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-30 items-start text-center md:text-left">

                    <div className="flex justify-center md:justify-start">
                        <div className="w-48 h-48 relative overflow-hidden">
                            <Image
                                src={logoNoir}
                                alt="Logo Les Gants Meleciens"
                                fill
                                sizes="192px"
                                placeholder="blur"
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Section Contacts */}
                    <div className="flex flex-col items-center md:items-start space-y-6">
                        <div className="inline-block relative">
                            <h3 className="text-zinc-800 font-bold uppercase tracking-widest text-lg pb-1 italic">Contacts</h3>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-orange"></div>
                        </div>
                        <div className="text-zinc-600 space-y-4 text-lg leading-relaxed">
                            <p>Besoin d&apos;une information ?<br/>Contactez-nous !</p>
                            <p>
                                <span className="font-medium text-zinc-800">Mail :</span><br/>
                                <a href={`mailto:${asso.email}`} className="hover:text-brand-red transition-colors underline decoration-gray-300 underline-offset-4">{asso.email}</a>
                            </p>
                            <p>
                                <span className="font-medium text-zinc-800">WhatsApp :</span> {asso.telephone}<br/>
                                <span className="text-xs italic text-zinc-400 font-normal">(uniquement par message)</span>
                            </p>
                        </div>
                    </div>

                    {/* Section Navigation */}
                    <div className="flex flex-col items-center md:items-start space-y-6">
                        <div className="inline-block relative">
                            <h3 className="text-zinc-800 font-bold uppercase tracking-widest text-lg pb-1 italic">Accueil</h3>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-orange"></div>
                        </div>
                        <nav className="flex flex-col space-y-3 text-zinc-600 text-lg font-light">
                            <a href="#" className="hover:text-brand-red transition-colors">Disciplines</a>
                            <a href="#" className="hover:text-brand-red transition-colors">Inscription</a>
                            <a href="#" className="hover:text-brand-red transition-colors">Actus</a>
                            <Link href="/contact" className="hover:text-brand-red transition-colors">Contacts</Link>
                        </nav>
                    </div>

                    {/* Section Réseaux */}
                    {reseaux.length > 0 && (
                        <div className="flex flex-col items-center md:items-center space-y-6">
                            <h3 className="text-zinc-800 font-bold tracking-wide text-lg">Suivez nous sur nos réseaux !</h3>
                            <div className="flex space-x-6 text-zinc-700">
                                {reseaux.map(({ url, label, Icon }) => (
                                    <a
                                        key={label}
                                        href={url!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-brand-red transition-all hover:scale-110"
                                        aria-label={label}
                                    >
                                        <Icon size={24} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Barre de Pied de Page - Couleur Pêche */}
            <div className="bg-brand-orange py-4 text-white text-center">
                <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-12 text-sm font-light tracking-wide">
                    <span>{currentYear} - Les Gants Meleciens - Copyright @</span>
                    <Link href="/mentions-legales" className="hover:underline transition-colors">
                        Mentions légales
                    </Link>
                </div>
            </div>
        </footer>
    );
}