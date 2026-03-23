<template>
  <div class="min-h-screen pb-8 px-6">
    <!-- Header -->
    <div class="mt-6 mb-8">
      <h1 class="text-3xl font-bold text-white">{{ t("admin.dashboard") }}</h1>
      <p class="text-neutral-400 mt-1">{{ t("admin.dashboard_desc") }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div
        v-for="stat in statsCards"
        :key="stat.label"
        class="bg-[#181818] hover:bg-[#1f1f1f] rounded-xl p-5 transition-colors"
      >
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :class="stat.bgColor"
          >
            <UIcon :name="stat.icon" class="size-5" :class="stat.iconColor" />
          </div>
        </div>
        <p class="text-2xl font-bold text-white">
          {{ formatStat(stat.value) }}
        </p>
        <p class="text-sm text-neutral-400 mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-[#181818] rounded-lg p-1 mb-6 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
        :class="
          activeTab === tab.key
            ? 'bg-[#282828] text-white'
            : 'text-neutral-400 hover:text-white hover:bg-white/5'
        "
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="bg-[#181818] rounded-xl overflow-hidden">
      <!-- Search bar -->
      <div
        class="p-4 border-b border-white/5 flex items-center justify-between"
      >
        <div class="relative w-80">
          <UIcon
            name="i-lucide-search"
            class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400"
          />
          <input
            v-model="searchKeyword"
            type="text"
            :placeholder="t('admin.search_placeholder')"
            class="w-full h-9 bg-[#242424] text-white text-sm pl-9 pr-4 rounded-lg border border-transparent focus:border-white/20 outline-none placeholder:text-neutral-500 transition-all"
          />
        </div>
        <!-- Add Genre button (only on genres tab) -->
        <button
          v-if="activeTab === 'genres'"
          class="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-400 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          @click="openAddGenre"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          {{ t("admin.add_genre") }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-16">
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 text-neutral-400 animate-spin"
        />
      </div>

      <!-- Users Tab -->
      <div v-else-if="activeTab === 'users'">
        <table class="w-full table-fixed">
          <thead>
            <tr
              class="text-left text-neutral-400 text-xs uppercase border-b border-white/5"
            >
              <th class="px-4 py-3 w-14">#</th>
              <th class="px-4 py-3 w-[24%]">{{ t("admin.user_name") }}</th>
              <th class="px-4 py-3 w-[24%]">{{ t("admin.email") }}</th>
              <th class="px-4 py-3 w-[14%]">{{ t("admin.role") }}</th>
              <th class="px-4 py-3 w-[16%]">{{ t("admin.joined") }}</th>
              <th class="px-4 py-3 w-[16%]">{{ t("admin.actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(u, index) in displayData"
              :key="u.UserId || u.Id"
              class="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="u.AvatarUrl"
                    :src="u.AvatarUrl"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center"
                  >
                    <UIcon
                      name="i-lucide-user"
                      class="size-4 text-neutral-500"
                    />
                  </div>
                  <span class="text-white text-sm font-medium">{{
                    u.FullName || u.UserName || "—"
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-neutral-300 text-sm truncate">
                {{ u.Email || "—" }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="text-xs font-medium px-2 py-1 rounded-full"
                  :class="getRoleBadgeClass(u.Role)"
                >
                  {{ u.Role || "User" }}
                </span>
              </td>
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ formatDate(u.CreatedAt) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <!-- Set Role -->
                  <UDropdownMenu
                    :items="getRoleMenuItems(u)"
                    :ui="{
                      content: 'w-40 bg-[#282828] border-none shadow-xl p-1',
                      item: 'flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white rounded-sm cursor-pointer transition-colors',
                    }"
                  >
                    <button
                      class="text-neutral-400 hover:text-blue-400 transition-colors cursor-pointer"
                      :title="t('admin.set_role')"
                    >
                      <UIcon name="i-lucide-shield" class="size-4" />
                    </button>
                  </UDropdownMenu>
                  <!-- Ban -->
                  <button
                    class="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                    :title="t('admin.ban_user')"
                    @click="confirmAction('ban', u)"
                  >
                    <UIcon name="i-lucide-ban" class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="displayData.length === 0">
              <td colspan="6" class="px-4 py-12 text-center text-neutral-500">
                {{ t("admin.no_data") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Artists Tab -->
      <div v-else-if="activeTab === 'artists'">
        <table class="w-full table-fixed">
          <thead>
            <tr
              class="text-left text-neutral-400 text-xs uppercase border-b border-white/5"
            >
              <th class="px-4 py-3 w-14">#</th>
              <th class="px-4 py-3 w-[26%]">{{ t("admin.artist_name") }}</th>
              <th class="px-4 py-3 w-[26%]">{{ t("admin.email") }}</th>
              <th class="px-4 py-3 w-[12%]">{{ t("admin.songs_count") }}</th>
              <th class="px-4 py-3 w-[12%]">{{ t("admin.followers") }}</th>
              <th class="px-4 py-3 w-[16%]">{{ t("admin.joined") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(artist, index) in displayData"
              :key="artist.UserId || artist.Id || artist.ArtistId"
              class="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="artist.AvatarUrl || artist.Thumbnail"
                    :src="artist.AvatarUrl || artist.Thumbnail"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center"
                  >
                    <UIcon
                      name="i-lucide-music"
                      class="size-4 text-neutral-500"
                    />
                  </div>
                  <span class="text-white text-sm font-medium">{{
                    artist.FullName || artist.ArtistName || "—"
                  }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-neutral-300 text-sm truncate">
                {{ artist.Email || "—" }}
              </td>
              <td class="px-4 py-3 text-neutral-300 text-sm">
                {{ artist.SongCount ?? artist.TotalSongs ?? "—" }}
              </td>
              <td class="px-4 py-3 text-neutral-300 text-sm">
                {{ artist.FollowerCount ?? artist.Followers ?? "—" }}
              </td>
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ formatDate(artist.CreatedAt) }}
              </td>
            </tr>
            <tr v-if="displayData.length === 0">
              <td colspan="6" class="px-4 py-12 text-center text-neutral-500">
                {{ t("admin.no_data") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Songs Tab -->
      <div v-else-if="activeTab === 'songs'">
        <table class="w-full table-fixed">
          <thead>
            <tr
              class="text-left text-neutral-400 text-xs uppercase border-b border-white/5"
            >
              <th class="px-4 py-3 w-14">#</th>
              <th class="px-4 py-3 w-[30%]">{{ t("admin.song_title") }}</th>
              <th class="px-4 py-3 w-[24%]">{{ t("admin.artist_name") }}</th>
              <th class="px-4 py-3 w-[12%]">{{ t("admin.listens") }}</th>
              <th class="px-4 py-3 w-[12%]">{{ t("admin.likes") }}</th>
              <th class="px-4 py-3 w-20">{{ t("admin.actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(song, index) in displayData"
              :key="song.Id || song.SongId"
              class="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="song.Thumbnail"
                    :src="song.Thumbnail"
                    class="w-8 h-8 rounded object-cover"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded bg-[#282828] flex items-center justify-center"
                  >
                    <UIcon
                      name="i-lucide-music"
                      class="size-4 text-neutral-500"
                    />
                  </div>
                  <span
                    class="text-white text-sm font-medium truncate max-w-64"
                    >{{ song.Title || "—" }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-3 text-neutral-300 text-sm">
                {{ song.ArtistNames || song.ArtistName || "—" }}
              </td>
              <td class="px-4 py-3 text-neutral-300 text-sm">
                {{ formatStat(song.ListenCount || 0) }}
              </td>
              <td class="px-4 py-3 text-neutral-300 text-sm">
                {{ formatStat(song.LikeCount || 0) }}
              </td>
              <td class="px-4 py-3">
                <button
                  class="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  :title="t('admin.delete')"
                  @click="confirmAction('deleteSong', song)"
                >
                  <UIcon name="i-lucide-trash-2" class="size-4" />
                </button>
              </td>
            </tr>
            <tr v-if="displayData.length === 0">
              <td colspan="6" class="px-4 py-12 text-center text-neutral-500">
                {{ t("admin.no_data") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Genres Tab -->
      <div v-else-if="activeTab === 'genres'">
        <table class="w-full table-fixed">
          <thead>
            <tr
              class="text-left text-neutral-400 text-xs uppercase border-b border-white/5"
            >
              <th class="px-4 py-3 w-14">#</th>
              <th class="px-4 py-3 w-16">{{ t("admin.genre_image") }}</th>
              <th class="px-4 py-3 w-[40%]">{{ t("admin.genre_name") }}</th>
              <th class="px-4 py-3 w-[20%]">ID</th>
              <th class="px-4 py-3 w-24">{{ t("admin.actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(genre, index) in displayData"
              :key="genre.Id || genre.GenreId"
              class="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="px-4 py-3">
                <img
                  v-if="genre.ImageUrl"
                  :src="genre.ImageUrl"
                  class="w-10 h-10 rounded object-cover"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded bg-[#282828] flex items-center justify-center"
                >
                  <UIcon
                    name="i-lucide-music"
                    class="size-4 text-neutral-500"
                  />
                </div>
              </td>
              <td class="px-4 py-3 text-white text-sm font-medium">
                {{ genre.Name || "—" }}
              </td>
              <td class="px-4 py-3 text-neutral-500 text-xs font-mono truncate">
                {{ genre.Id || genre.GenreId || "—" }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <button
                    class="text-neutral-400 hover:text-blue-400 transition-colors cursor-pointer"
                    :title="t('admin.edit_genre')"
                    @click="openEditGenre(genre)"
                  >
                    <UIcon name="i-lucide-pencil" class="size-4" />
                  </button>
                  <button
                    class="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                    :title="t('admin.delete_genre')"
                    @click="confirmAction('deleteGenre', genre)"
                  >
                    <UIcon name="i-lucide-trash-2" class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="displayData.length === 0">
              <td colspan="5" class="px-4 py-12 text-center text-neutral-500">
                {{ t("admin.no_data") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Subscriptions Tab -->
      <div v-else-if="activeTab === 'subscriptions'">
        <table class="w-full table-fixed">
          <thead>
            <tr
              class="text-left text-neutral-400 text-xs uppercase border-b border-white/5"
            >
              <th class="px-4 py-3 w-14">#</th>
              <th class="px-4 py-3 w-[24%]">{{ t("admin.user_name") }}</th>
              <th class="px-4 py-3 w-[16%]">{{ t("admin.plan") }}</th>
              <th class="px-4 py-3 w-[14%]">{{ t("admin.status") }}</th>
              <th class="px-4 py-3 w-[18%]">{{ t("admin.start_date") }}</th>
              <th class="px-4 py-3 w-[18%]">{{ t("admin.end_date") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(sub, index) in displayData"
              :key="sub.SubscriptionId || sub.Id"
              class="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="px-4 py-3 text-white text-sm">
                {{ sub.UserName || sub.FullName || "—" }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="text-xs font-medium px-2 py-1 rounded-full"
                  :class="getPlanBadgeClass(sub.PlanName)"
                  >{{ sub.PlanName || "—" }}</span
                >
              </td>
              <td class="px-4 py-3">
                <span
                  class="text-xs font-medium px-2 py-1 rounded-full"
                  :class="getStatusBadgeClass(sub.Status)"
                  >{{ sub.Status || "—" }}</span
                >
              </td>
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ formatDate(sub.StartDate) }}
              </td>
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ formatDate(sub.EndDate) }}
              </td>
            </tr>
            <tr v-if="displayData.length === 0">
              <td colspan="6" class="px-4 py-12 text-center text-neutral-500">
                {{ t("admin.no_data") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Payments Tab -->
      <div v-else-if="activeTab === 'payments'">
        <table class="w-full table-fixed">
          <thead>
            <tr
              class="text-left text-neutral-400 text-xs uppercase border-b border-white/5"
            >
              <th class="px-4 py-3 w-14">#</th>
              <th class="px-4 py-3 w-[18%]">{{ t("admin.user_name") }}</th>
              <th class="px-4 py-3 w-[12%]">{{ t("admin.amount") }}</th>
              <th class="px-4 py-3 w-[12%]">{{ t("admin.plan") }}</th>
              <th class="px-4 py-3 w-[12%]">{{ t("admin.status") }}</th>
              <th class="px-4 py-3 w-[14%]">{{ t("admin.date") }}</th>
              <th class="px-4 py-3 w-[18%]">{{ t("admin.actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(payment, index) in displayData"
              :key="payment.PaymentId || payment.Id"
              class="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="px-4 py-3 text-white text-sm">
                {{ payment.UserName || payment.FullName || "—" }}
              </td>
              <td class="px-4 py-3 text-white text-sm font-medium">
                {{ formatCurrency(payment.Amount) }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="text-xs font-medium px-2 py-1 rounded-full"
                  :class="getPlanBadgeClass(payment.PlanName)"
                  >{{ payment.PlanName || "—" }}</span
                >
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <span
                    class="text-xs font-medium px-2 py-1 rounded-full w-fit"
                    :class="getPaymentStatusClass(payment.Status)"
                    >{{ payment.Status || "—" }}</span
                  >
                  <span
                    v-if="
                      payment.Status === 'Pending' &&
                      getPendingDays(payment.CreatedAt) > 0
                    "
                    class="text-xs text-amber-500"
                  >
                    {{ getPendingDays(payment.CreatedAt) }}d pending
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-neutral-400 text-sm">
                {{ formatDate(payment.CreatedAt) }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <template v-if="payment.Status === 'Pending'">
                    <button
                      class="text-neutral-400 hover:text-green-400 transition-colors cursor-pointer"
                      :title="t('admin.approve')"
                      @click="confirmAction('approvePayment', payment)"
                    >
                      <UIcon name="i-lucide-check-circle" class="size-4" />
                    </button>
                    <button
                      class="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      :title="t('admin.reject')"
                      @click="confirmAction('rejectPayment', payment)"
                    >
                      <UIcon name="i-lucide-x-circle" class="size-4" />
                    </button>
                    <button
                      class="text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                      :title="t('admin.send_reminder')"
                      @click="confirmAction('sendReminder', payment)"
                    >
                      <UIcon name="i-lucide-bell-ring" class="size-4" />
                    </button>
                    <button
                      v-if="getPendingDays(payment.CreatedAt) >= 15"
                      class="text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                      :title="t('admin.cancel_payment')"
                      @click="confirmAction('cancelPayment', payment)"
                    >
                      <UIcon name="i-lucide-timer-off" class="size-4" />
                    </button>
                  </template>
                  <UDropdownMenu
                    v-if="payment.Status !== 'Pending'"
                    :items="getPaymentStatusMenuItems(payment)"
                    :ui="{
                      content: 'w-44 bg-[#282828] border-none shadow-xl p-1',
                      item: 'flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white rounded-sm cursor-pointer transition-colors',
                    }"
                  >
                    <button
                      class="text-neutral-400 hover:text-blue-400 transition-colors cursor-pointer"
                      :title="t('admin.status')"
                    >
                      <UIcon name="i-lucide-arrow-left-right" class="size-4" />
                    </button>
                  </UDropdownMenu>
                </div>
              </td>
            </tr>
            <tr v-if="displayData.length === 0">
              <td colspan="7" class="px-4 py-12 text-center text-neutral-500">
                {{ t("admin.no_data") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="flex flex-col items-center gap-2 px-4 py-3 border-t border-white/5"
      >
        <p class="text-sm text-neutral-400">
          {{ t("admin.showing") }} {{ showingFrom }}–{{ showingTo }}
          {{ t("admin.of") }} {{ displayTotalItems }}
        </p>
        <div class="flex items-center gap-1">
          <button
            class="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            :disabled="currentPage <= 1"
            @click="currentPage--"
          >
            <UIcon name="i-lucide-chevron-left" class="size-4" />
          </button>
          <template v-for="page in paginationRange" :key="page">
            <span v-if="page === '...'" class="px-2 text-neutral-500 text-sm"
              >...</span
            >
            <button
              v-else
              class="w-8 h-8 rounded-md text-sm font-medium transition-colors cursor-pointer"
              :class="
                page === currentPage
                  ? 'bg-white text-black'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              "
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </template>
          <button
            class="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            :disabled="currentPage >= totalPages"
            @click="currentPage++"
          >
            <UIcon name="i-lucide-chevron-right" class="size-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="confirmModalState.show"
        class="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center"
        @click.self="confirmModalState.show = false"
      >
        <div class="bg-[#282828] rounded-xl p-6 w-full max-w-md shadow-2xl">
          <h3 class="text-lg font-bold text-white mb-2">
            {{ t("admin.confirm_action") }}
          </h3>
          <p class="text-neutral-300 text-sm mb-6">
            {{ confirmModalState.message }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-sm text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              @click="confirmModalState.show = false"
            >
              {{ t("admin.confirm_cancel") }}
            </button>
            <button
              class="px-4 py-2 text-sm text-white bg-primary-500 hover:bg-primary-400 rounded-lg transition-colors cursor-pointer"
              @click="executeConfirmedAction"
            >
              {{ t("admin.confirm_yes") }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Genre Add/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="genreModal.show"
        class="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center"
        @click.self="genreModal.show = false"
      >
        <div class="bg-[#282828] rounded-xl p-6 w-full max-w-md shadow-2xl">
          <h3 class="text-lg font-bold text-white mb-4">
            {{
              genreModal.isEdit ? t("admin.edit_genre") : t("admin.add_genre")
            }}
          </h3>
          <div class="space-y-4">
            <div>
              <label class="text-sm text-neutral-400 block mb-1.5">{{
                t("admin.genre_name")
              }}</label>
              <input
                v-model="genreModal.name"
                type="text"
                :placeholder="t('admin.genre_name_placeholder')"
                class="w-full h-10 bg-[#1F1F1F] text-white text-sm px-4 rounded-lg border border-white/10 focus:border-white/30 outline-none placeholder:text-neutral-500 transition-all"
              />
            </div>
            <div>
              <label class="text-sm text-neutral-400 block mb-1.5">{{
                t("admin.genre_image")
              }}</label>
              <!-- Image upload area -->
              <div
                class="relative w-full rounded-lg border-2 border-dashed transition-all cursor-pointer overflow-hidden"
                :class="
                  genreModal.imageUrl
                    ? 'border-transparent'
                    : 'border-white/10 hover:border-white/20'
                "
                @click="$refs.genreImageInput.click()"
              >
                <!-- Preview -->
                <div v-if="genreModal.imageUrl" class="relative group">
                  <img
                    :src="genreModal.imageUrl"
                    class="w-full h-40 object-cover rounded-lg"
                  />
                  <div
                    class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                  >
                    <div class="text-center">
                      <UIcon
                        name="i-lucide-image-plus"
                        class="size-6 text-white mx-auto mb-1"
                      />
                      <p class="text-xs text-white/80">
                        {{ t("admin.change_image") }}
                      </p>
                    </div>
                  </div>
                </div>
                <!-- Empty state -->
                <div
                  v-else
                  class="flex flex-col items-center justify-center py-8 px-4"
                >
                  <div
                    class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3"
                  >
                    <UIcon
                      name="i-lucide-image-plus"
                      class="size-6 text-neutral-400"
                    />
                  </div>
                  <p class="text-sm text-neutral-400 font-medium">
                    {{ t("admin.upload_genre_image") }}
                  </p>
                  <p class="text-xs text-neutral-500 mt-1">PNG, JPG, WEBP</p>
                </div>
              </div>
              <input
                ref="genreImageInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleGenreImageUpload"
              />
              <!-- Upload progress -->
              <div v-if="genreModal.uploading" class="mt-2">
                <div class="flex items-center gap-2">
                  <div
                    class="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-[#1DB954] rounded-full transition-all duration-300"
                      :style="{ width: genreModal.uploadProgress + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs text-neutral-400 w-10 text-right"
                    >{{ genreModal.uploadProgress }}%</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="px-4 py-2 text-sm text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              @click="genreModal.show = false"
            >
              {{ t("admin.confirm_cancel") }}
            </button>
            <button
              class="px-4 py-2 text-sm text-white bg-primary-500 hover:bg-primary-400 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              :disabled="!genreModal.name?.trim() || genreModal.uploading"
              @click="saveGenre"
            >
              {{
                genreModal.isEdit ? t("admin.edit_genre") : t("admin.add_genre")
              }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import adminApi from "~/api/adminApi";
import musicApi from "~/api/musicApi";
import artistApi from "~/api/artistApi";
import fileApi from "~/api/fileApi";

const { t } = useI18n();
const { user } = useAuth();
const toast = useToast();

onMounted(() => {
  if (user.value?.role !== "Admin") navigateTo("/");
});

// State
const activeTab = ref("users");
const searchKeyword = ref("");
const debouncedSearchKeyword = ref("");
let adminSearchTimer = null;
watch(searchKeyword, (val) => {
  clearTimeout(adminSearchTimer);
  adminSearchTimer = setTimeout(() => {
    debouncedSearchKeyword.value = val;
  }, 300);
});
const isLoading = ref(false);
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);
const tabData = ref([]);
const searchSourceData = ref([]);
const scrollMainToTop = useMainScrollTop();

const stats = ref({
  totalUsers: 0,
  totalArtists: 0,
  totalSongs: 0,
  totalSubscriptions: 0,
  totalGenres: 0,
});

const tabs = computed(() => [
  { key: "users", label: t("admin.users") },
  { key: "artists", label: t("admin.artists") },
  { key: "songs", label: t("admin.songs") },
  { key: "genres", label: t("admin.genres") },
  { key: "subscriptions", label: t("admin.subscriptions") },
  { key: "payments", label: t("admin.payments") },
]);

const statsCards = computed(() => [
  {
    label: t("admin.total_users"),
    value: stats.value.totalUsers,
    icon: "i-lucide-users",
    bgColor: "bg-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    label: t("admin.total_artists"),
    value: stats.value.totalArtists,
    icon: "i-lucide-mic-2",
    bgColor: "bg-purple-500/20",
    iconColor: "text-purple-400",
  },
  {
    label: t("admin.total_songs"),
    value: stats.value.totalSongs,
    icon: "i-lucide-music",
    bgColor: "bg-primary/20",
    iconColor: "text-green-400",
  },
  {
    label: t("admin.total_genres"),
    value: stats.value.totalGenres,
    icon: "i-lucide-tag",
    bgColor: "bg-pink-500/20",
    iconColor: "text-pink-400",
  },
  {
    label: t("admin.total_subs"),
    value: stats.value.totalSubscriptions,
    icon: "i-lucide-crown",
    bgColor: "bg-amber-500/20",
    iconColor: "text-amber-400",
  },
]);

const filteredData = computed(() => {
  const source = debouncedSearchKeyword.value.trim()
    ? searchSourceData.value
    : tabData.value;
  if (!debouncedSearchKeyword.value.trim()) return source;
  const q = debouncedSearchKeyword.value.toLowerCase().trim();
  return source.filter((item) => {
    const fields = [
      item.FullName,
      item.UserName,
      item.Email,
      item.ArtistName,
      item.Title,
      item.Name,
      item.PlanName,
      item.Status,
      item.Role,
    ];
    return fields.some((f) => f && String(f).toLowerCase().includes(q));
  });
});

const isSearchMode = computed(() => !!debouncedSearchKeyword.value.trim());

const displayTotalItems = computed(() =>
  isSearchMode.value ? filteredData.value.length : totalItems.value,
);

const displayData = computed(() => {
  if (!isSearchMode.value) {
    // Genres data is loaded as a full array, so paginate client-side.
    if (activeTab.value === "genres") {
      const start = (currentPage.value - 1) * pageSize;
      return filteredData.value.slice(start, start + pageSize);
    }
    return filteredData.value;
  }

  const start = (currentPage.value - 1) * pageSize;
  return filteredData.value.slice(start, start + pageSize);
});

const showingFrom = computed(() => {
  if (displayTotalItems.value === 0) return 0;
  return (currentPage.value - 1) * pageSize + 1;
});

const showingTo = computed(() =>
  Math.min(currentPage.value * pageSize, displayTotalItems.value),
);

const totalPages = computed(
  () => Math.ceil(displayTotalItems.value / pageSize) || 1,
);
const paginationRange = computed(() => {
  const total = totalPages.value,
    current = currentPage.value,
    pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    )
      pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
});

// Formatters
const formatStat = (num) => {
  if (num == null) return "0";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return String(num);
};
const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("vi-VN");
  } catch {
    return d;
  }
};
const formatCurrency = (a) => {
  if (!a) return "0₫";
  return Number(a).toLocaleString("vi-VN") + "₫";
};
const getErrorMessage = (error) => {
  return (
    error?.Message ||
    error?.message ||
    error?.response?.data?.Message ||
    error?.response?.data?.message ||
    t("admin.action_failed")
  );
};
const getSongId = (song) => {
  return (
    String(
      song?.SongId ||
        song?.Id ||
        song?.songId ||
        song?.songID ||
        song?.ID ||
        "",
    ).trim() || null
  );
};
const getPendingDays = (d) => {
  if (!d) return 0;
  return Math.floor((new Date() - new Date(d)) / 864e5);
};

const getRoleBadgeClass = (r) => {
  switch (r) {
    case "Admin":
      return "bg-red-500/20 text-red-400";
    case "ArtistPremium":
      return "bg-amber-500/20 text-amber-400";
    case "Artist":
      return "bg-purple-500/20 text-purple-400";
    default:
      return "bg-neutral-500/20 text-neutral-400";
  }
};
const getPlanBadgeClass = (p) => {
  if (!p) return "bg-neutral-500/20 text-neutral-400";
  if (p.includes("Year") || p.includes("Năm"))
    return "bg-amber-500/20 text-amber-400";
  if (p.includes("6") || p.includes("Tháng"))
    return "bg-purple-500/20 text-purple-400";
  return "bg-blue-500/20 text-blue-400";
};
const getStatusBadgeClass = (s) => {
  switch (s) {
    case "Active":
      return "bg-primary/20 text-green-400";
    case "Expired":
      return "bg-red-500/20 text-red-400";
    case "Cancelled":
      return "bg-neutral-500/20 text-neutral-400";
    default:
      return "bg-blue-500/20 text-blue-400";
  }
};
const getPaymentStatusClass = (s) => {
  switch (s) {
    case "Success":
    case "Completed":
      return "bg-primary/20 text-green-400";
    case "Pending":
      return "bg-amber-500/20 text-amber-400";
    case "Failed":
    case "Rejected":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-neutral-500/20 text-neutral-400";
  }
};

// ========================
// Confirmation Modal
// ========================
const confirmModalState = ref({
  show: false,
  message: "",
  action: null,
  data: null,
});

const confirmAction = (action, data) => {
  const msgs = {
    ban: t("admin.confirm_ban_user"),
    deleteSong: t("admin.confirm_delete_song"),
    deleteGenre: t("admin.confirm_delete_genre"),
    approvePayment: t("admin.confirm_approve_payment"),
    rejectPayment: t("admin.confirm_reject_payment"),
    sendReminder: t("admin.send_reminder") + "?",
    cancelPayment: t("admin.cancel_payment") + "?",
    setRole: data?.message || "",
    updatePaymentStatus: data?.message || "",
  };
  confirmModalState.value = {
    show: true,
    message: msgs[action] || t("admin.confirm_action"),
    action,
    data: data?.payload || data,
  };
};

const executeConfirmedAction = async () => {
  const { action, data } = confirmModalState.value;
  confirmModalState.value.show = false;
  try {
    switch (action) {
      case "ban":
        await adminApi.toggleUserBan(data.UserId || data.Id);
        toast.add({
          title: t("notify.success"),
          description: t("admin.user_updated"),
          color: "green",
        });
        break;
      case "deleteSong":
        {
          const songId = getSongId(data);
          if (!songId) {
            throw new Error("Không tìm thấy songId hợp lệ để xóa");
          }
          try {
            await adminApi.deleteSong(songId);
          } catch (adminDeleteError) {
            await musicApi.deleteSong(songId);
            console.warn(
              "Admin delete endpoint failed, fallback to Music/song delete:",
              adminDeleteError,
            );
          }
        }
        toast.add({
          title: t("notify.success"),
          description: t("admin.song_deleted"),
          color: "green",
        });
        break;
      case "deleteGenre":
        await adminApi.deleteGenre(data.Id || data.GenreId);
        toast.add({
          title: t("notify.success"),
          description: t("admin.genre_deleted"),
          color: "green",
        });
        break;
      case "approvePayment":
        await adminApi.approvePayment(data.PaymentId || data.Id);
        toast.add({
          title: t("notify.success"),
          description: t("admin.payment_approved"),
          color: "green",
        });
        break;
      case "rejectPayment":
        await adminApi.rejectPayment(data.PaymentId || data.Id);
        toast.add({
          title: t("notify.success"),
          description: t("admin.payment_rejected"),
          color: "green",
        });
        break;
      case "sendReminder":
        await adminApi.sendNotification(data.UserId, {
          Title: "Payment Reminder",
          Message:
            "You have a pending payment for " +
            (data.PlanName || "Premium") +
            ". Please complete your payment.",
          Type: "payment_reminder",
        });
        toast.add({
          title: t("notify.success"),
          description: t("admin.reminder_sent"),
          color: "green",
        });
        break;
      case "cancelPayment":
        await adminApi.rejectPayment(data.PaymentId || data.Id);
        await adminApi.sendNotification(data.UserId, {
          Title: "Payment Cancelled",
          Message:
            "Your pending payment for " +
            (data.PlanName || "Premium") +
            " has been cancelled (exceeded 15 days).",
          Type: "payment_expired",
        });
        toast.add({
          title: t("notify.success"),
          description: t("admin.payment_cancelled"),
          color: "green",
        });
        break;
      case "setRole":
        await adminApi.setUserRole(data.userId, data.role);
        toast.add({
          title: t("notify.success"),
          description: t("admin.role_updated"),
          color: "green",
        });
        break;
      case "updatePaymentStatus":
        await adminApi.updatePaymentStatus(data.paymentId, data.status);
        toast.add({
          title: t("notify.success"),
          description: t("admin.payment_status_updated"),
          color: "green",
        });
        break;
    }
    if (isSearchMode.value) {
      await fetchSearchSourceData();
    } else {
      await fetchTabData();
    }
    if (action === "deleteSong" || action === "deleteGenre") {
      await fetchStats();
    }
  } catch (error) {
    toast.add({
      title: t("notify.error"),
      description: getErrorMessage(error),
      color: "red",
    });
  }
};

// ========================
// Role Menu
// ========================
const getRoleMenuItems = (userData) => {
  const roles = ["User", "Artist", "ArtistPremium", "Admin"];
  return roles
    .filter((r) => r !== userData.Role)
    .map((role) => ({
      label: role,
      icon:
        role === "Admin"
          ? "i-lucide-shield"
          : role.includes("Artist")
            ? "i-lucide-mic-2"
            : "i-lucide-user",
      onSelect: () =>
        confirmAction("setRole", {
          message: t("admin.confirm_set_role", { role }),
          payload: { userId: userData.UserId || userData.Id, role },
        }),
    }));
};

// ========================
// Payment Status Menu
// ========================
const getPaymentStatusMenuItems = (payment) => {
  return ["Pending", "Success", "Failed", "Rejected"]
    .filter((s) => s !== payment.Status)
    .map((status) => ({
      label: status,
      onSelect: () =>
        confirmAction("updatePaymentStatus", {
          message: t("admin.confirm_update_status", { status }),
          payload: { paymentId: payment.PaymentId || payment.Id, status },
        }),
    }));
};

// ========================
// Genre Modal
// ========================
const genreModal = ref({
  show: false,
  isEdit: false,
  id: null,
  name: "",
  imageUrl: "",
  uploading: false,
  uploadProgress: 0,
});
const openAddGenre = () => {
  genreModal.value = {
    show: true,
    isEdit: false,
    id: null,
    name: "",
    imageUrl: "",
    uploading: false,
    uploadProgress: 0,
  };
};
const openEditGenre = (g) => {
  genreModal.value = {
    show: true,
    isEdit: true,
    id: g.Id || g.GenreId,
    name: g.Name || "",
    imageUrl: g.ImageUrl || "",
    uploading: false,
    uploadProgress: 0,
  };
};

const handleGenreImageUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    toast.add({
      title: t("notify.error"),
      description: t("admin.invalid_image_type"),
      color: "red",
    });
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.add({
      title: t("notify.error"),
      description: t("admin.image_too_large"),
      color: "red",
    });
    return;
  }
  genreModal.value.uploading = true;
  genreModal.value.uploadProgress = 0;
  try {
    const res = await fileApi.uploadImage(file, (progress) => {
      genreModal.value.uploadProgress = progress;
    });
    const url =
      res?.Url || res?.url || res?.SecureUrl || res?.secure_url || res;
    if (url && typeof url === "string") {
      genreModal.value.imageUrl = url;
    } else {
      throw new Error("No URL returned");
    }
    toast.add({
      title: t("notify.success"),
      description: t("admin.image_uploaded"),
      color: "green",
    });
  } catch (error) {
    toast.add({
      title: t("notify.error"),
      description: t("admin.image_upload_failed"),
      color: "red",
    });
  } finally {
    genreModal.value.uploading = false;
    event.target.value = "";
  }
};

const saveGenre = async () => {
  const { isEdit, id, name, imageUrl } = genreModal.value;
  if (!name?.trim()) return;
  try {
    const payload = { Name: name.trim() };
    if (imageUrl?.trim()) payload.ImageUrl = imageUrl.trim();
    if (isEdit) {
      await adminApi.updateGenre(id, payload);
      toast.add({
        title: t("notify.success"),
        description: t("admin.genre_updated"),
        color: "green",
      });
    } else {
      await adminApi.createGenre(payload);
      toast.add({
        title: t("notify.success"),
        description: t("admin.genre_created"),
        color: "green",
      });
    }
    genreModal.value.show = false;
    await fetchTabData();
    await fetchStats();
  } catch (error) {
    toast.add({
      title: t("notify.error"),
      description: getErrorMessage(error),
      color: "red",
    });
  }
};

// ========================
// Data Fetching
// ========================
const parseTotalItems = (res, fallbackLength = 0) => {
  return (
    res?.TotalRecords ||
    res?.TotalCount ||
    res?.Total ||
    res?.TotalItems ||
    res?.Pagination?.TotalRecords ||
    res?.Pagination?.TotalCount ||
    fallbackLength ||
    0
  );
};

const getTabResponse = async (tab, params) => {
  switch (tab) {
    case "users":
      return await adminApi.getUsers(params).catch(() => null);
    case "artists":
      return await adminApi
        .getArtists(params)
        .catch(
          async () => await artistApi.getArtists(params).catch(() => null),
        );
    case "songs":
      return await adminApi
        .getSongs(params)
        .catch(async () => await musicApi.getSongs(params).catch(() => null));
    case "genres":
      return await adminApi.getGenres().catch(() => null);
    case "subscriptions":
      return await adminApi.getSubscriptions(params).catch(() => null);
    case "payments":
      return await adminApi.getPayments(params).catch(() => null);
    default:
      return null;
  }
};

const normalizeTabItems = (tab, res) => {
  if (!res) return [];
  if (tab === "genres") {
    return Array.isArray(res) ? res : res?.Data || [];
  }
  return res?.Data || res?.Items || (Array.isArray(res) ? res : []);
};

const fetchAllPagesForSearch = async () => {
  if (activeTab.value === "genres") {
    const res = await getTabResponse("genres", {});
    return normalizeTabItems("genres", res);
  }

  const fetchPageSize = 100;
  const maxPages = 50;

  const firstRes = await getTabResponse(activeTab.value, {
    pageIndex: 1,
    pageSize: fetchPageSize,
  });
  const firstItems = normalizeTabItems(activeTab.value, firstRes);
  const total = parseTotalItems(firstRes, firstItems.length);
  const totalPagesToFetch = Math.max(
    1,
    Math.min(Math.ceil(total / fetchPageSize), maxPages),
  );

  if (totalPagesToFetch <= 1) return firstItems;

  const restResponses = await Promise.all(
    Array.from({ length: totalPagesToFetch - 1 }, (_, index) =>
      getTabResponse(activeTab.value, {
        pageIndex: index + 2,
        pageSize: fetchPageSize,
      }),
    ),
  );

  const restItems = restResponses
    .filter(Boolean)
    .flatMap((res) => normalizeTabItems(activeTab.value, res));

  return [...firstItems, ...restItems];
};

const fetchTabData = async () => {
  isLoading.value = true;
  const params = { pageIndex: currentPage.value, pageSize };
  try {
    const res = await getTabResponse(activeTab.value, params);
    if (res) {
      if (activeTab.value === "genres") {
        const arr = normalizeTabItems("genres", res);
        tabData.value = arr;
        totalItems.value = arr.length;
      } else {
        tabData.value = normalizeTabItems(activeTab.value, res);
        totalItems.value = parseTotalItems(res, tabData.value.length);
      }
    } else {
      tabData.value = [];
      totalItems.value = 0;
    }
  } catch (error) {
    console.error("Admin fetch error:", error);
    tabData.value = [];
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const fetchSearchSourceData = async () => {
  if (!isSearchMode.value) {
    searchSourceData.value = [];
    return;
  }

  isLoading.value = true;
  try {
    searchSourceData.value = await fetchAllPagesForSearch();
  } catch (error) {
    console.error("Admin search fetch error:", error);
    searchSourceData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const res = await adminApi.getDashboardStats().catch(() => null);
    if (res) {
      stats.value = {
        totalUsers: res.TotalUsers || res.totalUsers || 0,
        totalArtists: res.TotalArtists || res.totalArtists || 0,
        totalSongs: res.TotalSongs || res.totalSongs || 0,
        totalSubscriptions:
          res.TotalSubscriptions || res.totalSubscriptions || 0,
        totalGenres: res.TotalGenres || res.totalGenres || 0,
      };
    }
  } catch (error) {
    console.error("Error fetching stats:", error);
  }

  try {
    const [usersRes, artistsRes, songsRes, genresRes, subscriptionsRes] =
      await Promise.all([
        adminApi.getUsers({ pageIndex: 1, pageSize: 1 }).catch(() => null),
        artistApi.getArtists({ pageIndex: 1, pageSize: 1 }).catch(() => null),
        musicApi.getSongs({ pageIndex: 1, pageSize: 1 }).catch(() => null),
        musicApi.getGenres().catch(() => null),
        adminApi
          .getSubscriptions({ pageIndex: 1, pageSize: 1 })
          .catch(() => null),
      ]);

    if (usersRes) {
      stats.value.totalUsers =
        usersRes.TotalRecords || usersRes.TotalCount || stats.value.totalUsers;
    }
    if (artistsRes) {
      stats.value.totalArtists =
        artistsRes.TotalRecords ||
        artistsRes.TotalCount ||
        stats.value.totalArtists;
    }
    if (songsRes) {
      stats.value.totalSongs =
        songsRes.TotalRecords || songsRes.TotalCount || stats.value.totalSongs;
    }
    if (genresRes) {
      stats.value.totalGenres = (
        Array.isArray(genresRes) ? genresRes : genresRes?.Data || []
      ).length;
    }
    if (subscriptionsRes) {
      stats.value.totalSubscriptions =
        subscriptionsRes.TotalRecords ||
        subscriptionsRes.TotalCount ||
        stats.value.totalSubscriptions;
    }
  } catch {
    /* ignore */
  }
};

watch(activeTab, () => {
  currentPage.value = 1;
  scrollMainToTop();
  searchKeyword.value = "";
  debouncedSearchKeyword.value = "";
  searchSourceData.value = [];
  fetchTabData();
});
watch(currentPage, () => {
  scrollMainToTop();
  if (!isSearchMode.value) {
    fetchTabData();
  }
});
watch(debouncedSearchKeyword, async () => {
  currentPage.value = 1;
  scrollMainToTop();
  if (!isSearchMode.value) {
    await fetchTabData();
    return;
  }
  await fetchSearchSourceData();
});
onMounted(() => {
  fetchStats();
  fetchTabData();
});
</script>
