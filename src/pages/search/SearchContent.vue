<template>
  <q-page padding>
    <ais-instant-search :search-client="searchClient" index-name="dev_posts">
      <ais-configure :hits-per-page.camel="8" />
      <div class="search-layout row q-col-gutter-sm">
        <!-- 1. 검색바: 모바일 최상단, 데스크톱 우측 상단 -->
        <section
          class="col-12 col-md-9 search-block order-1 order-md-2 q-mb-sm"
        >
          <ais-search-box class="web_search_box" />
        </section>
        <!-- 2. 필터(카테고리·태그): 모바일 검색바 아래 같은 row, 데스크톱 좌측 -->
        <section
          class="col-12 col-md-3 filters-block order-2 order-md-1 row q-col-gutter-sm"
        >
          <div class="col-6 col-md-12">
            <q-card flat bordered class="q-pa-md refinement-card">
              <ais-panel>
                <template #header>{{ $t('category') }}</template>
                <template #default>
                  <div class="refinement-list-scroll">
                    <ais-refinement-list
                      :key="locale"
                      attribute="category"
                      :transform-items="translateCategory"
                    />
                  </div>
                </template>
              </ais-panel>
            </q-card>
          </div>
          <div class="col-6 col-md-12">
            <q-card flat bordered class="q-pa-md refinement-card">
              <ais-panel>
                <template #header>{{ $t('tag') }}</template>
                <template #default>
                  <div class="refinement-list-scroll">
                    <ais-refinement-list attribute="tags" />
                  </div>
                </template>
              </ais-panel>
            </q-card>
          </div>
        </section>
        <!-- 3. 리스트: 모바일 필터 아래, 데스크톱 우측 -->
        <section class="col-12 col-md-9 list-block order-3 order-md-2 q-mt-sm">
          <q-separator spaced />
          <ais-hits :transform-items="transformItems">
            <template #default="{ items }">
              <PostList :items="items" />
            </template>
          </ais-hits>
          <div class="pagination flex flex-center q-mt-md">
            <ais-pagination />
          </div>
        </section>
      </div>
    </ais-instant-search>
  </q-page>
</template>

<script setup>
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import 'instantsearch.css/themes/algolia-min.css';
import PostList from 'src/components/apps/post/PostList.vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const searchClient = algoliasearch(
  'U6WFDZNP7C',
  '447537de190d0e10c3457713fc71caf8',
);
const transformItems = items => {
  return items.map(item => ({
    id: item.objectID,
    title: item.title,
    content: item._snippetResult.content.value,
    category: item.category,
    tags: item.tags,
    createdAt: item.createdAt,
    readCount: item.readCount,
    likeCount: item.likeCount,
    bookmarkCount: item.bookmarkCount,
    commentCount: item.commentCount,
    uid: item.uid,
  }));
};
const translateCategory = items => {
  return items.map(item => ({
    ...item,
    label: t(`${item.label}`),
  }));
};
</script>

<style lang="scss">
/* 카테고리·태그 라벨: 긴 텍스트 ellipsis 처리 */
.ais-RefinementList-label {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  text-transform: lowercase;
  cursor: pointer;
}
.ais-RefinementList-label > * {
  display: inline-block;
}
.ais-RefinementList-label > .ais-RefinementList-checkbox {
  flex-shrink: 0;
  margin-right: 6px;
}
.ais-RefinementList-label > .ais-RefinementList-labelText {
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ais-RefinementList-label > .ais-RefinementList-count {
  flex-shrink: 0;
  padding: 0.01rem 0.4rem;
  border-radius: 50%;
}

/* 세로형(lt-md)에서만: 카테고리·태그 박스 고정 크기, 5개 표시 후 스크롤 */
@media (max-width: 1023px) {
  .refinement-card {
    height: 11.5rem;
    min-height: 11.5rem;
    max-height: 11.5rem;
    overflow: hidden;
  }
  .refinement-list-scroll {
    max-height: 8rem;
    overflow-y: auto;
    overflow-x: hidden;
  }
}
</style>
