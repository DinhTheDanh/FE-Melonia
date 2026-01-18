<template>
  <div class="flex h-screen bg-black text-white overflow-hidden">
    <header
      class="fixed top-0 right-0 left-0 h-16 flex items-center bg-black justify-between px-8 z-50"
    >
      <div class="flex items-center justify-center gap-2">
        <!-- <img
          src="../assets/image/logo-cropped.svg"
          alt="logo"
          class="bg-no-repeat h-8 w-20"
        /> -->
        <NuxtLink
          to="/"
          class="p-2.5 bg-[#1F1F1F] rounded-full flex items-center justify-center hover:bg-neutral-700 cursor-pointer"
        >
          <UIcon
            :name="
              route.path == '/' ? 'i-fa6-solid-house' : 'i-fa6-solid-house'
            "
            class="size-6"
          />
        </NuxtLink>
        <div class="flex items-center bg-[#1F1F1F] rounded-full w-100">
          <UInput
            icon="i-lucide-search"
            size="md"
            variant="ghost"
            class="w-full"
            :ui="{ base: 'hover:bg-transparent focus:bg-transparent' }"
            :placeholder="t('header.search_placeholder')"
          />
          <USeparator orientation="vertical" size="xs" class="h-7" />
          <NuxtLink
            to="/search"
            class="p-2.5 flex items-center justify-center cursor-pointer"
          >
            <UIcon
              :name="
                route.path == '/search'
                  ? 'i-fa6-solid-box-archive'
                  : 'i-lucide-archive'
              "
              class="size-6"
            />
          </NuxtLink>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <UIcon name="i-lucide-bell" class="size-5" />
        <UDropdownMenu
          :arrow="true"
          :trigger="'click'"
          :placement="'bottom-end'"
          :items="items"
          :ui="{
            content: 'w-60',
            item: 'px-4 my-1 py-2 hover:bg-neutral-700 rounded-md ',
          }"
        >
          <UTooltip
            arrow
            :text="data?.FullName"
            :ui="{ content: 'bg-[#1F1F1F]' }"
          >
            <UAvatar
              :src="data?.Avatar"
              :alt="data?.FullName"
              size="md"
              class="cursor-pointer"
            />
          </UTooltip>
        </UDropdownMenu>
      </div>
    </header>

    <UDashboardGroup class="mt-16 bg-[#121212] mx-2 rounded-lg">
      <UDashboardSidebar
        collapsible
        resizable
        v-model:collapsed="collapsed"
        :min-size="18"
        :max-size="25"
        :collapsed-size="0"
        class="group mx-2 border-none group"
      >
        <template #header>
          <div class="flex justify-between items-center w-full py-4">
            <div
              class="flex justify-center items-center gap-2 group cursor-pointer"
            >
              <div @click="collapsed = !collapsed" class="flex items-center">
                <UIcon
                  :name="
                    collapsed
                      ? 'i-lucide-panel-left-open'
                      : 'i-lucide-panel-right-open'
                  "
                  :class="
                    !collapsed
                      ? 'size-5 text-zinc-400 transition-all duration-300 ease-out opacity-0 -translate-x-3 w-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:w-5'
                      : 'size-7 text-zinc-400'
                  "
                  class="hover:text-white"
                />
              </div>

              <span
                :class="collapsed ? 'hidden' : ''"
                class="text-md font-semibold transition-all"
              >
                {{ t("sidebar.library") }}
              </span>
            </div>

            <div
              :class="collapsed ? 'hidden' : ''"
              class="p-1.5 bg-[#1F1F1F] rounded-full flex items-center justify-center hover:bg-neutral-700 cursor-pointer"
            >
              <UIcon name="i-lucide-plus" class="size-5 text-zinc-400" />
            </div>
          </div>
        </template>

        <template #resize-handle="{ onMouseDown, onTouchStart, onDoubleClick }">
          <UDashboardResizeHandle
            class="after:absolute after:inset-y-0 after:right-0 after:w-px hover:after:bg-(--ui-border-accented) after:transition"
            @mousedown="onMouseDown"
            @touchstart="onTouchStart"
            @dblclick="onDoubleClick"
          />
        </template>
      </UDashboardSidebar>

      <div class="flex-1 overflow-y-auto bg-black px-4 pb-28">
        <slot />
      </div>
    </UDashboardGroup>
  </div>

  <div
    class="fixed bottom-0 w-full h-24 bg-black z-50 flex items-center px-6"
  ></div>
</template>

<script setup>
import userApi from "~/api/userApi";
import { ref, onMounted } from "vue";

const route = useRoute();
const data = ref(null);
const toast = useToast();
const { t } = useI18n();

// Lấy độ rộng của sidebar trong storage
const { width } = useSidebarState();

// Dữ liệu của dropdown user
const items = ref([
  {
    label: t("header.profile"),
    to: "/user/profile",
  },
  {
    label: t("header.create_song"),
    to: "/create/song",
  },
  {
    label: t("header.settings"),
    to: "/user/settings",
  },
  {
    label: t("header.logout"),
    action: () => {
      toast.success(t("notify.logout_success"));
      navigateTo("/");
    },
  },
]);
const collapsed = ref(false); // trạng thái thu gọn sidebar

// Lấy dữ liệu user
const fetchUserData = async () => {
  try {
    const response = await userApi.getUserInfo();
    data.value = response;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

onMounted(() => {
  fetchUserData();
});
</script>
