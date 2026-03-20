<template>
  <div class="min-h-screen pb-8 px-6">
    <div class="mt-6 mb-8">
      <h1 class="text-3xl font-bold text-white">
        {{ t("analytics.dashboard_title") }}
      </h1>
      <p class="text-neutral-400 mt-1">
        {{ t("analytics.dashboard_subtitle") }}
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <UIcon
        name="i-lucide-loader-2"
        class="size-8 text-neutral-400 animate-spin"
      />
    </div>

    <div
      v-else-if="!isUnlocked"
      class="bg-[#181818] border border-white/10 rounded-2xl p-8 max-w-3xl"
    >
      <div
        class="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-5"
      >
        <UIcon name="i-lucide-lock" class="size-7" />
      </div>
      <h2 class="text-2xl font-bold text-white mb-2">
        {{ t("analytics.lock_title") }}
      </h2>
      <p class="text-neutral-300 leading-relaxed mb-6">
        {{ t("analytics.lock_desc") }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="rounded-xl bg-[#121212] border border-white/5 p-4">
          <p class="text-xs uppercase tracking-wider text-neutral-500 mb-1">
            {{ t("analytics.current_plan") }}
          </p>
          <p class="text-white font-semibold">
            {{ activePlanName || t("analytics.no_active_plan") }}
          </p>
        </div>
        <div class="rounded-xl bg-[#121212] border border-white/5 p-4">
          <p class="text-xs uppercase tracking-wider text-neutral-500 mb-1">
            {{ t("analytics.plan_duration") }}
          </p>
          <p class="text-white font-semibold">
            {{ activePlanDuration || 0 }} {{ t("pricing.months") }}
          </p>
        </div>
      </div>

      <NuxtLink
        to="/pricing"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full transition-colors"
      >
        <UIcon name="i-lucide-crown" class="size-5" />
        {{ t("analytics.upgrade_cta") }}
      </NuxtLink>
    </div>

    <div v-else>
      <div class="flex items-center gap-2 mb-5">
        <span class="text-sm text-neutral-400 mr-2">{{
          t("analytics.period")
        }}</span>
        <button
          v-for="period in periods"
          :key="period"
          class="px-3 py-1.5 rounded-full text-sm border transition-colors cursor-pointer"
          :class="
            selectedDays === period
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-neutral-300 border-white/20 hover:border-white/40 hover:text-white'
          "
          @click="changePeriod(period)"
        >
          {{ period }} {{ t("analytics.days") }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <div
          v-for="card in statsCards"
          :key="card.label"
          class="bg-[#181818] border border-white/8 rounded-xl p-5"
        >
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-neutral-400">{{ card.label }}</p>
            <UIcon :name="card.icon" class="size-5" :class="card.iconColor" />
          </div>
          <p class="text-2xl font-bold text-white">
            {{ formatNumber(card.value) }}
          </p>
          <p v-if="card.hint" class="text-xs text-neutral-500 mt-1">
            {{ card.hint }}
          </p>
        </div>
      </div>

      <div
        v-if="trendError"
        class="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-300 text-sm"
      >
        {{ t("analytics.trend_api_missing") }}
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div
          v-for="chart in chartCards"
          :key="chart.key"
          class="bg-[#181818] border border-white/8 rounded-xl p-5"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm text-neutral-400">{{ chart.label }}</p>
              <p class="text-xl font-bold text-white mt-1">
                {{ formatNumber(chart.total) }}
              </p>
            </div>
            <span
              class="text-xs px-2 py-1 rounded-full"
              :class="
                chart.delta >= 0
                  ? 'bg-primary/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              "
            >
              {{ chart.delta >= 0 ? "+" : "" }}{{ formatNumber(chart.delta) }}
            </span>
          </div>

          <div v-if="chart.points.length >= 2" class="h-36">
            <svg
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              class="w-full h-full"
            >
              <defs>
                <linearGradient
                  :id="`${chart.key}-fill`"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    :stop-color="chart.color"
                    stop-opacity="0.35"
                  />
                  <stop
                    offset="100%"
                    :stop-color="chart.color"
                    stop-opacity="0"
                  />
                </linearGradient>
              </defs>

              <polyline
                :points="chart.polyline"
                :stroke="chart.color"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <path :d="chart.area" :fill="`url(#${chart.key}-fill)`" />
            </svg>
          </div>

          <div
            v-else
            class="h-36 rounded-lg border border-dashed border-white/15 flex items-center justify-center text-sm text-neutral-500"
          >
            {{ t("analytics.no_trend_data") }}
          </div>
        </div>
      </div>

      <div
        class="mt-6 bg-[#181818] border border-white/8 rounded-xl overflow-hidden"
      >
        <div
          class="px-5 py-4 border-b border-white/8 flex items-center justify-between"
        >
          <h3 class="text-white font-semibold text-lg">
            {{ t("analytics.top_songs_title") }}
          </h3>
          <span class="text-xs text-neutral-500">
            {{ t("analytics.period_days", { days: selectedDays }) }}
          </span>
        </div>

        <div v-if="topSongsLoading" class="flex justify-center py-12">
          <UIcon
            name="i-lucide-loader-2"
            class="size-6 text-neutral-400 animate-spin"
          />
        </div>

        <div
          v-else-if="topSongs.length === 0"
          class="py-12 text-center text-neutral-500 text-sm"
        >
          {{ t("analytics.no_top_songs") }}
        </div>

        <table v-else class="w-full table-fixed">
          <thead>
            <tr
              class="text-left text-neutral-400 text-xs uppercase border-b border-white/8"
            >
              <th class="px-5 py-3 w-16">#</th>
              <th class="px-5 py-3">{{ t("analytics.song") }}</th>
              <th class="px-5 py-3 w-32">{{ t("analytics.listens") }}</th>
              <th class="px-5 py-3 w-32">{{ t("analytics.likes") }}</th>
              <th class="px-5 py-3 w-40">
                {{ t("analytics.followers_gained") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(song, index) in topSongs"
              :key="song.SongId || song.Id || index"
              class="border-b border-white/5 last:border-0 hover:bg-white/4"
            >
              <td class="px-5 py-3 text-sm text-neutral-400">
                {{ index + 1 }}
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    v-if="song.Thumbnail"
                    :src="song.Thumbnail"
                    :alt="song.Title"
                    class="w-10 h-10 rounded object-cover shrink-0"
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded bg-[#282828] flex items-center justify-center shrink-0"
                  >
                    <UIcon
                      name="i-lucide-music"
                      class="size-4 text-neutral-500"
                    />
                  </div>
                  <p class="text-white text-sm font-medium truncate">
                    {{ song.Title || "-" }}
                  </p>
                </div>
              </td>
              <td class="px-5 py-3 text-sm text-neutral-300">
                {{ formatNumber(song.Listens) }}
              </td>
              <td class="px-5 py-3 text-sm text-neutral-300">
                {{ formatNumber(song.Likes) }}
              </td>
              <td class="px-5 py-3 text-sm text-neutral-300">
                {{ formatNumber(song.FollowersGained) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import paymentApi from "~/api/paymentApi";
import musicApi from "~/api/musicApi";
import artistApi from "~/api/artistApi";
import analyticsApi from "~/api/analyticsApi";

definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const { user } = useAuth();

const loading = ref(true);
const trendError = ref(false);
const topSongsLoading = ref(false);

const periods = [7, 30, 90];
const selectedDays = ref(30);

const plans = ref([]);
const activeSubscription = ref(null);

const followersTotal = ref(0);
const totalSongs = ref(0);
const totalListens = ref(0);
const totalLikes = ref(0);

const trendRows = ref([]);
const topSongs = ref([]);

const activePlanName = computed(() => activeSubscription.value?.PlanName || "");

const activePlanDuration = computed(() => {
  if (!activeSubscription.value) return 0;

  const planFromList = plans.value.find(
    (plan) => plan.PlanId === activeSubscription.value?.PlanId,
  );

  return (
    planFromList?.DurationMonths ||
    activeSubscription.value?.DurationMonths ||
    0
  );
});

const isUnlocked = computed(() => activePlanDuration.value >= 6);

const statsCards = computed(() => [
  {
    label: t("analytics.total_followers"),
    value: followersTotal.value,
    icon: "i-lucide-users",
    iconColor: "text-blue-400",
    hint: t("analytics.followers_hint"),
  },
  {
    label: t("analytics.total_songs"),
    value: totalSongs.value,
    icon: "i-lucide-music",
    iconColor: "text-purple-400",
    hint: "",
  },
  {
    label: t("analytics.total_listens"),
    value: totalListens.value,
    icon: "i-lucide-headphones",
    iconColor: "text-emerald-400",
    hint: t("analytics.listens_hint"),
  },
  {
    label: t("analytics.total_likes"),
    value: totalLikes.value,
    icon: "i-lucide-heart",
    iconColor: "text-rose-400",
    hint: t("analytics.likes_hint"),
  },
]);

const buildChartGeometry = (values) => {
  if (!Array.isArray(values) || values.length < 2) {
    return {
      points: [],
      polyline: "",
      area: "",
      delta: 0,
      total: values?.at(-1) || 0,
    };
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const normalized = (value - min) / range;
    const y = 36 - normalized * 30;
    return { x, y, value };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `M ${points[0].x},36 L ${polyline.replace(/ /g, " L ")} L ${points[points.length - 1].x},36 Z`;

  return {
    points,
    polyline,
    area,
    delta: values.at(-1) - values[0],
    total: values.at(-1),
  };
};

const chartCards = computed(() => {
  const followersSeries = trendRows.value.map((row) =>
    Number(row.Followers || 0),
  );
  const listensSeries = trendRows.value.map((row) => Number(row.Listens || 0));
  const likesSeries = trendRows.value.map((row) => Number(row.Likes || 0));

  const followersGeometry = buildChartGeometry(followersSeries);
  const listensGeometry = buildChartGeometry(listensSeries);
  const likesGeometry = buildChartGeometry(likesSeries);

  return [
    {
      key: "followers",
      label: t("analytics.follower_growth"),
      color: "#60A5FA",
      ...followersGeometry,
    },
    {
      key: "listens",
      label: t("analytics.listen_growth"),
      color: "#34D399",
      ...listensGeometry,
    },
    {
      key: "likes",
      label: t("analytics.like_growth"),
      color: "#F472B6",
      ...likesGeometry,
    },
  ];
});

const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

const changePeriod = async (days) => {
  if (selectedDays.value === days || loading.value) return;
  selectedDays.value = days;
  await Promise.all([loadTrends(), loadTopSongs()]);
};

const loadSubscriptionGate = async () => {
  const [plansRes, activeRes] = await Promise.allSettled([
    paymentApi.getPlans(),
    paymentApi.getActiveSubscription(),
  ]);

  plans.value =
    plansRes.status === "fulfilled"
      ? plansRes.value?.Data || plansRes.value || []
      : [];

  activeSubscription.value =
    activeRes.status === "fulfilled"
      ? activeRes.value?.Data || activeRes.value || null
      : null;
};

const loadBaseStats = async () => {
  const [songsRes, artistsRes] = await Promise.allSettled([
    musicApi.getMySongs({ pageIndex: 1, pageSize: 200 }),
    artistApi.getArtists({ pageIndex: 1, pageSize: 200 }),
  ]);

  const songs =
    songsRes.status === "fulfilled"
      ? songsRes.value?.Data || songsRes.value || []
      : [];

  totalSongs.value = songs.length;
  totalListens.value = songs.reduce(
    (sum, song) => sum + Number(song.ListenCount || song.PlayCount || 0),
    0,
  );
  totalLikes.value = songs.reduce(
    (sum, song) => sum + Number(song.LikeCount || 0),
    0,
  );

  if (artistsRes.status === "fulfilled") {
    const artists = artistsRes.value?.Data || artistsRes.value || [];
    const myArtist = artists.find(
      (artist) =>
        String(artist.UserId || artist.Id || artist.ArtistId) ===
        String(user.value?.id),
    );

    followersTotal.value = Number(myArtist?.FollowerCount || 0);
    totalListens.value = Math.max(
      totalListens.value,
      Number(myArtist?.TotalListens || 0),
    );
    totalLikes.value = Math.max(
      totalLikes.value,
      Number(myArtist?.TotalLikes || 0),
    );
  }
};

const loadTrends = async () => {
  trendError.value = false;

  try {
    const response = await analyticsApi.getAdvancedDashboard({
      days: selectedDays.value,
    });
    const data = response?.Data || response || {};
    const trends = data?.Trends || data?.Trend || data?.Daily || [];

    const summary = data?.Summary || {};
    followersTotal.value = Number(
      summary.TotalFollowers || summary.Followers || followersTotal.value || 0,
    );
    totalListens.value = Number(
      summary.TotalListens || summary.Listens || totalListens.value || 0,
    );
    totalLikes.value = Number(
      summary.TotalLikes || summary.Likes || totalLikes.value || 0,
    );
    totalSongs.value = Number(
      summary.TotalSongs || summary.Songs || totalSongs.value || 0,
    );

    trendRows.value = Array.isArray(trends)
      ? trends.map((item) => ({
          Date: item.Date || item.Day || item.Label,
          Followers: Number(item.Followers || item.FollowerCount || 0),
          Listens: Number(item.Listens || item.TotalListens || 0),
          Likes: Number(item.Likes || item.TotalLikes || 0),
        }))
      : [];
  } catch {
    trendRows.value = [];
    trendError.value = true;
  }
};

const loadTopSongs = async () => {
  topSongsLoading.value = true;

  try {
    const response = await analyticsApi.getTopSongs({
      days: selectedDays.value,
      pageIndex: 1,
      pageSize: 10,
    });

    const rows = response?.Data || response?.Items || response || [];
    topSongs.value = Array.isArray(rows)
      ? rows.map((item) => ({
          SongId: item.SongId || item.Id,
          Title: item.Title,
          Thumbnail: item.Thumbnail,
          Listens: Number(item.Listens || item.ListenCount || 0),
          Likes: Number(item.Likes || item.LikeCount || 0),
          FollowersGained: Number(item.FollowersGained || 0),
        }))
      : [];
  } catch {
    topSongs.value = [];
  } finally {
    topSongsLoading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;

  try {
    await loadSubscriptionGate();
    await loadBaseStats();

    if (isUnlocked.value) {
      await Promise.all([loadTrends(), loadTopSongs()]);
    }
  } finally {
    loading.value = false;
  }
});
</script>
