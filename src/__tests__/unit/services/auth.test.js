import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateDefaultPhotoURL,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
} from 'src/services/auth';

const DEFAULT_PHOTO_BASE =
  'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=';

vi.mock('src/boot/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
}));

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDefaultPhotoURL', () => {
    it('uid를 받아 기본 프로필 URL을 반환한다', () => {
      expect(generateDefaultPhotoURL('user-123')).toBe(
        `${DEFAULT_PHOTO_BASE}user-123`,
      );
    });

    it('빈 문자열 uid도 그대로 반환한다', () => {
      expect(generateDefaultPhotoURL('')).toBe(`${DEFAULT_PHOTO_BASE}`);
    });
  });

  describe('signInWithEmail', () => {
    it('이메일/비밀번호로 로그인 시 user 객체를 반환한다', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const mockUser = { uid: 'uid1', email: 'a@b.com' };
      signInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

      const result = await signInWithEmail({
        email: 'a@b.com',
        password: 'pass123',
      });

      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('signUpWithEmail', () => {
    it('회원가입 후 updateProfile과 sendEmailVerification을 호출한다', async () => {
      const {
        createUserWithEmailAndPassword,
        updateProfile,
        sendEmailVerification,
      } = await import('firebase/auth');
      const mockUser = { uid: 'new-uid', email: 'new@test.com' };
      createUserWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });
      updateProfile.mockResolvedValueOnce(undefined);
      sendEmailVerification.mockResolvedValueOnce(undefined);

      const auth = (await import('src/boot/firebase')).auth;
      auth.currentUser = mockUser;

      await signUpWithEmail({
        email: 'new@test.com',
        password: 'password123',
      });

      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(updateProfile).toHaveBeenCalledWith(
        mockUser,
        expect.objectContaining({
          displayName: 'new',
          photoURL: expect.any(String),
        }),
      );
      expect(sendEmailVerification).toHaveBeenCalled();
    });
  });

  describe('sendPasswordReset', () => {
    it('이메일로 비밀번호 재설정 메일 전송을 요청한다', async () => {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      sendPasswordResetEmail.mockResolvedValueOnce(undefined);

      await sendPasswordReset('user@example.com');

      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });
  });
});
