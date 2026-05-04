import { NextResponse, type NextRequest } from "next/server";
import { isProfileComplete } from "@/lib/auth/guards";
import { getRoleHomePath } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, birth_year, email, role")
        .eq("id", user.id)
        .maybeSingle();

      const currentProfile = profile as Profile | null;

      if (currentProfile?.role === "user" && !isProfileComplete(currentProfile)) {
        return NextResponse.redirect(new URL("/profile?complete=1", request.url));
      }

      return NextResponse.redirect(new URL(next ?? getRoleHomePath(currentProfile), request.url));
    }
  }

  return NextResponse.redirect(new URL(next ?? "/login", request.url));
}
