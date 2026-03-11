import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPost, getPost, getPosts } from 'src/services/post';

vi.mock('src/boot/firebase', () => ({ db: {} }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'posts-collection'),
  doc: vi.fn((_, __, id) => `doc-${id}`),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _ts: true })),
  query: vi.fn(() => 'query-ref'),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
}));

vi.mock('src/services/user', () => ({
  getUserById: vi.fn(() => ({ displayName: 'User' })),
}));

describe('post service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPost', () => {
    it('게시글 생성 시 문서 id를 반환한다', async () => {
      const { addDoc } = await import('firebase/firestore');
      addDoc.mockResolvedValueOnce({ id: 'new-post-id' });

      const id = await createPost({
        title: '제목',
        content: '내용',
        category: 'qna',
        tags: ['vue'],
        uid: 'user-1',
      });

      expect(addDoc).toHaveBeenCalled();
      expect(id).toBe('new-post-id');
    });
  });

  describe('getPost', () => {
    it('문서가 존재하면 id와 data를 반환한다', async () => {
      const { getDoc } = await import('firebase/firestore');
      const mockData = {
        title: '제목',
        content: '내용',
        uid: 'u1',
        createdAt: { toDate: () => new Date('2025-01-01') },
      };
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: 'post-1',
        data: () => mockData,
      });

      const result = await getPost('post-1');

      expect(result).toMatchObject({
        id: 'post-1',
        title: '제목',
        content: '내용',
        uid: 'u1',
      });
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('문서가 없으면 에러를 던진다', async () => {
      const { getDoc } = await import('firebase/firestore');
      getDoc.mockResolvedValueOnce({ exists: () => false });

      await expect(getPost('nonexistent')).rejects.toThrow('No such document');
    });
  });

  describe('getPosts', () => {
    it('조회 결과를 items와 lastItem 형태로 반환한다', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockDoc = {
        id: 'doc-1',
        data: () => ({
          title: '첫 글',
          createdAt: { toDate: () => new Date() },
        }),
      };
      getDocs.mockResolvedValueOnce({
        docs: [mockDoc],
      });

      const result = await getPosts({ limit: 6 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('id', 'doc-1');
      expect(result.items[0]).toHaveProperty('title', '첫 글');
      expect(result.lastItem).toEqual(mockDoc);
    });

    it('빈 목록일 때 lastItem은 마지막 doc이다', async () => {
      const { getDocs } = await import('firebase/firestore');
      getDocs.mockResolvedValueOnce({ docs: [] });

      const result = await getPosts({ limit: 6 });

      expect(result.items).toEqual([]);
      expect(result.lastItem).toBeUndefined();
    });
  });
});
