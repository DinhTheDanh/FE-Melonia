<template>
  <div class="min-h-screen px-6 py-8">
    <div class="max-w-5xl mx-auto">
      <div
        class="rounded-2xl p-7 bg-linear-to-r from-[#2a2a2a] via-[#1d1d1d] to-[#121212] border border-white/10"
      >
        <h1 class="text-4xl font-black text-white mt-2">
          {{ t("settings.title") }}
        </h1>
        <p class="text-neutral-400 mt-2 text-sm">
          {{ t("settings.subtitle") }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <aside class="lg:col-span-1 space-y-4">
          <div class="bg-[#171717] border border-white/10 rounded-xl p-5">
            <p class="text-xs uppercase tracking-widest text-neutral-500">
              {{ t("settings.account.section") }}
            </p>
            <h2 class="text-xl font-bold text-white mt-2 truncate">
              {{ profileName }}
            </h2>
            <p class="text-sm text-neutral-400 mt-1 truncate">
              {{ profileEmail }}
            </p>
            <p class="text-xs text-neutral-500 mt-3">
              {{ t("settings.account.role", { role: profileRole }) }}
            </p>

            <div class="mt-5 space-y-2">
              <button
                class="w-full text-left px-3 py-2 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/20 text-sm text-white transition-colors cursor-pointer"
                @click="navigateTo('/user/profile')"
              >
                {{ t("settings.account.edit_profile") }}
              </button>
              <button
                class="w-full text-left px-3 py-2 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/20 text-sm text-white transition-colors cursor-pointer"
                @click="navigateTo('/pricing')"
              >
                {{ t("settings.account.plan_billing") }}
              </button>
              <button
                class="w-full text-left px-3 py-2 rounded-md bg-red-500/15 hover:bg-red-500/25 text-sm text-red-300 transition-colors cursor-pointer"
                @click="handleLogout"
              >
                {{ t("settings.account.logout") }}
              </button>
            </div>
          </div>

          <div class="bg-[#171717] border border-white/10 rounded-xl p-5">
            <p class="text-xs uppercase tracking-widest text-neutral-500">
              {{ t("settings.language.section") }}
            </p>
            <div class="grid grid-cols-2 gap-2 mt-3">
              <button
                class="px-3 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                :class="
                  selectedLocale === 'vi'
                    ? 'bg-primary-500 text-white'
                    : 'bg-primary/10 border border-primary/20 text-white hover:bg-primary/20'
                "
                @click="setLocaleCode('vi')"
              >
                {{ t("settings.language.vi") }}
              </button>
              <button
                class="px-3 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                :class="
                  selectedLocale === 'en'
                    ? 'bg-primary-500 text-white'
                    : 'bg-primary/10 border border-primary/20 text-white hover:bg-primary/20'
                "
                @click="setLocaleCode('en')"
              >
                {{ t("settings.language.en") }}
              </button>
            </div>
          </div>
        </aside>

        <section class="lg:col-span-2 space-y-4">
          <div class="bg-[#171717] border border-white/10 rounded-xl p-5">
            <h3 class="text-lg font-bold text-white">
              {{ t("settings.playback.section") }}
            </h3>
            <p class="text-sm text-neutral-400 mt-1">
              {{ t("settings.playback.description") }}
            </p>

            <div class="mt-5 space-y-5">
              <div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-neutral-300">{{
                    t("settings.playback.default_volume")
                  }}</span>
                  <span class="text-white font-semibold"
                    >{{ Math.round(playerStore.volumePercent) }}%</span
                  >
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  :value="Math.round(playerStore.volumePercent)"
                  class="w-full mt-2 accent-primary"
                  @input="onVolumeInput"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  class="px-3 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                  :class="
                    playerStore.isMuted
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary/10 border border-primary/20 text-white hover:bg-primary/20'
                  "
                  @click="playerStore.toggleMute()"
                >
                  {{
                    playerStore.isMuted
                      ? t("settings.playback.muted")
                      : t("settings.playback.mute")
                  }}
                </button>

                <button
                  class="px-3 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                  :class="
                    playerStore.isShuffle
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary/10 border border-primary/20 text-white hover:bg-primary/20'
                  "
                  @click="playerStore.toggleShuffle()"
                >
                  {{
                    playerStore.isShuffle
                      ? t("settings.playback.shuffle_on")
                      : t("settings.playback.shuffle_off")
                  }}
                </button>

                <button
                  class="px-3 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                  :class="
                    playerStore.repeatMode !== 'off'
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary/10 border border-primary/20 text-white hover:bg-primary/20'
                  "
                  @click="playerStore.cycleRepeatMode()"
                >
                  {{ t("settings.playback.repeat") }}: {{ repeatModeLabel }}
                </button>
              </div>
            </div>
          </div>

          <div class="bg-[#171717] border border-white/10 rounded-xl p-5">
            <h3 class="text-lg font-bold text-white">
              {{ t("settings.security.section") }}
            </h3>
            <p class="text-sm text-neutral-400 mt-1">
              {{ t("settings.security.description") }}
            </p>

            <div class="mt-5 space-y-4">
              <div>
                <label
                  class="block text-xs font-semibold text-neutral-300 mb-1.5"
                >
                  {{ t("settings.security.current_password_label") }}
                </label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  :placeholder="t('settings.security.current_password')"
                  class="w-full bg-[#242424] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-primary/60"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    class="block text-xs font-semibold text-neutral-300 mb-1.5"
                  >
                    {{ t("settings.security.new_password_label") }}
                  </label>
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    :placeholder="t('settings.security.new_password')"
                    class="w-full bg-[#242424] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-primary/60"
                  />
                </div>
                <div>
                  <label
                    class="block text-xs font-semibold text-neutral-300 mb-1.5"
                  >
                    {{ t("settings.security.confirm_password_label") }}
                  </label>
                  <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    :placeholder="t('settings.security.confirm_password')"
                    class="w-full bg-[#242424] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white outline-none focus:border-primary/60"
                  />
                </div>
              </div>

              <p class="text-xs text-neutral-500">
                {{ t("settings.security.password_hint") }}
              </p>
            </div>

            <p v-if="passwordError" class="text-red-400 text-sm mt-3">
              {{ passwordError }}
            </p>
            <p v-if="passwordSuccess" class="text-emerald-400 text-sm mt-3">
              {{ passwordSuccess }}
            </p>

            <div class="mt-4 flex justify-end">
              <button
                class="px-5 py-2 rounded-full bg-primary-500 text-white text-sm font-bold hover:bg-primary-400 transition-colors cursor-pointer disabled:opacity-50"
                :disabled="isChangingPassword"
                @click="changePassword"
              >
                <span v-if="isChangingPassword">{{
                  t("settings.security.updating")
                }}</span>
                <span v-else>{{ t("settings.security.change_password") }}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import authApi from "~/api/authApi";
import userApi from "~/api/userApi";
import { usePlayerStore } from "~/stores/usePlayerStore";

const route = useRoute();
const { user, logout } = useAuth();
const { t, locale, setLocale } = useI18n();
const toast = useToast();
const playerStore = usePlayerStore();
const switchLocalePath = useSwitchLocalePath();

const profile = ref(null);
const selectedLocale = ref(locale.value || "vi");
const isChangingPassword = ref(false);
const passwordError = ref("");
const passwordSuccess = ref("");

const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const profileName = computed(() => {
  return (
    profile.value?.FullName ||
    user.value?.name ||
    t("settings.account.default_user")
  );
});

const profileEmail = computed(() => {
  return profile.value?.Email || user.value?.email || "-";
});

const profileRole = computed(() => {
  return profile.value?.Role || user.value?.role || "User";
});

const repeatModeLabel = computed(() => {
  switch (playerStore.repeatMode) {
    case "all":
      return t("settings.playback.repeat_all");
    case "one":
      return t("settings.playback.repeat_one");
    default:
      return t("settings.playback.repeat_off");
  }
});

const onVolumeInput = (event) => {
  const value = Number(event.target.value || 0);
  playerStore.setVolume(value / 100);
};

const setLocaleCode = async (code) => {
  const normalized = code === "en" ? "en" : "vi";
  selectedLocale.value = normalized;

  const localeCookie = useCookie("i18n_redirected", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  localeCookie.value = normalized;

  if (import.meta.client) {
    localStorage.setItem("app-locale", normalized);
  }

  await setLocale(normalized);
  locale.value = normalized;

  const targetPath = switchLocalePath(normalized);
  if (targetPath && targetPath !== route.fullPath) {
    await navigateTo(targetPath, { replace: true });
  }

  toast.add({
    title: t("notify.success"),
    description: t("settings.language.updated"),
    color: "green",
  });
};

const fetchProfile = async () => {
  try {
    profile.value = await userApi.getUserInfo();
  } catch {
    profile.value = null;
  }
};

const changePassword = async () => {
  passwordError.value = "";
  passwordSuccess.value = "";

  if (
    !passwordForm.currentPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword
  ) {
    passwordError.value = t("settings.security.error_required");
    return;
  }

  if (passwordForm.newPassword.length < 10) {
    passwordError.value = t("settings.security.error_password_short");
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = t("settings.security.error_password_mismatch");
    return;
  }

  isChangingPassword.value = true;
  try {
    const res = await authApi.changePassword({
      CurrentPassword: passwordForm.currentPassword,
      NewPassword: passwordForm.newPassword,
      ConfirmPassword: passwordForm.confirmPassword,
    });

    passwordSuccess.value =
      res?.Message || t("settings.security.changed_success");
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";

    toast.add({
      title: t("notify.success"),
      description: t("settings.security.toast_success"),
      color: "green",
    });
  } catch (error) {
    passwordError.value =
      error?.response?.data?.Message ||
      error?.response?.data?.message ||
      t("settings.security.toast_error");
  } finally {
    isChangingPassword.value = false;
  }
};

const handleLogout = async () => {
  await logout();
};

onMounted(() => {
  selectedLocale.value = locale.value || "vi";
  fetchProfile();
});

watch(
  () => locale.value,
  (newLocale) => {
    selectedLocale.value = newLocale;
  },
);
</script>
