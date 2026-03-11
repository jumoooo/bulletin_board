import { storeToRefs } from 'pinia';
import { boot } from 'quasar/wrappers';
import { Notify } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

function requiresAuth(to) {
  const { isAuthenticated } = storeToRefs(useAuthStore());
  if (
    to.matched.some(record => record.meta.requiresAuth) &&
    !isAuthenticated.value
  ) {
    Notify.create({
      type: 'warning',
      message: '로그인이 필요한 페이지 입니다.',
      timeout: 3000,
      position: 'top',
    });
    return '/';
  }
  return true;
}
export default boot(async ({ app, router }) => {
  router.beforeEach(requiresAuth);
});
