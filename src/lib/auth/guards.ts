import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Profile, UserRole } from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, birth_year, email, role")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

export async function requireProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export function isProfileComplete(profile: Profile) {
  return Boolean(profile.first_name.trim() && profile.last_name.trim() && profile.birth_year);
}

export async function requireCompleteUserProfile() {
  const profile = await requireProfile();

  if (profile.role === "user" && !isProfileComplete(profile)) {
    redirect("/profile?complete=1");
  }

  return profile;
}

export async function requireRole(roles: UserRole[]) {
  const profile = await requireProfile();

  if (!roles.includes(profile.role)) {
    redirect("/dashboard");
  }

  return profile;
}
