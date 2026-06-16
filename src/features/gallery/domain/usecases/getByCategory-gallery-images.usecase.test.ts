import { okAsync } from '@/shared/lib/result';
import { GetGalleryImagesByCategoryUseCase } from './getByCategory-gallery-images.usecase';
import { createMockRepository } from '../../__tests__/mock-repository';

describe('GetGalleryImagesByCategoryUseCase', () => {
  it('délègue getByCategory au repository', async () => {
    const repo = createMockRepository();
    repo.getByCategory.mockReturnValue(okAsync([]));
    const result = await new GetGalleryImagesByCategoryUseCase(repo).execute('coaching');
    expect(result.isOk()).toBe(true);
    expect(repo.getByCategory).toHaveBeenCalledWith('coaching');
  });
});
