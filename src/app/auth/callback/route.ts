import { NextResponse, type NextRequest } from "next/server";
import { isProfileComplete } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

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

      if (profile && (profile as Profile).role === "user" && !isProfileComplete(profile as Profile)) {
        return NextResponse.redirect(new URL("/profile?complete=1", request.url));
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
