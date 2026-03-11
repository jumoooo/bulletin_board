import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useLike } from 'src/composables/useLike';

const mockUid = ref(null);
const mockIsAuthenticated = ref(false);

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
}));

vi.mock('src/services', () => ({
  addLike: vi.fn(() => Promise.resolve()),
  removeLike: vi.fn(() => Promise.resolve()),
  hasLike: vi.fn(() => Promise.resolve(false)),
}));

vi.mock('src/stores/auth', () => ({
  useAuthStore: () => ({
    uid: mockUid,
    isAuthenticated: mockIsAuthenticated,
  }),
}));

describe('useLike', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUid.value = null;
    mockIsAuthenticated.value = false;
  });

  it('초기 likeCount는 options.initialCount와 같다', () => {
    const { likeCount } = useLike('post-1', { initialCount: 5 });
    expect(likeCount.value).toBe(5);
  });

  it('updateLikeCount로 likeCount를 변경할 수 있다', () => {
    const { likeCount, updateLikeCount } = useLike('post-1', {
      initialCount: 0,
    });
    updateLikeCount(10);
    expect(likeCount.value).toBe(10);
  });

  it('비로그인 시 toggleLike 호출 시 Notify가 호출된다', async () => {
    mockIsAuthenticated.value = false;
    mockUid.value = null;

    const { toggleLike } = useLike('post-1', { initialCount: 0 });
    await toggleLike();

    const { Notify } = await import('quasar');
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'warning',
        message: '로그인 후 이용 가능합니다.',
      }),
    );
  });

  it('로그인 시 hasLike가 true면 toggleLike 시 removeLike가 호출된다', async () => {
    mockIsAuthenticated.value = true;
    mockUid.value = 'user-1';

    const { hasLike } = await import('src/services');
    hasLike.mockResolvedValue(true);

    const { toggleLike, likeCount } = useLike('post-1', { initialCount: 1 });
    await vi.waitFor(() => expect(hasLike).toHaveBeenCalled());
    await toggleLike();

    const { removeLike } = await import('src/services');
    expect(removeLike).toHaveBeenCalledWith('user-1', 'post-1');
    expect(likeCount.value).toBe(0);
  });

  it('로그인 시 hasLike가 false면 toggleLike 시 addLike가 호출된다', async () => {
    mockIsAuthenticated.value = true;
    mockUid.value = 'user-1';

    const { hasLike } = await import('src/services');
    hasLike.mockResolvedValueOnce(false);

    const { toggleLike, likeCount } = useLike('post-1', { initialCount: 0 });
    await toggleLike();

    const { addLike } = await import('src/services');
    expect(addLike).toHaveBeenCalledWith('user-1', 'post-1');
    expect(likeCount.value).toBe(1);
  });
});
