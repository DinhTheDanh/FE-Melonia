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
        {{ t("auth.forgot.title") }}
      </h1>
      <p class="text-sm text-neutral-400 mt-2 text-center leading-relaxed">
        {{ t("auth.forgot.description") }}
      </p>

      <UForm
        :state="state"
        :schema="schema"
        class="w-full space-y-4 mt-8"
        @submit="onSubmit"
      >
        <UFormField
          :label="t('auth.forgot.email_label')"
          name="email"
          size="xl"
          :ui="{ label: 'text-white font-bold mb-2' }"
        >
          <UInput
            v-model="state.email"
            type="email"
            :placeholder="t('auth.forgot.email_placeholder')"
            class="w-full"
            variant="outline"
            :ui="{
              base: 'bg-[#121212] hover:border-white border-gray-500 text-white placeholder-gray-400 transition-colors h-12',
            }"
          />
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
        >
          {{ t("auth.forgot.submit") }}
        </UButton>
      </UForm>

      <NuxtLink
        to="/auth/login"
        class="mt-7 text-sm text-white/90 hover:text-primary hover:underline transition-colors"
      >
        {{ t("auth.forgot.back_to_login") }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import * as z from "zod";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import authApi from "../../../api/authApi";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const { t } = useI18n();

const isLoading = ref(false);
const successMsg = ref("");
const errorMsg = ref("");

const state = reactive({
  email: typeof route.query.email === "string" ? route.query.email : "",
});

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, t("auth.errors.required"))
    .email(t("auth.errors.email_invalid")),
});

async function onSubmit() {
  isLoading.value = true;
  successMsg.value = "";
  errorMsg.value = "";

  try {
    const res = await authApi.forgotPassword({ Email: state.email.trim() });
    successMsg.value = res?.Message || t("auth.forgot.success");
  } catch (error) {
    errorMsg.value =
      error?.response?.data?.Message ||
      error?.response?.data?.message ||
      t("auth.forgot.error");
  } finally {
    isLoading.value = false;
  }
}
</script>
