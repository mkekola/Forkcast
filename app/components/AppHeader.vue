<template>
  <header
    class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
  >
    <NuxtLink to="/" class="text-2xl font-black tracking-tight text-fork-ink">
      Forkcast
    </NuxtLink>

    <nav class="flex flex-wrap items-center gap-2 text-sm font-bold">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="rounded-full px-4 py-2 transition"
        :class="
          isActiveLink(link.to)
            ? 'bg-fork-green text-white'
            : 'text-fork-muted hover:bg-stone-200 hover:text-fork-ink'
        "
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const route = useRoute();

const links = [
  { label: "Reseptit", to: "/" },
  { label: "Suosikit", to: "/favorites" },
  { label: "Viikko", to: "/planner" },
];

function isActiveLink(path: string) {
  if (path === "/") {
    return route.path === "/" || route.path.startsWith("/recipes");
  }

  return route.path.startsWith(path);
}
</script>
