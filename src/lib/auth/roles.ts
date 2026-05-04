import type { Profile } from "@/lib/types";

export function getRoleHomePath(profile: Pick<Profile, "role"> | null) {
  if (profile?.role === "admin") {
    return "/admin";
  }

  if (profile?.role === "scanner") {
    return "/scanner";
  }

  return "/dashboard";
}
