export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  if (user.value) {
    return;
  }

  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error("Anonymous sign-in failed", error);
  }
});
