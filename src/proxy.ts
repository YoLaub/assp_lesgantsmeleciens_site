import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ARCHITECTE NOTE (Next.js 16 / Turbopack) :
 * Correction du 404 sur le domaine Admin.
 * * Les groupes de routes comme (admin) ou (front) sont transparents pour Next.js.
 * Il ne faut JAMAIS les inclure dans les chaînes de caractères de réécriture (rewrites).
 */

export async function proxy(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Configuration du domaine d'administration
    const adminHostname = (process.env.NEXT_PUBLIC_ADMIN_HOSTNAME || 'admin.localhost:3000').toLowerCase();
    const currentHostname = hostname.toLowerCase();

    // 1. GESTION DES ASSETS & API (Priorité haute)
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.includes('.') ||
        url.pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    // 2. LOGIQUE UNIVERS ADMIN
    if (currentHostname.includes('admin.')) {
        // Si on est à la racine, on redirige vers /dashboard
        if (url.pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        /**
         * FIX : On réécrit vers url.pathname DIRECTEMENT.
         * Comme src/app/(admin)/dashboard/page.tsx existe,
         * Next.js résoudra naturellement /dashboard vers ce fichier car
         * le groupe (admin) est transparent.
         */
        return NextResponse.rewrite(new URL(url.pathname, req.url));
    }

    // 3. LOGIQUE UNIVERS VITRINE (FRONT)
    // Sécurité : On interdit l'accès aux routes de gestion depuis le domaine public
    const adminRoutes = ['/dashboard', '/content', '/adherents'];
    if (adminRoutes.some(route => url.pathname.startsWith(route))) {
        return new NextResponse(null, { status: 404 });
    }

    // Pour la vitrine, on laisse Next.js résoudre /(front) naturellement.
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Intercepte toutes les routes sauf assets et favicons
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};