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
      <!-- Step 1: Email + Google -->
      <div v-if="currentStep === 1" class="flex flex-col items-center w-full">
        <img
          src="../../../assets/image/logo-cropped.svg"
          alt="Melonia Logo"
          class="w-10 h-10 mb-4"
        />
        <h1
          class="text-3xl font-bold flex flex-col items-center gap-1 mb-8 tracking-tight text-center"
        >
          <span>{{ t("auth.register.welcome") }}</span>
          <span>{{ t("auth.register.start") }}</span>
        </h1>
      </div>

      <!-- Steps 2-4 Header with progress bar -->
      <div v-else class="w-full mb-8">
        <div
          class="w-full h-1 bg-gray-700 mb-6 relative rounded-full overflow-hidden"
        >
          <div
            class="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out"
            :style="{ width: progressWidth }"
          ></div>
        </div>
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-chevron-left"
            variant="ghost"
            class="hover:text-white -ml-3"
            @click="prevStep"
          />
          <div>
            <p
              class="text-gray-400 text-xs font-bold uppercase tracking-widest"
            >
              {{
                t("auth.register.step_counter", {
                  step: currentStep - 1,
                  total: 3,
                })
              }}
            </p>
            <h2 class="text-white font-bold text-lg">{{ stepTitle }}</h2>
          </div>
        </div>
      </div>

      <UForm
        ref="formRef"
        :schema="currentSchema"
        :state="state"
        class="w-full space-y-4"
        @submit="onNextStep"
        :validate-on="['blur', 'input']"
      >
        <!-- Step 1: Email + Google Sign Up -->
        <div v-if="currentStep === 1">
          <UFormField
            :label="t('auth.register.email_label')"
            name="email"
            size="xl"
            class="text-sm"
            :ui="{ label: 'text-white font-bold mb-2' }"
          >
            <UInput
              v-model="state.email"
              placeholder="name@domain.com"
              class="w-full"
              :ui="{
                base: 'bg-[#121212] text-sm font-medium hover:border-white border-gray-500 text-white placeholder-gray-400 transition-colors h-12',
              }"
              variant="outline"
            />
          </UFormField>

          <UButton
            type="submit"
            block
            size="xl"
            class="rounded-full font-bold mt-6 hover:scale-105 transition-transform bg-purple-500 hover:bg-purple-400"
          >
            {{ t("auth.register.next") }}
          </UButton>

          <div class="w-full flex items-center my-6">
            <div class="h-px bg-gray-700 flex-1"></div>
            <span
              class="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              {{ t("auth.login.divider_or") }}
            </span>
            <div class="h-px bg-gray-700 flex-1"></div>
          </div>

          <!-- Google Button -->
          <ClientOnly>
            <div class="flex justify-center">
              <GoogleLogin :callback="onGoogleCallback" />
            </div>
            <template #fallback>
              <div
                class="w-full flex items-center justify-center py-3 rounded-full border border-gray-500"
              >
                <UIcon
                  name="i-heroicons-arrow-path"
                  class="animate-spin w-5 h-5 text-gray-400"
                />
              </div>
            </template>
          </ClientOnly>

          <div class="mt-8 text-center">
            <p class="text-gray-400 font-medium">
              {{ t("auth.login.have_account") }}
              <NuxtLink
                to="/auth/login"
                class="text-white hover:underline hover:text-primary font-bold ml-1 transition-colors"
              >
                {{ t("auth.login.signin") }}
              </NuxtLink>
            </p>
          </div>
        </div>

        <!-- Step 2: Name + Password -->
        <div v-else-if="currentStep === 2" class="flex flex-col gap-2">
          <UFormField
            name="name"
            :label="t('auth.register.name_label')"
            :ui="{ label: 'text-white font-bold mb-2' }"
          >
            <UInput
              v-model="state.name"
              size="xl"
              :ui="{
                base: 'bg-[#121212] text-sm border-gray-500 text-white h-12',
              }"
              class="w-full"
            />
            <p class="text-xs text-gray-400 mt-1">
              {{ t("auth.register.name_help") }}
            </p>
          </UFormField>
          <UFormField
            name="password"
            :label="t('auth.register.password_label')"
            :ui="{ label: 'text-white font-bold mb-2' }"
          >
            <UInput
              v-model="state.password"
              :type="showPassword ? 'text' : 'password'"
              size="xl"
              class="w-full"
              :ui="{
                base: 'bg-[#121212] text-sm font-medium hover:border-white border-gray-500 text-white transition-colors h-12',
              }"
            >
              <template #trailing>
                <UButton
                  variant="link"
                  icon="i-heroicons-eye"
                  :padded="false"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <div class="mt-4 space-y-2">
            <p class="text-sm font-bold text-white mb-1">
              {{ t("auth.register.password_criteria_title") }}
            </p>
            <div
              v-for="(req, index) in passwordChecklist"
              :key="index"
              class="flex items-center gap-2 text-sm"
            >
              <div
                class="w-4 h-4 rounded-full border flex items-center justify-center transition-colors"
                :class="
                  req.valid ? 'bg-primary border-primary' : 'border-gray-400'
                "
              >
                <UIcon
                  v-if="req.valid"
                  name="i-heroicons-check"
                  class="text-white w-3 h-3"
                />
              </div>
              <span :class="req.valid ? 'text-white' : 'text-gray-400'">{{
                req.label
              }}</span>
            </div>
          </div>

          <UButton
            type="submit"
            block
            size="xl"
            color="primary"
            class="rounded-full font-bold mt-8 hover:scale-105 transition-transform"
          >
            {{ t("auth.register.next") }}
          </UButton>
        </div>

        <!-- Step 3: Profile info -->
        <div v-else-if="currentStep === 3">
          <UButton
            type="submit"
            block
            size="xl"
            color="primary"
            class="rounded-full font-bold mt-8 hover:scale-105 transition-transform"
          >
            {{ t("auth.register.next") }}
          </UButton>
        </div>

        <!-- Step 4: Terms & Conditions -->
        <div v-else-if="currentStep === 4">
          <div class="bg-[#1a1a1a] p-4 rounded-lg space-y-4">
            <UCheckbox
              v-model="state.marketing"
              :label="t('auth.register.marketing_opt_out')"
              :ui="{ label: 'text-white text-sm' }"
            />
            <UCheckbox
              v-model="state.share_data"
              :label="t('auth.register.share_data_opt_in')"
              :ui="{ label: 'text-white text-sm' }"
            />
          </div>

          <div class="text-xs text-gray-400 mt-6">
            <p>{{ t("auth.register.terms_text") }}</p>
          </div>

          <UButton
            :loading="isLoading"
            type="submit"
            block
            size="xl"
            color="primary"
            class="rounded-full font-bold mt-8 hover:scale-105 transition-transform"
          >
            {{ t("auth.register.submit") }}
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { GoogleLogin } from "vue3-google-login";
import authApi from "../../../api/authApi";
import { useRegisterSchema } from "~/utils/registerSchema";

definePageMeta({
  layout: "auth",
});

const { t } = useI18n();
const formRef = ref();
const isLoading = ref(false);
const { saveTokens } = useAuth();
const config = useRuntimeConfig();

const currentStep = ref(1);
const showPassword = ref(false);

const state = reactive({
  email: "",
  password: "",
  name: "",
  marketing: false,
  share_data: false,
});

// Lấy bộ schema từ file utils
const schemas = computed(() => useRegisterSchema(t));

const currentSchema = computed(() => {
  if (currentStep.value === 1) return schemas.value.step1;
  if (currentStep.value === 2) return schemas.value.step2;
  if (currentStep.value === 3) return schemas.value.step3;
  return schemas.value.step4;
});

// Checklist hiển thị ở Bước 2
const passwordChecklist = computed(() => [
  {
    label: t("auth.register.criteria_letter"),
    valid: /[a-zA-Z]/.test(state.password),
  },
  {
    label: t("auth.register.criteria_special"),
    valid: /[\d\W_]/.test(state.password),
  },
  {
    label: t("auth.register.criteria_length"),
    valid: state.password.length >= 10,
  },
]);

const progressWidth = computed(() => {
  if (currentStep.value <= 1) return "0%";
  if (currentStep.value === 2) return "33%";
  if (currentStep.value === 3) return "66%";
  return "100%";
});

const stepTitle = computed(() => {
  if (currentStep.value === 2) return t("auth.register.password_title");
  if (currentStep.value === 3) return t("auth.register.profile_title");
  if (currentStep.value === 4) return t("auth.register.terms_title");
  return "";
});

const onNextStep = async () => {
  if (currentStep.value < 4) {
    currentStep.value++;
  } else {
    await finalSubmit();
  }
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

async function finalSubmit() {
  isLoading.value = true;
  try {
    const payload = {
      ...state,
    };
    // await authApi.register(payload);
    router.push("/");
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
}

// Uses GoogleLogin component callback - credential flow, no COOP issues
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
    console.error("Google register failed:", error);
  }
};
</script>
