import type { Ref } from "vue";

// Shared by every full-screen overlay (the recipe popup, drafts drawer,
// shopping list drawer) to lock page scroll while open and restore it on
// close/unmount. Takes a ref or getter rather than always locking on mount,
// since some callers only want the lock conditionally (the drafts drawer
// unlocks mid-drag, so dragging a draft onto a day below the fold can still
// auto-scroll the page underneath).
export function useBodyScrollLock(isLocked: Ref<boolean> | (() => boolean)) {
  if (!import.meta.client) {
    return;
  }

  watch(
    isLocked,
    (locked) => {
      document.body.style.overflow = locked ? "hidden" : "";
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    document.body.style.overflow = "";
  });
}
