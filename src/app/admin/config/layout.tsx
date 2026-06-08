import { ConfigSubNav } from './_components/ConfigSubNav';

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className="px-8 pt-8 font-sans">
                <ConfigSubNav />
            </div>
            {children}
        </div>
    );
}
