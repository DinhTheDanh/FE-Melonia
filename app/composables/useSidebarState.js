export const useSidebarState = () => {
  const width = useState("sidebar-width-state", () => 280);

  onMounted(() => {
    const savedWidth = localStorage.getItem("sidebar-width");
    if (savedWidth) {
      width.value = parseInt(savedWidth);
    }
  });

  watch(width, (newWidth) => {
    localStorage.setItem("sidebar-width", newWidth.toString());
  });

  return {
    width,
  };
};
