import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
    const url = req.nextUrl;

    // 1. Redirection de confort : si on tape juste /admin, on va sur le dashboard
    if (url.pathname === '/admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    // 2. SÉCURITÉ (Pour plus tard)
    // C'est ici que tu vérifieras si l'utilisateur a le droit de voir le backoffice.
    if (url.pathname.startsWith('/admin')) {
        // Exemple :
        // const session = await getAuthSession();
        // if (!session || session.role !== 'ADMIN') {
        //     return NextResponse.redirect(new URL('/login', req.url));
        // }
    }

    // On laisse passer tout le reste naturellement vers l'univers Front (app/(front))
    return NextResponse.next();
}

// Le matcher reste identique pour filtrer les assets statiques
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};