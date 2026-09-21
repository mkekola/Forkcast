import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useBodyScrollLock } from "~/composables/useBodyScrollLock";

// useBodyScrollLock relies on watch()/onBeforeUnmount(), which only work
// inside a component's setup, so a tiny host component is needed to
// exercise it rather than calling it directly.
function mountWithLock(isLocked: ReturnType<typeof ref<boolean>> | (() => boolean)) {
  const Host = defineComponent({
    setup() {
      useBodyScrollLock(isLocked);
      return () => h("div");
    },
  });

  return mount(Host);
}

describe("useBodyScrollLock", () => {
  it("locks body scroll immediately when the ref starts true", () => {
    mountWithLock(ref(true));

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("leaves scroll unlocked when the ref starts false", () => {
    mountWithLock(ref(false));

    expect(document.body.style.overflow).toBe("");
  });

  it("unlocks scroll when the ref toggles back to false", async () => {
    const isLocked = ref(true);
    mountWithLock(isLocked);
    expect(document.body.style.overflow).toBe("hidden");

    isLocked.value = false;
    await nextTick();

    expect(document.body.style.overflow).toBe("");
  });

  it("restores scroll on unmount even while still locked", () => {
    const wrapper = mountWithLock(ref(true));
    expect(document.body.style.overflow).toBe("hidden");

    wrapper.unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("also works with a getter function instead of a ref", async () => {
    const dragging = ref(false);
    const open = ref(true);
    mountWithLock(() => open.value && !dragging.value);

    expect(document.body.style.overflow).toBe("hidden");

    dragging.value = true;
    await nextTick();

    expect(document.body.style.overflow).toBe("");
  });
});
