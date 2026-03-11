<template>
  <q-page padding>
    <template v-if="!ready">
      <div class="search-layout row q-col-gutter-sm">
        <!-- 검색바 스켈레톤 -->
        <section
          class="col-12 col-md-9 search-block order-1 order-md-2 q-mb-sm"
        >
          <q-skeleton type="rect" height="48px" class="rounded-borders" />
        </section>
        <!-- 좌측 필터 카드 스켈레톤 (refinement-card 구조) -->
        <section
          class="col-12 col-md-3 filters-block order-2 order-md-1 row q-col-gutter-sm"
        >
          <div class="col-6 col-md-12">
            <q-card flat bordered class="q-pa-md refinement-card">
              <q-skeleton type="text" width="50%" class="q-mb-md" />
              <div class="refinement-list-scroll">
                <div v-for="i in 4" :key="i" class="flex items-center q-mb-sm">
                  <q-skeleton
                    type="rect"
                    style="width: 18px; height: 18px"
                    class="q-mr-sm rounded-borders"
                  />
                  <q-skeleton type="text" :width="`${60 + i * 10}%`" />
                  <q-skeleton type="circle" size="18px" class="q-ml-auto" />
                </div>
              </div>
            </q-card>
          </div>
          <div class="col-6 col-md-12">
            <q-card flat bordered class="q-pa-md refinement-card">
              <q-skeleton type="text" width="40%" class="q-mb-md" />
              <div class="refinement-list-scroll">
                <div v-for="i in 4" :key="i" class="flex items-center q-mb-sm">
                  <q-skeleton
                    type="rect"
                    style="width: 18px; height: 18px"
                    class="q-mr-sm rounded-borders"
                  />
                  <q-skeleton type="text" :width="`${50 + i * 10}%`" />
                  <q-skeleton type="circle" size="18px" class="q-ml-auto" />
                </div>
              </div>
            </q-card>
          </div>
        </section>
        <!-- 우측 리스트 스켈레톤 (PostItem 구조) -->
        <section class="col-12 col-md-9 list-block order-3 order-md-2 q-mt-sm">
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
/* 스켈레톤 refinement 카드: SearchContent와 동일한 모바일 레이아웃 */
@media (max-width: 1023px) {
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
</style>
