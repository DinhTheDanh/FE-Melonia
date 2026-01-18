<template>
  <div class=" ">
    <div
      class="relative h-69 flex rounded-lg overflow-hidden p-6 gap-4 bg-[#121212]"
    >
      <div class="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <img
          :src="data?.Avatar"
          class="w-full h-full object-cover blur-3xl opacity-50 scale-[5]"
        />
        <div
          class="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"
        ></div>
      </div>

      <div class="relative z-10 flex items-center gap-4 w-full">
        <div class="relative group cursor-pointer" @click="openEditModal">
          <UAvatar
            :src="data?.Avatar"
            :alt="data?.FullName"
            :ui="{ root: 'w-56 h-56 shadow-2xl bg-neutral-800' }"
          />

          <div
            class="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div class="flex flex-col items-center text-white">
              <UIcon name="i-lucide-camera" class="size-8 mb-1" />
              <span class="text-sm font-medium">{{
                $t("profile.choose_image")
              }}</span>
            </div>
          </div>
        </div>
        <div class="flex flex-col justify-start text-white drop-shadow-md">
          <div class="text-base ml-2 font-medium">
            {{ $t("header.profile") }}
          </div>
          <div class="text-8xl font-bold mt-2">{{ data?.FullName }}</div>
        </div>
      </div>
    </div>

    <div
      class="fixed top-0 left-0 right-0 bottom-0 z-999 w-full flex items-center justify-center bg-black/10 backdrop-blur-sm"
      v-if="isOpen"
    >
      <div>
        <div class="p-6 bg-[#282828] rounded-lg w-96">
          <h3 class="text-xl font-bold mb-4 text-white">
            {{ $t("profile.detail_profile") }}
          </h3>

          <input
            type="file"
            ref="fileInputRef"
            class="hidden"
            accept="image/*"
            @change="onFileSelected"
          />

          <div class="flex items-center gap-6">
            <div
              class="relative group cursor-pointer shrink-0"
              @click="triggerFileInput"
            >
              <UAvatar
                :src="previewUrl || data?.Avatar"
                size="3xl"
                class="w-32 h-32 ring-4 ring-neutral-800 shadow-xl object-cover"
              />
              <div
                class="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <UIcon name="i-lucide-camera" class="size-8 text-white" />
              </div>
            </div>

            <div class="flex-1 space-y-4">
              <div class="space-y-1">
                <UInput
                  v-model="editName"
                  size="lg"
                  color="white"
                  variant="outline"
                  :ui="{
                    base: 'bg-[#3E3E3E] text-white ring-gray-700 focus:ring-gray-500',
                  }"
                >
                </UInput>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <UButton
              color="gray"
              variant="ghost"
              @click="isOpen = false"
              class="cursor-pointer"
            >
              {{ $t("profile.cancel") }}
            </UButton>
            <UButton
              color="secondary"
              :loading="isLoading"
              @click="handleSaveAvatar"
              class="cursor-pointer bg-white hover:bg-gray-200"
            >
              {{ $t("profile.save") }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import userApi from "~/api/userApi";
import fileApi from "~/api/fileApi"; // Import fileApi bạn cung cấp
import { ref, onMounted } from "vue";

const data = ref(null);
const toast = useToast();

const isOpen = ref(false); // Đóng/Mở popup
const fileInputRef = ref(null); // Ref để chọc vào thẻ input file ẩn
const selectedFile = ref(null); // File người dùng chọn
const previewUrl = ref(null); // URL preview ảnh (blob)
const isLoading = ref(false); // Trạng thái đang upload
const editName = ref("");

const openEditModal = () => {
  previewUrl.value = null;
  selectedFile.value = null;
  editName.value = data.value?.FullName;
  isOpen.value = true;
};

const triggerFileInput = () => {
  fileInputRef.value.click();
};

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.match("image.*")) {
    toast.add({
      title: "Lỗi",
      description: "Vui lòng chọn file hình ảnh",
      color: "red",
    });
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const handleSaveAvatar = async () => {
  if (!selectedFile.value) {
    isOpen.value = false;
    return;
  }

  try {
    isLoading.value = true;

    const formData = new FormData();
    formData.append("file", selectedFile.value);

    const uploadRes = await fileApi.uploadImage(formData);

    const newAvatarUrl = uploadRes.Url;

    const updatePayload = {
      ...data.value,
      Avatar: newAvatarUrl,
      FullName: editName.value,
    };

    await userApi.updateProfile(updatePayload);

    data.value.Avatar = newAvatarUrl;
    toast.add({
      title: "Thành công",
      description: "Đổi ảnh đại diện thành công!",
      color: "green",
    });
    isOpen.value = false;
  } catch (error) {
    console.error(error);
    toast.add({
      title: "Thất bại",
      description: "Có lỗi xảy ra khi cập nhật ảnh.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

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
