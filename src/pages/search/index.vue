<template>
  <q-page padding>
    <template v-if="!ready">
      <div class="search-layout main_wrap row q-col-gutter-sm">
        <!-- 필터 스켈레톤: 웹 좌측, 모바일 검색 다음 -->
        <section
          class="col-12 col-md-3 filters-block order-2 order-md-1 row q-col-gutter-sm q-gutter-y-sm"
        >
          <div class="col-6 col-md-12">
            <q-card flat bordered class="q-pa-md refinement-card">
              <q-skeleton type="text" width="50%" class="q-mb-md" />
              <div class="refinement-list-scroll">
                <q-skeleton type="text" width="80%" />
                <q-skeleton type="text" width="70%" />
                <q-skeleton type="text" width="90%" />
              </div>
            </q-card>
          </div>
          <div class="col-6 col-md-12">
            <q-card flat bordered class="q-pa-md refinement-card">
              <q-skeleton type="text" width="40%" class="q-mb-md" />
              <div class="refinement-list-scroll">
                <q-skeleton type="text" width="75%" />
                <q-skeleton type="text" width="60%" />
                <q-skeleton type="text" width="85%" />
              </div>
            </q-card>
          </div>
        </section>
        <!-- 검색바 스켈레톤: 모바일 최상단 -->
        <section
          class="col-12 col-md-9 search-block main_content_wrap order-1 order-md-2 q-mb-sm"
        >
          <q-skeleton type="rect" height="48px" class="rounded-borders" />
        </section>
        <!-- 리스트 스켈레톤 -->
        <section
          class="col-12 col-md-9 list-block main_content_wrap order-3 order-md-2 q-mt-sm"
        >
          <q-separator spaced />
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
        </section>
      </div>
    </template>
    <SearchContent v-else />
  </q-page>
</template>

<script setup>
import {
  defineAsyncComponent,
  getCurrentInstance,
  onBeforeMount,
  ref,
} from 'vue';

const ready = ref(false);

// setup 동기 단계에서 app 인스턴스 캡처 (async 이후에는 getCurrentInstance()가 null)
const app = getCurrentInstance()?.appContext?.app;

onBeforeMount(async () => {
  if (!app) return;
  const { default: InstantSearch } = await import('vue-instantsearch/vue3/es');
  app.use(InstantSearch);
  ready.value = true;
});

const SearchContent = defineAsyncComponent(() => import('./SearchContent.vue'));
</script>

<style lang="scss" scoped>
/* 스켈레톤: SearchContent와 동일한 모바일 레이아웃 (크기 고정, 스크롤) */
@media (max-width: 786px) {
  :deep(.search-layout) {
    display: flex;
    flex-wrap: wrap;
  }
  :deep(.search-block) {
    order: 1;
  }
  :deep(.filters-block) {
    order: 2;
  }
  :deep(.list-block) {
    order: 3;
  }
  :deep(.refinement-card) {
    height: 11.5rem;
    min-height: 11.5rem;
    max-height: 11.5rem;
    overflow: hidden;
  }
  :deep(.refinement-list-scroll) {
    max-height: 8rem;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
@media (min-width: 768px) {
  :deep(.search-layout) {
    display: flex;
    flex-wrap: wrap;
  }
  :deep(.filters-block) {
    order: 1;
  }
  :deep(.search-block) {
    order: 2;
  }
  :deep(.list-block) {
    order: 3;
  }
}
</style>
