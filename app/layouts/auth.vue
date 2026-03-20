<template>
  <div class="min-h-screen bg-black text-white">
    <slot />
  </div>
</template>

<script setup>
const { locale, setLocale } = useI18n();

onMounted(() => {
  if (!import.meta.client) return;

  const storedLocale = localStorage.getItem("app-locale");
  if (storedLocale && storedLocale !== locale.value) {
    setLocale(storedLocale);
  }
});
</script>
