<template>
  <q-page padding>
    <ThreeColumnLayout
      left-col="col-grow"
      center-col="col-7"
      right-col="col-3"
      left-aria-label="category sidebar"
      center-aria-label="posts list"
      right-aria-label="tags and write button"
    >
      <!-- 왼쪽: 카테고리 -->
      <template #left>
        <PostLeftBar v-model:category="category" />
      </template>

      <!-- 중앙: 게시글 목록 -->
      <template #center>
        <PostHeader
          v-model:sort="sort"
          :category="getCategoriesLabel(category)"
        />
        <template v-if="isLoading">
          <q-list bordered separator>
            <q-item v-for="n in 6" :key="n" tag="div" class="bg-white q-pt-md">
              <q-item-section avatar top>
                <q-skeleton type="QAvatar" size="40px" />
              </q-item-section>
              <q-item-section>
                <div class="flex items-center">
                  <q-skeleton type="text" width="80px" />
                  <q-skeleton
                    type="rect"
                    class="q-ml-sm rounded-borders"
                    style="width: 50px; height: 24px"
                  />
                </div>
                <q-skeleton
                  type="text"
                  width="70%"
                  class="text-h6 q-mt-sm"
                  style="height: 1.5rem"
                />
                <div class="text-caption q-mt-xs">
                  <q-skeleton type="text" width="120px" />
                </div>
                <div class="q-my-sm">
                  <q-skeleton type="text" width="100%" />
                  <q-skeleton type="text" width="90%" />
                </div>
                <div class="row items-center">
                  <div v-for="i in 4" :key="i" class="col-3 flex flex-center">
                    <q-skeleton type="circle" size="28px" />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
        <template v-else>
          <PostList :items="items" />
          <div v-intersection-observer="handleIntersectionObserver"></div>
        </template>
      </template>

      <!-- 오른쪽: 태그 및 글쓰기 -->
      <template #right>
        <PostRightBar
          v-model:tags="tags"
          @open-write-dialog="openWriteDialog"
        />
      </template>
    </ThreeColumnLayout>

    <!-- 글쓰기 다이얼로그 -->
    <PostWriteDialog
      v-model="postDialog"
      @complete="completeRegistrationPost"
    />
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { Notify } from 'quasar';

import { getPosts } from 'src/services';
import { useAsyncState } from '@vueuse/core';
import { vIntersectionObserver } from '@vueuse/components';
import { usePostQuery } from 'src/composables/usePostQuery';
import { useAuthStore } from 'src/stores/auth';
import { getCategoriesLabel } from 'src/services';

import ThreeColumnLayout from 'src/components/layout/ThreeColumnLayout.vue';
import PostList from 'src/components/apps/post/PostList.vue';
import PostHeader from './components/PostHeader.vue';
import PostLeftBar from './components/PostLeftBar.vue';
import PostRightBar from './components/PostRightBar.vue';
import PostWriteDialog from 'src/components/apps/post/PostWriteDialog.vue';

const { category, sort, tags } = usePostQuery();
const authStore = useAuthStore();

const params = computed(() => ({
  category: category.value,
  tags: tags.value,
  sort: sort.value,
  limit: 6,
}));
const items = ref([]);
const start = ref(null);
const isLoadMore = ref(true);

const { execute, isLoading } = useAsyncState(getPosts, [], {
  immediate: false,
  throwError: true,
  onSuccess: result => {
    if (start.value) {
      items.value = items.value.concat(result.items);
    } else {
      items.value = result.items;
    }
    isLoadMore.value = result.items.length >= params.value.limit;
    start.value = result.lastItem;
  },
});
watch(
  params,
  () => {
    start.value = null;
    execute(0, params.value);
  },
  {
    deep: true,
    immediate: true,
  },
);

const postDialog = ref(false);
const openWriteDialog = () => {
  if (!authStore.isAuthenticated) {
    Notify.create({
      type: 'warning',
      message: '로그인 후 이용 가능합니다.',
      timeout: 3000,
      position: 'top',
    });
    return;
  }
  postDialog.value = true;
};
const completeRegistrationPost = () => {
  postDialog.value = false;
  start.value = null;
  execute(0, params.value);
};
// const vIntersectionObserver = {
//   beforeMount: (el, binding) => {
//     const observer = new IntersectionObserver(binding.value);
//     observer.observe(el);
//   },
// };
const loadMore = () => {
  execute(0, { ...params.value, start: start.value });
};
const handleIntersectionObserver = ([{ isIntersecting }]) => {
  if (isIntersecting && isLoadMore.value) {
    // console.log('### handleIntersectionObserver ###');
    loadMore();
  }
};
</script>

<style lang="scss" scoped></style>
