import { defineStore } from "pinia";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    // Current track info
    currentTrack: null,
    queue: [],
    queueIndex: 0,

    // Playback state
    isPlaying: false,
    isLoading: false,
    isShuffle: false,
    repeatMode: "off", // 'off' | 'all' | 'one'

    // Audio state
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    previousVolume: 1,

    // UI state
    isExpanded: false,

    // Flag to track if state was restored from storage
    isRestored: false,
  }),

  getters: {
    hasTrack: (state) => !!state.currentTrack,

    progress: (state) => {
      if (!state.duration) return 0;
      return (state.currentTime / state.duration) * 100;
    },

    canGoPrevious: (state) => {
      return state.queueIndex > 0 || state.currentTime > 3;
    },

    canGoNext: (state) => {
      if (state.isShuffle) return true;
      return (
        state.queueIndex < state.queue.length - 1 || state.repeatMode === "all"
      );
    },

    volumePercent: (state) => {
      return state.isMuted ? 0 : state.volume * 100;
    },
  },

  actions: {
    playTrack(track, queue = null, index = 0) {
      this.currentTrack = track;
      if (queue) {
        this.queue = queue;
        this.queueIndex = index;
      } else {
        this.queue = [track];
        this.queueIndex = 0;
      }
      this.isPlaying = true;
      this.currentTime = 0;
    },

    togglePlay() {
      if (!this.currentTrack) return;
      this.isPlaying = !this.isPlaying;
    },

    play() {
      if (!this.currentTrack) return;
      this.isPlaying = true;
    },

    pause() {
      this.isPlaying = false;
    },

    nextTrack() {
      if (this.repeatMode === "one") {
        this.currentTime = 0;
        this.isPlaying = true;
        return;
      }

      // Shuffle mode - pick random track from queue
      if (this.isShuffle && this.queue.length > 1) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * this.queue.length);
        } while (randomIndex === this.queueIndex && this.queue.length > 1);

        this.queueIndex = randomIndex;
        this.currentTrack = this.queue[this.queueIndex];
        this.currentTime = 0;
        this.isPlaying = true;
        return;
      }

      // Normal mode
      if (this.queueIndex < this.queue.length - 1) {
        this.queueIndex++;
        this.currentTrack = this.queue[this.queueIndex];
        this.currentTime = 0;
        this.isPlaying = true;
      } else if (this.repeatMode === "all" && this.queue.length > 0) {
        this.queueIndex = 0;
        this.currentTrack = this.queue[0];
        this.currentTime = 0;
        this.isPlaying = true;
      } else {
        this.isPlaying = false;
      }
    },

    previousTrack() {
      if (this.currentTime > 3) {
        this.currentTime = 0;
        return;
      }

      // Shuffle mode - pick random track
      if (this.isShuffle && this.queue.length > 1) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * this.queue.length);
        } while (randomIndex === this.queueIndex && this.queue.length > 1);

        this.queueIndex = randomIndex;
        this.currentTrack = this.queue[this.queueIndex];
        this.currentTime = 0;
        this.isPlaying = true;
        return;
      }

      if (this.queueIndex > 0) {
        this.queueIndex--;
        this.currentTrack = this.queue[this.queueIndex];
        this.currentTime = 0;
        this.isPlaying = true;
      } else if (this.repeatMode === "all" && this.queue.length > 0) {
        this.queueIndex = this.queue.length - 1;
        this.currentTrack = this.queue[this.queueIndex];
        this.currentTime = 0;
        this.isPlaying = true;
      } else {
        this.currentTime = 0;
      }
    },

    seek(value, isPercentage = true) {
      if (isPercentage) {
        this.currentTime = (value / 100) * this.duration;
      } else {
        this.currentTime = value;
      }
    },

    updateTime(time) {
      this.currentTime = time;
    },

    updateDuration(duration) {
      this.duration = duration;
    },

    setVolume(value) {
      this.volume = Math.max(0, Math.min(1, value));
      if (this.volume > 0) {
        this.isMuted = false;
      }
    },

    toggleMute() {
      if (this.isMuted) {
        this.isMuted = false;
        this.volume = this.previousVolume || 0.5;
      } else {
        this.previousVolume = this.volume;
        this.isMuted = true;
      }
    },

    toggleShuffle() {
      this.isShuffle = !this.isShuffle;
    },

    cycleRepeatMode() {
      const modes = ["off", "all", "one"];
      const currentIndex = modes.indexOf(this.repeatMode);
      this.repeatMode = modes[(currentIndex + 1) % modes.length];
    },

    addToQueue(track) {
      this.queue.push(track);
    },

    clearQueue() {
      this.queue = this.currentTrack ? [this.currentTrack] : [];
      this.queueIndex = 0;
    },

    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
    },

    setLoading(value) {
      this.isLoading = value;
    },

    onTrackEnd() {
      this.nextTrack();
    },

    // Called after hydration from localStorage
    setRestored() {
      this.isRestored = true;
      // Don't auto-play on restore, user must click play
      this.isPlaying = false;
    },
  },

  // Persist state to localStorage
  persist: {
    key: "music-player",
    pick: [
      "currentTrack",
      "queue",
      "queueIndex",
      "currentTime",
      "duration",
      "volume",
      "isMuted",
      "previousVolume",
      "isShuffle",
      "repeatMode",
    ],
  },
});
