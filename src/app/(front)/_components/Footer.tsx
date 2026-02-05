import {Instagram, Twitter, Youtube} from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 pt-16 font-sans border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-start text-center md:text-left">

                    {/* Section Logo - Design Circulaire inspiré de l'image */}
                    <div className="flex justify-center md:justify-start">
                        <div className="w-48 h-48 flex items-center justify-center overflow-hidden">
                            <img
                                src="/logoNoir.webp"
                                alt="Logo Les Gants Meleciens"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Section Contacts */}
                    <div className="flex flex-col items-center md:items-start space-y-6">
                        <div className="inline-block relative">
                            <h3 className="text-zinc-800 font-bold uppercase tracking-widest text-sm pb-1 italic">Contacts</h3>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500"></div>
                        </div>
                        <div className="text-zinc-600 space-y-4 text-sm font-light leading-relaxed">
                            <p>Besoin d'une information ?<br/>Contactez-nous !</p>
                            <p>
                                <span className="font-medium text-zinc-800">Mail :</span><br/>
                                <a href="mailto:lesgantsmeleciens@gmail.com" className="hover:text-red-600 transition-colors underline decoration-gray-300 underline-offset-4">lesgantsmeleciens@gmail.com</a>
                            </p>
                            <p>
                                <span className="font-medium text-zinc-800">Téléphone :</span> 07 66 99 94 80<br/>
                                <span className="text-xs italic text-zinc-400 font-normal">(uniquement par message sur WhatsApp)</span>
                            </p>
                        </div>
                    </div>

                    {/* Section Navigation */}
                    <div className="flex flex-col items-center md:items-start space-y-6">
                        <div className="inline-block relative">
                            <h3 className="text-zinc-800 font-bold uppercase tracking-widest text-sm pb-1 italic">Accueil</h3>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500"></div>
                        </div>
                        <nav className="flex flex-col space-y-3 text-zinc-600 text-sm font-light">
                            <a href="#" className="hover:text-red-600 transition-colors">Disciplines</a>
                            <a href="#" className="hover:text-red-600 transition-colors">Inscription</a>
                            <a href="#" className="hover:text-red-600 transition-colors">Actus</a>
                            <a href="#" className="hover:text-red-600 transition-colors">Contacts</a>
                        </nav>
                    </div>

                    {/* Section Réseaux */}
                    <div className="flex flex-col items-center md:items-start space-y-6">
                        <h3 className="text-zinc-800 font-bold tracking-wide text-sm">Suivez nous sur nos réseaux !</h3>
                        <div className="flex space-x-6 text-zinc-700">
                            <a href="#" className="hover:text-red-600 transition-all hover:scale-110" aria-label="X">
                                <Twitter size={24} />
                            </a>
                            <a href="#" className="hover:text-red-600 transition-all hover:scale-110" aria-label="Instagram">
                                <Instagram size={24} />
                            </a>
                            <a href="#" className="hover:text-red-600 transition-all hover:scale-110" aria-label="YouTube">
                                <Youtube size={24} />
                            </a>
                        </div>
                    </div>

                </div>
            </div>

            {/* Barre de Pied de Page - Couleur Pêche */}
            <div className="bg-[#e9c4a1] py-4 text-white text-center">
                <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-12 text-sm font-light tracking-wide">
                    <span>{currentYear} - Les Gants Meleciens - Copyright @</span>
                    <a href="#" className="hover:underline">Mentions légales</a>
                </div>
            </div>
        </footer>
    );
}