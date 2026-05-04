"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validators/auth";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateProfileAction(formData: FormData) {
  const profile = await requireProfile();
  const parsed = profileSchema.safeParse({
    firstName: readString(formData, "firstName"),
    lastName: readString(formData, "lastName"),
    birthYear: readString(formData, "birthYear"),
  });

  if (!parsed.success) {
    redirect(`/profile?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Form geçersiz.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      birth_year: parsed.data.birthYear ?? null,
    })
    .eq("id", profile.id);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/profile?updated=1");
}
