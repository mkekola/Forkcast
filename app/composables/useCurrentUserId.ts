// The anonymous sign-in plugin resolves before the app mounts, but this is a
// safety net for anything that queries Supabase before that finishes.
export function useCurrentUserId() {
  const user = useSupabaseUser();

  if (user.value) {
    return Promise.resolve(user.value.sub);
  }

  return new Promise<string>((resolve) => {
    const stop = watch(user, (value) => {
      if (value) {
        stop();
        resolve(value.sub);
      }
    });
  });
}
