import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useBookmark } from 'src/composables/useBookmark';

const mockUid = ref(null);
const mockIsAuthenticated = ref(false);

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
}));

vi.mock('src/services', () => ({
  addBookmark: vi.fn(() => Promise.resolve()),
  removeBookmark: vi.fn(() => Promise.resolve()),
  hasBookmark: vi.fn(() => Promise.resolve(false)),
}));

vi.mock('src/stores/auth', () => ({
  useAuthStore: () => ({
    uid: mockUid,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

describe('useBookmark', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUid.value = null;
    mockIsAuthenticated.value = false;
  });

  it('초기 bookmarkCount는 options.initialCount와 같다', () => {
    const { bookmarkCount } = useBookmark('post-1', { initialCount: 3 });
    expect(bookmarkCount.value).toBe(3);
  });

  it('updateBookmarkCount로 bookmarkCount를 변경할 수 있다', () => {
    const { bookmarkCount, updateBookmarkCount } = useBookmark('post-1', {
      initialCount: 0,
    });
    updateBookmarkCount(7);
    expect(bookmarkCount.value).toBe(7);
  });

  it('비로그인 시 toggleBookmark 호출 시 Notify가 호출된다', async () => {
    mockIsAuthenticated.value = false;
    mockUid.value = null;

    const { toggleBookmark } = useBookmark('post-1', { initialCount: 0 });
    await toggleBookmark();

    const { Notify } = await import('quasar');
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'warning',
        message: '로그인 후 이용 가능합니다.',
      }),
    );
  });

  it('로그인 시 hasBookmark가 true면 toggleBookmark 시 removeBookmark가 호출된다', async () => {
    mockIsAuthenticated.value = true;
    mockUid.value = 'user-1';

    const { hasBookmark } = await import('src/services');
    hasBookmark.mockResolvedValue(true);

    const { toggleBookmark, bookmarkCount } = useBookmark('post-1', {
      initialCount: 1,
    });
    await vi.waitFor(() => expect(hasBookmark).toHaveBeenCalled());
    await toggleBookmark();

    const { removeBookmark } = await import('src/services');
    expect(removeBookmark).toHaveBeenCalledWith('user-1', 'post-1');
    expect(bookmarkCount.value).toBe(0);
  });

  it('로그인 시 hasBookmark가 false면 toggleBookmark 시 addBookmark가 호출된다', async () => {
    mockIsAuthenticated.value = true;
    mockUid.value = 'user-1';

    const { hasBookmark } = await import('src/services');
    hasBookmark.mockResolvedValueOnce(false);

    const { toggleBookmark, bookmarkCount } = useBookmark('post-1', {
      initialCount: 0,
    });
    await toggleBookmark();

    const { addBookmark } = await import('src/services');
    expect(addBookmark).toHaveBeenCalledWith('user-1', 'post-1');
    expect(bookmarkCount.value).toBe(1);
  });
});
