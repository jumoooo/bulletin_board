import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRoute } from 'vue-router';
import { usePostQuery } from 'src/composables/usePostQuery';

const mockPush = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ query: {} })),
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

describe('usePostQuery', () => {
  beforeEach(() => {
    mockPush.mockClear();
    vi.mocked(useRoute).mockReturnValue({ query: {} });
  });

  it('초기 query가 비어 있으면 category는 빈 문자열이다', () => {
    const { category } = usePostQuery();
    expect(category.value).toBe('');
  });

  it('초기 query가 비어 있으면 sort는 createdAt이다', () => {
    const { sort } = usePostQuery();
    expect(sort.value).toBe('createdAt');
  });

  it('초기 query가 비어 있으면 tags는 빈 배열이다', () => {
    const { tags } = usePostQuery();
    expect(tags.value).toEqual([]);
  });

  it('route.query에 category가 있으면 category가 반영된다', () => {
    vi.mocked(useRoute).mockReturnValue({ query: { category: 'qna' } });
    const { category } = usePostQuery();
    expect(category.value).toBe('qna');
  });

  it('route.query에 sort가 있으면 sort가 반영된다', () => {
    vi.mocked(useRoute).mockReturnValue({ query: { sort: 'readCount' } });
    const { sort } = usePostQuery();
    expect(sort.value).toBe('readCount');
  });

  it('route.query에 tags가 있으면 쉼표로 분리된 배열이다', () => {
    vi.mocked(useRoute).mockReturnValue({ query: { tags: 'vue,quasar' } });
    const { tags } = usePostQuery();
    expect(tags.value).toEqual(['vue', 'quasar']);
  });

  it('category setter가 호출되면 router.push가 호출된다', () => {
    vi.mocked(useRoute).mockReturnValue({ query: {} });
    const { category } = usePostQuery();
    category.value = 'qna';
    expect(mockPush).toHaveBeenCalledWith({
      query: { category: 'qna' },
    });
  });

  it('sort setter가 호출되면 router.push가 호출된다', () => {
    vi.mocked(useRoute).mockReturnValue({ query: {} });
    const { sort } = usePostQuery();
    sort.value = 'likeCount';
    expect(mockPush).toHaveBeenCalledWith({
      query: { sort: 'likeCount' },
    });
  });

  it('sort setter가 createdAt일 때 query에 sort를 포함하지 않는다', () => {
    vi.mocked(useRoute).mockReturnValue({ query: {} });
    const { sort } = usePostQuery();
    sort.value = 'createdAt';
    expect(mockPush).toHaveBeenCalledWith({
      query: { sort: undefined },
    });
  });

  it('tags setter가 호출되면 router.push에 join된 문자열이 전달된다', () => {
    vi.mocked(useRoute).mockReturnValue({ query: {} });
    const { tags } = usePostQuery();
    tags.value = ['vue', 'js'];
    expect(mockPush).toHaveBeenCalledWith({
      query: { tags: 'vue,js' },
    });
  });
});
