import type {NextConfig} from "next";

/**
 * Domaine du Frontend API Clerk, décodé depuis la clé publishable.
 * pk_test_.../pk_live_... encode `<frontend-api-domain>$` en base64.
 * Permet à la CSP de fonctionner aussi bien en test (*.clerk.accounts.dev)
 * qu'en prod (clerk.mon-domaine.com) sans modification manuelle.
 */
function clerkFrontendApi(): string {
    const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
    const b64 = pk.replace(/^pk_(test|live)_/, "");
    try {
        return Buffer.from(b64, "base64").toString("utf8").replace(/\$$/, "");
    } catch {
        return "";
    }
}

const clerkHost = clerkFrontendApi();
const clerkSrc = clerkHost ? ` https://${clerkHost}` : "";

const contentSecurityPolicy = [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    // 'unsafe-inline'/'unsafe-eval' requis par Next.js (hydratation), Clerk et hCaptcha.
    // Durcissable plus tard via une CSP à nonce (voir proxy.ts).
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com${clerkSrc}`,
    `style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com`,
    `img-src 'self' data: blob: https://res.cloudinary.com https://img.clerk.com https://*.clerk.com`,
    `font-src 'self' data:`,
    `connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com${clerkSrc}`,
    `frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com https://challenges.cloudflare.com https://*.clerk.accounts.dev${clerkSrc}`,
    `worker-src 'self' blob:`,
    `form-action 'self'${clerkSrc}`,
    `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
    {key: "Content-Security-Policy", value: contentSecurityPolicy},
    {key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload"},
    {key: "X-Frame-Options", value: "DENY"},
    {key: "X-Content-Type-Options", value: "nosniff"},
    {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
    {key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"},
    {key: "X-DNS-Prefetch-Control", value: "on"},
];

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: "/:path*",
                headers: securityHeaders,
            },
        ];
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "10mb",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [32, 48, 64, 96, 128, 256, 384],
    },
};

export default nextConfig;
