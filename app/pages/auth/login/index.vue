<template>
  <div
    class="min-h-screen text-white flex items-center justify-center font-sans"
  >
    <div class="w-full max-w-[450px] px-6 py-8 flex flex-col items-center">
      <h1
        class="text-5xl font-bold flex flex-col items-center gap-1 mb-10 tracking-tighter text-center"
      >
        <span>{{ t("auth.login.welcome") }}</span>
        <span>{{ t("auth.login.back") }}</span>
      </h1>

      <UForm :state="state" class="w-full space-y-4" @submit="onSubmit">
        <UFormField
          :label="t('auth.login.email_label')"
          name="email"
          size="xl"
          class="font-bold text-sm"
          :ui="{ label: 'text-white font-bold mb-2' }"
        >
          <UInput
            v-model="state.email"
            class="w-full"
            :ui="{
              base: 'bg-[#121212] hover:border-white border-gray-500 text-white placeholder-gray-400 transition-colors h-12',
            }"
            variant="outline"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="xl"
          class="rounded-full cursor-pointer font-bold text-black mt-4 hover:scale-105 transition-transform"
        >
          {{ t("auth.login.continue") }}
        </UButton>
      </UForm>

      <div class="w-full flex items-center justify-between my-8">
        <div class="h-px bg-gray-700 flex-1"></div>
        <span
          class="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest"
        >
          {{ t("auth.login.divider_or") }}
        </span>
        <div class="h-px bg-gray-700 flex-1"></div>
      </div>

      <div class="w-full flex justify-center h-[50px]">
        <ClientOnly>
          <GoogleLogin :callback="onGoogleCallback" />

          <template #fallback>
            <div
              class="text-gray-500 text-sm font-bold flex items-center gap-2"
            >
              <UIcon
                name="i-heroicons-arrow-path"
                class="animate-spin w-5 h-5"
              />
              Loading Google...
            </div>
          </template>
        </ClientOnly>
      </div>

      <div class="mt-10 pt-4 w-full text-center">
        <p class="text-gray-400 font-medium">
          {{ t("auth.login.no_account") }}
          <NuxtLink
            to="/auth/register"
            class="text-white hover:underline hover:text-primary font-bold ml-1 transition-colors"
          >
            {{ t("auth.login.signup") }}
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import { GoogleLogin } from "vue3-google-login"; // Import Component
import authApi from "../../../api/authApi";
import { useRouter } from "vue-router";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const router = useRouter();

const state = reactive({
  email: "",
});

// Xử lý Login bằng Email thường
async function onSubmit() {
  console.log("Submit:", state.email);
}

// Xử lý Callback khi Login Google thành công
const onGoogleCallback = async (response) => {
  try {
    const token = response.credential;

    if (token) {
      const res = await authApi.googleLogin(token);
      router.push("/");
    }
  } catch (error) {}
};
</script>
