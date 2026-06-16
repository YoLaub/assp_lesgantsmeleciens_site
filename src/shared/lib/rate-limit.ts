import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

/**
 * Rate-limiting des actions publiques (formulaires).
 *
 * - Si UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN sont présents :
 *   limite distribuée via Upstash (fiable sur serverless type Vercel, et
 *   fonctionne aussi depuis un serveur auto-hébergé).
 * - Sinon : fallback in-memory (process unique). Suffisant en dev local
 *   ou sur un serveur mono-instance ; best-effort seulement sur serverless.
 *
 * Tant qu'Upstash n'est pas provisionné, rien ne casse : le fallback prend le relais.
 */

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 10 * 60 * 1000; // 10 min

const hasUpstash = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const upstashLimiter = hasUpstash
    ? new Ratelimit({
          redis: Redis.fromEnv(),
          limiter: Ratelimit.slidingWindow(DEFAULT_LIMIT, '10 m'),
          prefix: 'rl:form',
          analytics: false,
      })
    : null;

// Fallback in-memory : Map<clé, timestamps[]>
const memoryHits = new Map<string, number[]>();

function memoryLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const recent = (memoryHits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    memoryHits.set(key, recent);
    return recent.length <= limit;
}

export async function getClientIp(): Promise<string> {
    const h = await headers();
    const forwarded = h.get('x-forwarded-for');
    return forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
}

/**
 * Vérifie le quota pour un `scope` (ex: 'adhesion', 'essai') et l'IP appelante.
 * Retourne true si la requête est autorisée, false si la limite est dépassée.
 */
export async function checkRateLimit(
    scope: string,
    opts?: { limit?: number; windowMs?: number },
): Promise<boolean> {
    const limit = opts?.limit ?? DEFAULT_LIMIT;
    const windowMs = opts?.windowMs ?? DEFAULT_WINDOW_MS;
    const ip = await getClientIp();
    const key = `${scope}:${ip}`;

    if (upstashLimiter) {
        const { success } = await upstashLimiter.limit(key);
        return success;
    }

    return memoryLimit(key, limit, windowMs);
}
