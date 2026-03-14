<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-b from-[#121212] to-[#1e1e1e] px-4"
  >
    <!-- Loading state -->
    <div v-if="loading" class="text-center">
      <UIcon
        name="i-lucide-loader-2"
        class="size-12 text-neutral-400 animate-spin mb-4"
      />
      <p class="text-neutral-400 text-lg">{{ t("payment.verifying") }}</p>
    </div>

    <!-- Success state -->
    <div
      v-else-if="result && result.Status === 'Success'"
      class="text-center max-w-md"
    >
      <div
        class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <UIcon name="i-lucide-check-circle" class="size-10 text-green-400" />
      </div>
      <h1 class="text-3xl font-extrabold text-white mb-2">
        {{ t("payment.success_title") }}
      </h1>
      <p class="text-neutral-400 mb-6">
        {{ t("payment.success_desc") }}
      </p>

      <div
        class="bg-[#191919] rounded-xl border border-white/5 p-5 mb-8 text-left space-y-3"
      >
        <div class="flex justify-between">
          <span class="text-neutral-500 text-sm">{{
            t("pricing.order_id")
          }}</span>
          <span class="text-white text-sm font-mono">{{ result.OrderId }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-neutral-500 text-sm">{{
            t("pricing.amount")
          }}</span>
          <span class="text-white text-sm font-semibold"
            >{{ formatPrice(result.Amount) }}₫</span
          >
        </div>
        <div class="flex justify-between">
          <span class="text-neutral-500 text-sm">{{
            t("pricing.status")
          }}</span>
          <span
            class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-500/20 text-green-400"
          >
            {{ t("payment.success") }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-neutral-500 text-sm">{{ t("pricing.date") }}</span>
          <span class="text-white text-sm">{{
            formatDate(result.CreatedAt)
          }}</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <NuxtLink
          to="/"
          class="flex-1 py-3 rounded-full font-bold text-sm text-center bg-[#1DB954] hover:bg-[#1ed760] text-black transition-all"
        >
          {{ t("payment.go_home") }}
        </NuxtLink>
        <NuxtLink
          to="/pricing"
          class="flex-1 py-3 rounded-full font-bold text-sm text-center bg-white/10 hover:bg-white/15 text-white transition-all"
        >
          {{ t("payment.view_plans") }}
        </NuxtLink>
      </div>
    </div>

    <!-- Failed state -->
    <div v-else class="text-center max-w-md">
      <div
        class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <UIcon name="i-lucide-x-circle" class="size-10 text-red-400" />
      </div>
      <h1 class="text-3xl font-extrabold text-white mb-2">
        {{ t("payment.failed_title") }}
      </h1>
      <p class="text-neutral-400 mb-8">
        {{ t("payment.failed_desc") }}
      </p>

      <div class="flex flex-col sm:flex-row gap-3">
        <NuxtLink
          to="/pricing"
          class="flex-1 py-3 rounded-full font-bold text-sm text-center bg-[#1DB954] hover:bg-[#1ed760] text-black transition-all"
        >
          {{ t("payment.try_again") }}
        </NuxtLink>
        <NuxtLink
          to="/"
          class="flex-1 py-3 rounded-full font-bold text-sm text-center bg-white/10 hover:bg-white/15 text-white transition-all"
        >
          {{ t("payment.go_home") }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const API_BASE = process.env.BE_URL || "http://localhost:5111/api/v1";

const result = ref(null);
const loading = ref(true);

onMounted(async () => {
  const queryString = window.location.search;

  if (!queryString) {
    result.value = { Status: "Failed" };
    loading.value = false;
    return;
  }

  try {
    // Call backend directly with fetch — vnpay-return is a public endpoint
    // Backend will: verify signature → update Payment=Success → create Subscription → update Role
    const res = await fetch(`${API_BASE}/Payment/vnpay-return${queryString}`, {
      credentials: "include",
    });
    const data = await res.json();
    result.value = data || { Status: "Failed" };

    // If payment succeeded, refresh JWT to pick up new role (Artist/ArtistPremium)
    if (result.value?.Status === "Success") {
      try {
        const refreshRes = await fetch(`${API_BASE}/Auth/refresh-token`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (refreshRes.ok) {
          const tokenData = await refreshRes.json();
          const token = tokenData?.Token || tokenData?.token;
          const expiration = tokenData?.Expiration || tokenData?.expiration;
          if (token) {
            const expirationDate = new Date(expiration);
            document.cookie = `jwt=${token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
          }
        }
      } catch (e) {
        // Non-critical — will refresh on next navigation
      }
    }
  } catch (error) {
    result.value = { Status: "Failed" };
  } finally {
    loading.value = false;
  }
});

const formatPrice = (price) => {
  return Number(price).toLocaleString("vi-VN");
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};
</script>
