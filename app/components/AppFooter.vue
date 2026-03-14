<template>
  <footer class="mt-16 px-8 pb-10 pt-8 border-t border-white/10">
    <!-- Links Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
      <!-- Column 1 - Company -->
      <div>
        <h3 class="text-base font-bold text-white mb-4">
          {{ t("footer.company") }}
        </h3>
        <ul class="space-y-2.5">
          <li>
            <a
              href="#"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              {{ t("footer.about") }}
            </a>
          </li>
          <li>
            <a
              href="#"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              {{ t("footer.jobs") }}
            </a>
          </li>
          <li>
            <a
              href="#"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              {{ t("footer.for_the_record") }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Column 2 - Community -->
      <div>
        <h3 class="text-base font-bold text-white mb-4">
          {{ t("footer.community") }}
        </h3>
        <ul class="space-y-2.5">
          <li>
            <a
              href="#"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              {{ t("footer.for_artists") }}
            </a>
          </li>
          <li>
            <a
              href="#"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              {{ t("footer.developers") }}
            </a>
          </li>
          <li>
            <a
              href="#"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              {{ t("footer.advertising") }}
            </a>
          </li>
          <li>
            <a
              href="#"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              {{ t("footer.investors") }}
            </a>
          </li>
          <li>
            <a
              href="#"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              {{ t("footer.vendors") }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Column 3 - Useful Links -->
      <div>
        <h3 class="text-base font-bold text-white mb-4">
          {{ t("footer.useful_links") }}
        </h3>
        <ul class="space-y-2.5">
          <li>
            <a
              href="#"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              {{ t("footer.support") }}
            </a>
          </li>
          <li>
            <a
              href="#"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              {{ t("footer.free_mobile_app") }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Column 4 - Plans -->
      <div>
        <h3 class="text-base font-bold text-white mb-4">
          {{ t("footer.plans") }}
        </h3>
        <ul class="space-y-2.5">
          <li>
            <NuxtLink
              to="/pricing"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              Premium Individual
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/pricing"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              Premium Student
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/pricing"
              class="text-sm text-neutral-400 hover:text-white hover:underline transition-colors"
            >
              Melonia Free
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Social icons -->
    <div class="flex items-center gap-4 mb-8">
      <a
        href="#"
        class="w-10 h-10 rounded-full bg-[#292929] hover:bg-[#727272] flex items-center justify-center transition-colors"
      >
        <UIcon name="i-simple-icons-instagram" class="size-4 text-white" />
      </a>
      <a
        href="#"
        class="w-10 h-10 rounded-full bg-[#292929] hover:bg-[#727272] flex items-center justify-center transition-colors"
      >
        <UIcon name="i-simple-icons-twitter" class="size-4 text-white" />
      </a>
      <a
        href="#"
        class="w-10 h-10 rounded-full bg-[#292929] hover:bg-[#727272] flex items-center justify-center transition-colors"
      >
        <UIcon name="i-simple-icons-facebook" class="size-4 text-white" />
      </a>
    </div>

    <!-- Divider -->
    <div class="border-t border-white/10 pt-6">
      <!-- Bottom row -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
          <a href="#" class="hover:text-white transition-colors">{{
            t("footer.legal")
          }}</a>
          <a href="#" class="hover:text-white transition-colors">{{
            t("footer.safety_privacy")
          }}</a>
          <a href="#" class="hover:text-white transition-colors">{{
            t("footer.privacy_policy")
          }}</a>
          <a href="#" class="hover:text-white transition-colors">Cookie</a>
          <a href="#" class="hover:text-white transition-colors">{{
            t("footer.about_ads")
          }}</a>
          <a href="#" class="hover:text-white transition-colors">{{
            t("footer.accessibility")
          }}</a>
        </div>
        <p class="text-xs text-neutral-400">&copy; 2026 Melonia AB</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const { t } = useI18n();
</script>
