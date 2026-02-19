<template>
  <div
    class="min-h-screen text-white flex items-center justify-center font-sans"
    style="
      background: linear-gradient(180deg, #1a1a1a 0%, #121212 40%, #000 100%);
    "
  >
    <div
      class="w-full max-w-md px-8 py-10 flex flex-col items-center bg-[#121212] rounded-xl"
    >
      <!-- Logo + Heading -->
      <div class="mb-8 flex flex-col items-center gap-3">
        <img
          src="../../../assets/image/logo-cropped.svg"
          alt="Melonia"
          class="w-10 h-10"
        />
        <h1 class="text-3xl font-bold tracking-tight text-center">
          {{ t("auth.login.title_heading") }}
        </h1>
      </div>

      <!-- Google Button -->
      <div class="w-full mb-2 flex justify-center">
        <ClientOnly>
          <GoogleLogin :callback="onGoogleCallback" />
          <template #fallback>
            <div class="w-full flex items-center justify-center py-3 rounded-full border border-gray-500">
              <UIcon name="i-heroicons-arrow-path" class="animate-spin w-5 h-5 text-gray-400" />
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Divider -->
      <div class="w-full flex items-center my-6">
        <div class="h-px bg-gray-700 flex-1"></div>
      </div>

      <!-- Email Form -->
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
            placeholder="name@domain.com"
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
          class="rounded-full cursor-pointer font-bold text-black mt-4 hover:scale-105 transition-transform bg-purple-500 hover:bg-purple-400"
        >
          {{ t("auth.login.continue") }}
        </UButton>
      </UForm>

      <!-- Sign up link -->
      <div class="mt-8 pt-4 w-full text-center">
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
import { GoogleLogin } from "vue3-google-login";
import authApi from "../../../api/authApi";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const { saveTokens } = useAuth();

const state = reactive({
  email: "",
});

// Handle normal email login
async function onSubmit() {
  console.log("Submit:", state.email);
}

// Handle Google Login via GoogleLogin component callback
const onGoogleCallback = async (response) => {
  try {
    const token = response.credential;
    if (token) {
      const res = await authApi.googleLogin(token);
      const saved = saveTokens(res);
      if (saved) {
        await navigateTo("/", { replace: true });
      }
    }
  } catch (error) {
    console.error("Google login failed:", error);
  }
};
</script>
