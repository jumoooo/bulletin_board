<template>
  <q-tabs
    v-model="tab"
    dense
    class="text-grey"
    active-color="primary"
    indicator-color="primary"
    align="justify"
  >
    <template v-for="mainTab in mainTabs" :key="mainTab.name">
      <!--mainTab 상단 Tab 부분-->
      <q-tab
        :name="mainTab['name']"
        :label="$t(mainTab['title'])"
        class="text-capitalize"
      />
    </template>
  </q-tabs>
  <q-separator />
  <q-tab-panels v-model="tab" animated>
    <template v-for="mainTab in mainTabs" :key="mainTab.name">
      <q-tab-panel :name="mainTab['name']" class="q-pa-none">
        <q-splitter v-model="splitterModel" :horizontal="isMobileScreen">
          <template #before>
            <div class="splitter-before">
              <q-tabs
                v-model="currentInnerTab"
                :vertical="!isMobileScreen"
                class="sub-tabs-row text-teal"
              >
                <template v-for="subTab in subTabs" :key="subTab.title">
                  <template v-if="mainTab['name'] == subTab['mainName']">
                    <template
                      v-for="(subTabDtl, index_sub) in subTab['tabList']"
                      :key="index_sub"
                    >
                      <!--subTab 상단 Tab 부분-->
                      <q-tab
                        :name="`${subTab['mainName'] + '_' + (index_sub + 1)}`"
                        icon="description"
                        :label="$t(subTabDtl['title'])"
                        class="sub-tab text-capitalize"
                        style="white-space: normal; word-break: break-word"
                      />
                    </template>
                  </template>
                </template>
              </q-tabs>
            </div>
          </template>
          <!--slot before-->
          <template #after>
            <q-tab-panels
              v-model="currentInnerTab"
              animated
              :vertical="!isMobileScreen"
            >
              <template v-for="subTab in subTabs" :key="subTab.title">
                <template
                  v-for="(subTabDtl, index) in subTab['tabList']"
                  :key="index"
                >
                  <q-tab-panel
                    :name="`${subTab['mainName'] + '_' + (index + 1)}`"
                  >
                    <!-- 내용 스크롤 컨테이너: 글이 길어지면 자동 스크롤 -->
                    <div class="tab-panel-content">
                      <!--내용 title-->
                      <h1 class="text-h4 q-mb-md">
                        {{ $t(subTabDtl['title']) }}
                      </h1>
                      <q-separator />
                      <br />
                      <!--내용 contents-->
                      <template
                        v-for="(content, idx) in subTabDtl['content']"
                        :key="idx"
                      >
                        <p class="content-text">{{ '- ' + $t(content) }}</p>
                      </template>
                      <!--내용 image-->
                      <template v-if="subTabDtl['isImg'] == true">
                        <template
                          v-for="(img, idx_img) in subTabDtl['imgs']"
                          :key="idx_img"
                        >
                          <h2 v-if="img['imgTitle']">
                            {{ $t(img['imgTitle']) }}
                          </h2>

                          <!-- Native lazy loading 적용 (성능 최적화) -->
                          <div class="inner-img-wrap">
                            <img
                              class="inner-img"
                              :src="img['imgLink']"
                              loading="lazy"
                              @click="$emit('clickImage', img['imgLink'])"
                            />
                          </div>
                        </template>
                      </template>
                      <template v-else>
                        <p>* {{ $t('message.1079') }}</p>
                      </template>
                    </div>
                  </q-tab-panel>
                </template>
              </template>
            </q-tab-panels>
          </template>
          <!--slot after-->
        </q-splitter>
      </q-tab-panel>
    </template>
  </q-tab-panels>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';

const $q = useQuasar();

const props = defineProps({
  mainTabs: {
    type: Array,
    default: () => [],
  },
  mainDefault: {
    type: String,
  },
  subDefault: {
    type: Array,
    default: () => [],
  },
  subTabs: {
    type: Array,
    default: () => [],
  },
});
defineEmits(['clickImage']);
const tab = ref(props.mainDefault);
const innerTabs = ref({});
if (props.subDefault.length > 0) {
  props.subDefault.forEach(defaultVal => {
    const [mainName, subIndex] = defaultVal.split('_');
    innerTabs.value[mainName] = defaultVal;
  });
} else {
  props.mainTabs.forEach(defaultVal => {
    innerTabs.value[defaultVal['name']] = defaultVal['name'] + '_' + 1;
  });
}

// 'tab' (메인 탭)의 변경을 감지 -> 'innerTabs' 객체에서 현재 활성화된 서브 탭 값을 가져옴
const currentInnerTab = computed({
  get: () => innerTabs.value[tab.value],
  set: val => {
    innerTabs.value[tab.value] = val;
  },
});

const splitterModel = ref(10);
// 모바일, 테블릿 세로모드 = ture
const isMobileScreen = computed(() => $q.screen.lt.md);
</script>

<style lang="scss" scoped>
/* S1: sub-tabs row overflow 방지 - flex-wrap으로 viewport 초과 방지 */
.sub-tabs-row :deep(.q-tabs__flex) {
  flex-wrap: wrap;
}

.q-tab-panels {
  height: 100%;
  flex-grow: 1;
  display: flex;
  .q-tab-panel {
    height: 100%;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .q-splitter {
    height: 100%;
  }

  h1 {
    font-size: 34px;
  }
  h2 {
    font-size: 20px;
    margin-top: 10px;
  }
}

/* 내용란: 글이 길어지면 자동 스크롤 (flex 자식에 min-height: 0 필요) */
.tab-panel-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* S3: 콘텐츠 영역 word-break */
.content-text {
  word-break: break-word;
  overflow-wrap: break-word;
}

/* S3: 이미지 - 비율 유지하면서 가로 꽉 채우기 (마진/패딩 유지) */
.inner-img-wrap {
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}
.inner-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 5px;
}

/* S4: q-splitter 모바일 - before 슬롯 min-width, panel overflow */
.splitter-before {
  min-width: 0;
  overflow: hidden;
  height: 100%;
}
:deep(.q-splitter__panel) {
  overflow: hidden;
}

/* S2: 모바일 sub-tab 글자 크기 - 786px */
@media (max-width: 786px) {
  .sub-tab {
    :deep(.q-tab__label) {
      font-size: 11px !important;
      line-height: 1.2;
    }
  }
  h1 {
    font-size: 28px;
  }
}

/* S2: 480px 이하 sub-tab 글자 크기 축소 및 패딩 조정 */
@media (max-width: 480px) {
  .sub-tab {
    :deep(.q-tab__label) {
      font-size: 10px !important;
    }
    :deep(.q-tab) {
      min-width: 0;
      padding-left: 8px;
      padding-right: 8px;
    }
  }
  h1 {
    font-size: 22px;
  }
}
</style>
