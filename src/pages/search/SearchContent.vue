<template>
  <q-page padding>
    <ais-instant-search :search-client="searchClient" index-name="dev_posts">
      <ais-configure :hits-per-page.camel="8" />
      <!-- 단일 DOM, CSS로 웹/모바일 구조 분기 -->
      <div class="search-page-layout">
        <!-- 1. 필터: 웹 좌측, 모바일 2번째 -->
        <section class="search-filters">
          <q-card flat bordered class="q-pa-md refinement-card">
            <ais-panel>
              <template #header>{{ $t('category') }}</template>
              <template #default>
                <div
                  class="refinement-list-scroll"
                  ref="categoryScrollRef"
                  @mousedown="handleRefinementScrollClick('category')"
                >
                  <ais-refinement-list
                    :key="locale"
                    attribute="category"
                    :transform-items="transformCategoryItems"
                  />
                </div>
              </template>
            </ais-panel>
          </q-card>
          <q-card
            flat
            bordered
            class="q-pa-md refinement-card refinement-card-second"
          >
            <ais-panel>
              <template #header>{{ $t('tag') }}</template>
              <template #default>
                <div
                  class="refinement-list-scroll"
                  ref="tagScrollRef"
                  @mousedown="handleRefinementScrollClick('tag')"
                >
                  <ais-refinement-list
                    attribute="tags"
                    :transform-items="transformTagItems"
                  />
                </div>
              </template>
            </ais-panel>
          </q-card>
        </section>
        <!-- 2. 검색: 웹 우측 상단, 모바일 1번째 -->
        <section class="search-search">
          <ais-search-box class="web_search_box" />
        </section>
        <!-- 3. 리스트: 웹 우측 하단, 모바일 3번째 -->
        <section class="search-list">
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
import { ref, nextTick } from 'vue';

const { t, locale } = useI18n();
const categoryScrollRef = ref(null);
const tagScrollRef = ref(null);

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
const sortRefinementItems = items => {
  return [...items].sort((a, b) => {
    const la = String(a.label ?? a.value ?? '').toLowerCase();
    const lb = String(b.label ?? b.value ?? '').toLowerCase();
    return la.localeCompare(lb);
  });
};

const transformCategoryItems = items => {
  const translated = items.map(item => ({
    ...item,
    // 선택 여부(isRefined)와 상관없이 항상 같은 순서를 유지하기 위해
    // 라벨만 번역한 뒤 알파벳 기준으로 정렬
    label: t(`${item.label}`),
  }));
  return sortRefinementItems(translated);
};

const transformTagItems = items => {
  // 태그도 체크 여부와 무관하게 라벨/값 기준으로 고정 정렬
  return sortRefinementItems(items);
};

// 필터 클릭 시 스크롤 위치를 저장했다가 렌더 이후 복원해서 리스트가 위로 튀지 않도록 유지
const preserveScrollPosition = targetRef => {
  const el = targetRef.value;
  if (!el) return;
  const current = el.scrollTop;
  nextTick(() => {
    if (targetRef.value) {
      targetRef.value.scrollTop = current;
    }
  });
};

const handleRefinementScrollClick = type => {
  if (type === 'category') {
    preserveScrollPosition(categoryScrollRef);
  } else if (type === 'tag') {
    preserveScrollPosition(tagScrollRef);
  }
};
</script>

<style lang="scss">
/* 카테고리·태그 라벨: 긴 텍스트 ellipsis 처리 */
.ais-RefinementList-label {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
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

/* 검색 페이지 전용 레이아웃 (main_wrap/main_content_wrap 미사용) */
.search-page-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* 웹(1024px 이상): 좌측 필터 | 우측 검색+리스트 (2열 그리드) */
@media (min-width: 1024px) {
  .search-page-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    grid-template-rows: auto 1fr;
    gap: 1rem;
  }
  .search-page-layout .search-filters {
    grid-column: 1;
    grid-row: 1 / -1;
  }
  .search-page-layout .search-filters .refinement-card-second {
    margin-top: 1rem;
  }
  .search-page-layout .search-search {
    grid-column: 2;
    grid-row: 1;
  }
  .search-page-layout .search-list {
    grid-column: 2;
    grid-row: 2;
  }
}

/* 태블릿·모바일(1024px 미만): 검색 → 필터 → 리스트 */
@media (max-width: 1023px) {
  .search-page-layout {
    flex-direction: column;
  }
  .search-page-layout .search-search {
    order: 1;
  }
  .search-page-layout .search-filters {
    order: 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    align-items: stretch;
  }
  .search-page-layout .search-filters .refinement-card {
    min-width: 0;
  }
  .search-page-layout .search-list {
    order: 3;
  }
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

/* 아주 좁은 화면: 카테고리·태그 세로 배치 */
@media (max-width: 400px) {
  .search-page-layout .search-filters {
    grid-template-columns: 1fr;
  }
}
</style>
