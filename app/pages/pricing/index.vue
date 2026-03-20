<template>
  <div class="min-h-screen pb-12 bg-linear-to-b from-[#121212] to-[#1e1e1e]">
    <!-- Header -->
    <div class="text-center pt-12 pb-8 px-4">
      <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-3">
        {{ t("pricing.title") }}
      </h1>
      <p class="text-neutral-400 text-lg max-w-xl mx-auto">
        {{ t("pricing.subtitle") }}
      </p>
    </div>

    <!-- Active subscription banner -->
    <div v-if="activeSubscription" class="max-w-3xl mx-auto mb-8 px-4">
      <div
        class="bg-linear-to-r from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-5 flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"
          >
            <UIcon name="i-lucide-crown" class="size-5 text-green-400" />
          </div>
          <div>
            <p class="text-white font-semibold">
              {{ t("pricing.current_plan") }}: {{ activeSubscription.PlanName }}
            </p>
            <p class="text-neutral-400 text-sm">
              {{
                t("pricing.days_remaining", {
                  days: activeSubscription.DaysRemaining,
                })
              }}
              · {{ t("pricing.expires") }}
              {{ formatDate(activeSubscription.EndDate) }}
            </p>
          </div>
        </div>
        <span
          class="px-3 py-1 bg-primary/20 text-green-400 text-xs font-bold rounded-full uppercase"
        >
          {{ t("pricing.active") }}
        </span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-20">
      <UIcon
        name="i-lucide-loader-2"
        class="size-8 text-neutral-400 animate-spin"
      />
    </div>

    <!-- Pricing Cards -->
    <div v-else class="max-w-5xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.PlanId"
          class="relative flex flex-col rounded-2xl border transition-all duration-300"
          :class="[
            isPopular(plan)
              ? 'bg-linear-to-b from-[#1DB954]/10 to-[#191919] border-[#1DB954]/50 scale-[1.02] shadow-2xl shadow-[#1DB954]/10'
              : 'bg-[#191919] border-white/10 hover:border-white/20',
          ]"
        >
          <!-- Popular badge -->
          <div
            v-if="isPopular(plan)"
            class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1DB954] text-black text-xs font-bold rounded-full uppercase tracking-wide"
          >
            {{ t("pricing.most_popular") }}
          </div>

          <!-- Current plan badge -->
          <div
            v-if="isCurrentPlan(plan)"
            class="absolute -top-3 right-4 px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full"
          >
            {{ t("pricing.current") }}
          </div>

          <div class="p-7 flex flex-col flex-1">
            <!-- Plan name & role -->
            <div class="mb-6">
              <h3 class="text-xl font-bold text-white mb-1">
                {{ plan.PlanName }}
              </h3>
              <span
                class="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full"
                :class="getRoleBadgeClass(plan.RoleGranted)"
              >
                {{ plan.RoleGranted }}
              </span>
            </div>

            <!-- Price -->
            <div class="mb-6">
              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-extrabold text-white">
                  {{ formatPrice(plan.Price) }}
                </span>
                <span class="text-neutral-400 text-sm">₫</span>
              </div>
              <p class="text-neutral-500 text-sm mt-1">
                / {{ plan.DurationMonths }} {{ t("pricing.months") }}
              </p>
              <p
                v-if="plan.DurationMonths > 1"
                class="text-neutral-500 text-xs mt-0.5"
              >
                ~{{
                  formatPrice(Math.round(plan.Price / plan.DurationMonths))
                }}₫ / {{ t("pricing.month") }}
              </p>
            </div>

            <!-- Features list -->
            <ul class="space-y-3 mb-8 flex-1">
              <li class="flex items-start gap-2.5">
                <UIcon
                  :name="
                    plan.UploadLimit === -1
                      ? 'i-lucide-infinity'
                      : 'i-lucide-check'
                  "
                  class="size-4 mt-0.5 shrink-0"
                  :class="
                    plan.UploadLimit === -1
                      ? 'text-[#1DB954]'
                      : 'text-[#1DB954]'
                  "
                />
                <span class="text-sm text-neutral-300">
                  {{
                    plan.UploadLimit === -1
                      ? t("pricing.unlimited_uploads")
                      : t("pricing.limited_uploads", {
                          count: plan.UploadLimit,
                        })
                  }}
                </span>
              </li>
              <li class="flex items-start gap-2.5">
                <UIcon
                  :name="
                    plan.CanScheduleRelease ? 'i-lucide-check' : 'i-lucide-x'
                  "
                  class="size-4 mt-0.5 shrink-0"
                  :class="
                    plan.CanScheduleRelease
                      ? 'text-[#1DB954]'
                      : 'text-neutral-600'
                  "
                />
                <span
                  class="text-sm"
                  :class="
                    plan.CanScheduleRelease
                      ? 'text-neutral-300'
                      : 'text-neutral-600'
                  "
                >
                  {{ t("pricing.schedule_release") }}
                </span>
              </li>
              <li class="flex items-start gap-2.5">
                <UIcon
                  :name="
                    plan.HasAdvancedAnalytics ? 'i-lucide-check' : 'i-lucide-x'
                  "
                  class="size-4 mt-0.5 shrink-0"
                  :class="
                    plan.HasAdvancedAnalytics
                      ? 'text-[#1DB954]'
                      : 'text-neutral-600'
                  "
                />
                <span
                  class="text-sm"
                  :class="
                    plan.HasAdvancedAnalytics
                      ? 'text-neutral-300'
                      : 'text-neutral-600'
                  "
                >
                  {{ t("pricing.advanced_analytics") }}
                </span>
              </li>
              <li class="flex items-start gap-2.5">
                <UIcon
                  name="i-lucide-check"
                  class="size-4 mt-0.5 text-[#1DB954] shrink-0"
                />
                <span class="text-sm text-neutral-300">
                  {{ t("pricing.artist_profile") }}
                </span>
              </li>
              <li class="flex items-start gap-2.5">
                <UIcon
                  name="i-lucide-check"
                  class="size-4 mt-0.5 text-[#1DB954] shrink-0"
                />
                <span class="text-sm text-neutral-300">
                  {{ t("pricing.publish_music") }}
                </span>
              </li>
            </ul>

            <!-- CTA Button -->
            <button
              :disabled="
                payingPlanId === plan.PlanId ||
                isCurrentPlan(plan) ||
                isPlanDowngrade(plan)
              "
              class="w-full py-3 rounded-full font-bold text-sm transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
              :class="[
                isCurrentPlan(plan)
                  ? 'bg-white/10 text-neutral-500'
                  : isPlanDowngrade(plan)
                    ? 'bg-white/5 text-neutral-600'
                    : isPopular(plan)
                      ? 'bg-[#1DB954] hover:bg-[#1ed760] text-black hover:scale-[1.02] active:scale-100'
                      : 'bg-white hover:bg-neutral-200 text-black hover:scale-[1.02] active:scale-100',
              ]"
              @click="handleBuyPlan(plan)"
            >
              <span
                v-if="payingPlanId === plan.PlanId"
                class="flex items-center justify-center gap-2"
              >
                <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
                {{ t("pricing.processing") }}
              </span>
              <span v-else-if="isCurrentPlan(plan)">
                {{ t("pricing.current_plan_btn") }}
              </span>
              <span v-else-if="isPlanDowngrade(plan)">
                {{ t("pricing.lower_plan") }}
              </span>
              <span v-else>
                {{ t("pricing.buy_now") }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment info note -->
    <div class="max-w-3xl mx-auto mt-10 px-4">
      <div class="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-shield-check"
            class="size-5 text-neutral-400 mt-0.5 shrink-0"
          />
          <div>
            <p class="text-sm text-neutral-300 font-medium mb-1">
              {{ t("pricing.secure_payment") }}
            </p>
            <p class="text-xs text-neutral-500">
              {{ t("pricing.payment_note") }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment History Section -->
    <div v-if="paymentHistory.length > 0" class="max-w-4xl mx-auto mt-12 px-4">
      <h2 class="text-xl font-bold text-white mb-4">
        {{ t("pricing.payment_history") }}
      </h2>
      <div
        class="bg-[#191919] rounded-xl border border-white/5 overflow-hidden"
      >
        <table class="w-full">
          <thead>
            <tr
              class="border-b border-white/5 text-neutral-400 text-xs uppercase tracking-wider"
            >
              <th class="text-left px-5 py-3 font-medium">
                {{ t("pricing.date") }}
              </th>
              <th class="text-left px-5 py-3 font-medium">
                {{ t("pricing.plan") }}
              </th>
              <th class="text-right px-5 py-3 font-medium">
                {{ t("pricing.amount") }}
              </th>
              <th class="text-center px-5 py-3 font-medium">
                {{ t("pricing.status") }}
              </th>
              <th class="text-right px-5 py-3 font-medium">
                {{ t("pricing.order_id") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="payment in paymentHistory"
              :key="payment.PaymentId"
              class="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
            >
              <td class="px-5 py-3 text-sm text-neutral-300">
                {{ formatDate(payment.CreatedAt) }}
              </td>
              <td class="px-5 py-3 text-sm text-white font-medium">
                {{ payment.PlanName }}
              </td>
              <td class="px-5 py-3 text-sm text-neutral-300 text-right">
                {{ formatPrice(payment.Amount) }}₫
              </td>
              <td class="px-5 py-3 text-center">
                <span
                  class="px-2.5 py-0.5 text-xs font-semibold rounded-full"
                  :class="getStatusClass(payment.Status)"
                >
                  {{ payment.Status }}
                </span>
              </td>
              <td
                class="px-5 py-3 text-xs text-neutral-500 text-right font-mono"
              >
                {{ payment.TransactionId || payment.OrderId || "-" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import paymentApi from "~/api/paymentApi";
import { ref, onMounted } from "vue";

const { t } = useI18n();
const toast = useToast();

const plans = ref([]);
const activeSubscription = ref(null);
const paymentHistory = ref([]);
const loading = ref(true);
const payingPlanId = ref(null);

// Fetch plans + active subscription + payment history
onMounted(async () => {
  try {
    const [plansRes, historyRes] = await Promise.all([
      paymentApi.getPlans(),
      paymentApi.getPaymentHistory().catch(() => []),
    ]);

    plans.value = plansRes?.Data || plansRes || [];
    paymentHistory.value = historyRes?.Data || historyRes || [];

    // Fetch active subscription (may 404)
    try {
      const subRes = await paymentApi.getActiveSubscription();
      activeSubscription.value = subRes?.Data || subRes || null;
    } catch {
      activeSubscription.value = null;
    }
  } catch (error) {
    toast.add({
      title: t("notify.error"),
      description: t("pricing.load_error"),
      color: "red",
    });
  } finally {
    loading.value = false;
  }
});

// Check if plan is the popular one (6 months)
const isPopular = (plan) => plan.DurationMonths === 6;

// Check if plan is user's current active plan
const isCurrentPlan = (plan) => {
  if (!activeSubscription.value) return false;
  return activeSubscription.value.PlanId === plan.PlanId;
};

// Get the current active plan's price
const currentActivePlanPrice = computed(() => {
  if (!activeSubscription.value || !plans.value.length) return 0;
  const currentPlan = plans.value.find(
    (p) => p.PlanId === activeSubscription.value.PlanId,
  );
  return currentPlan?.Price || 0;
});

// Check if the plan is a downgrade (lower price than current)
const isPlanDowngrade = (plan) => {
  if (!activeSubscription.value) return false;
  if (isCurrentPlan(plan)) return false;
  return plan.Price < currentActivePlanPrice.value;
};

// Handle buying a plan
const handleBuyPlan = async (plan) => {
  if (isCurrentPlan(plan) || isPlanDowngrade(plan)) return;
  payingPlanId.value = plan.PlanId;

  try {
    const res = await paymentApi.createPayment({
      PlanId: plan.PlanId,
      PaymentMethod: "VNPay",
    });

    const paymentUrl = res?.PaymentUrl || res?.data?.PaymentUrl;

    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      throw new Error("No payment URL returned");
    }
  } catch (error) {
    toast.add({
      title: t("notify.error"),
      description: t("pricing.payment_error"),
      color: "red",
    });
    payingPlanId.value = null;
  }
};

// Format price with thousand separators
const formatPrice = (price) => {
  return Number(price).toLocaleString("vi-VN");
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

// Get role badge classes
const getRoleBadgeClass = (role) => {
  if (role === "ArtistPremium") {
    return "bg-amber-500/20 text-amber-400";
  }
  return "bg-blue-500/20 text-blue-400";
};

// Get status badge classes
const getStatusClass = (status) => {
  switch (status) {
    case "Success":
      return "bg-primary/20 text-green-400";
    case "Failed":
      return "bg-red-500/20 text-red-400";
    case "Pending":
      return "bg-yellow-500/20 text-yellow-400";
    default:
      return "bg-neutral-500/20 text-neutral-400";
  }
};
</script>
