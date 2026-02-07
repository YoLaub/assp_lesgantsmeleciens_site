import { Header } from "./_components/Header";
import { Footer } from "./_components/Footer";
import {StickyNavbar} from "@/app/(front)/_components/Navbar";

export default function FrontLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <StickyNavbar/>
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}