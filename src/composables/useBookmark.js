import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import { storeToRefs } from 'pinia';
import { readonly, ref, watch } from 'vue';
import { addBookmark, hasBookmark, removeBookmark } from 'src/services';

export const useBookmark = (id, options) => {
  const { initialCount } = options || {};
  const { uid, isAuthenticated } = storeToRefs(useAuthStore());

  const isBookmark = ref(false);
  const bookmarkCount = ref(initialCount);
  const postId = ref(id);

  const initBookmark = async () => {
    if (isAuthenticated.value === false) {
      isBookmark.value = false;
      return;
    }
    isBookmark.value = await hasBookmark(uid.value, postId.value);
  };

  const toggleBookmark = async () => {
    if (isAuthenticated.value === false) {
      Notify.create({
        type: 'warning',
        message: '로그인 후 이용 가능합니다.',
        timeout: 3000,
        position: 'top',
      });
      return;
    }
    if (isBookmark.value) {
      await removeBookmark(uid.value, postId.value);
      bookmarkCount.value--;
    } else {
      await addBookmark(uid.value, postId.value);
      bookmarkCount.value++;
    }
    isBookmark.value = !isBookmark.value;
  };
  watch(isAuthenticated, () => initBookmark(), { immediate: true });
  return {
    isBookmark,
    bookmarkCount: readonly(bookmarkCount),
    updateBookmarkCount: count => (bookmarkCount.value = count),
    toggleBookmark,
  };
};
