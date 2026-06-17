// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { hashToken } from '@/shared/lib/token';

const mockFindFirst = vi.hoisted(() => vi.fn());

vi.mock('@/shared/lib/prisma', () => ({
  prisma: { membre: { findFirst: mockFindFirst } },
}));

import { membreDataSource } from './membre.postgres.datasource';

describe('membreDataSource.findByToken', () => {
  beforeEach(() => vi.clearAllMocks());

  it('interroge la base avec le hash du token, pas le brut', async () => {
    mockFindFirst.mockResolvedValue(null);
    await membreDataSource.findByToken('brut-123');

    const arg = mockFindFirst.mock.calls[0][0];
    expect(arg.where.accesToken).toBe(hashToken('brut-123'));
    expect(arg.where.accesToken).not.toBe('brut-123');
  });
});
