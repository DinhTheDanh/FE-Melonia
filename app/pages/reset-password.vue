<script setup>
definePageMeta({
  layout: "auth",
});

const route = useRoute();

navigateTo({
  path: "/auth/reset-password",
  query: route.query,
  hash: route.hash,
  replace: true,
});
</script>

<template>
  <div class="min-h-screen"></div>
</template>
