<template>
  <div
    class="min-h-screen text-white flex items-center justify-center font-sans"
    style="
      background: linear-gradient(180deg, #1a1a1a 0%, #121212 40%, #000 100%);
    "
  >
    <div
      class="w-full max-w-md px-8 py-10 flex flex-col items-center bg-[#121212] rounded-xl border border-white/10"
    >
      <img
        src="../../../assets/image/logo-cropped.svg"
        alt="Melonia"
        class="w-10 h-10 mb-5"
      />

      <h1 class="text-3xl font-bold tracking-tight text-center">
        {{ t("auth.reset.title") }}
      </h1>
      <p class="text-sm text-neutral-400 mt-2 text-center leading-relaxed">
        {{ t("auth.reset.description") }}
      </p>

      <div v-if="!token" class="w-full mt-8 text-center">
        <p class="text-red-400 text-sm">{{ t("auth.reset.token_missing") }}</p>
        <NuxtLink
          to="/auth/forgot-password"
          class="mt-5 inline-block text-sm text-primary-400 hover:text-primary-300 hover:underline"
        >
          {{ t("auth.reset.request_new_link") }}
        </NuxtLink>
      </div>

      <UForm
        v-else
        :state="state"
        class="w-full space-y-4 mt-8"
        @submit="onSubmit"
      >
        <UFormField
          :label="t('auth.reset.password_label')"
          name="password"
          size="xl"
          :ui="{ label: 'text-white font-bold mb-2' }"
        >
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('auth.reset.password_placeholder')"
            class="w-full"
            variant="outline"
            :ui="{
              base: 'bg-[#121212] hover:border-white border-gray-500 text-white placeholder-gray-400 transition-colors h-12',
            }"
          >
            <template #trailing>
              <button
                type="button"
                class="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <UIcon
                  :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  class="size-5"
                />
              </button>
            </template>
          </UInput>
        </UFormField>

        <UFormField
          :label="t('auth.reset.confirm_password_label')"
          name="confirmPassword"
          size="xl"
          :ui="{ label: 'text-white font-bold mb-2' }"
        >
          <UInput
            v-model="state.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            :placeholder="t('auth.reset.confirm_password_placeholder')"
            class="w-full"
            variant="outline"
            :ui="{
              base: 'bg-[#121212] hover:border-white border-gray-500 text-white placeholder-gray-400 transition-colors h-12',
            }"
          >
            <template #trailing>
              <button
                type="button"
                class="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <UIcon
                  :name="
                    showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                  "
                  class="size-5"
                />
              </button>
            </template>
          </UInput>
        </UFormField>

        <p v-if="successMsg" class="text-emerald-400 text-sm leading-relaxed">
          {{ successMsg }}
        </p>

        <p v-if="errorMsg" class="text-red-400 text-sm leading-relaxed">
          {{ errorMsg }}
        </p>

        <UButton
          type="submit"
          block
          size="xl"
          class="rounded-full cursor-pointer font-bold text-white mt-2 hover:scale-105 transition-transform bg-primary-500 hover:bg-primary-400"
          :loading="isLoading"
          :disabled="!canSubmit"
        >
          {{ t("auth.reset.submit") }}
        </UButton>
      </UForm>

      <NuxtLink
        to="/auth/login"
        class="mt-7 text-sm text-white/90 hover:text-primary hover:underline transition-colors"
      >
        {{ t("auth.reset.back_to_login") }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import authApi from "~/api/authApi";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const { t } = useI18n();

const isLoading = ref(false);
const successMsg = ref("");
const errorMsg = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const state = reactive({
  password: "",
  confirmPassword: "",
});

const token = computed(() => {
  const raw = route.query.token;
  return typeof raw === "string" ? raw.trim() : "";
});

const canSubmit = computed(() => {
  return token.value && state.password.trim() && state.confirmPassword.trim();
});

async function onSubmit() {
  if (!canSubmit.value) return;

  if (state.password.length < 10) {
    errorMsg.value = t("auth.reset.password_short");
    successMsg.value = "";
    return;
  }

  if (state.password !== state.confirmPassword) {
    errorMsg.value = t("auth.reset.password_mismatch");
    successMsg.value = "";
    return;
  }

  isLoading.value = true;
  successMsg.value = "";
  errorMsg.value = "";

  try {
    const res = await authApi.resetPassword({
      Token: token.value,
      NewPassword: state.password,
      ConfirmPassword: state.confirmPassword,
    });

    successMsg.value = res?.Message || t("auth.reset.success");
    state.password = "";
    state.confirmPassword = "";

    setTimeout(() => {
      navigateTo("/auth/login");
    }, 1200);
  } catch (error) {
    errorMsg.value =
      error?.response?.data?.Message ||
      error?.response?.data?.message ||
      t("auth.reset.error");
  } finally {
    isLoading.value = false;
  }
}
</script>
