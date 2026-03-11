<template>
  <q-page padding>
    <q-spinner
      v-if="!ready"
      color="primary"
      size="40px"
      class="flex flex-center"
    />
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
