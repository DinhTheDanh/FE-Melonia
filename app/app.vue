<template>
  <UApp :toaster="toaster">
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
  </UApp>
</template>

<script setup lang="ts">
const toaster = { position: "top-center" };
</script>
