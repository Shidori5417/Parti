"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { generateQrToken } from "@/lib/qr/generate";
import { createClient } from "@/lib/supabase/server";
import { partySchema } from "@/lib/validators/party";
import { assignTicketSchema } from "@/lib/validators/ticket";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createPartyAction(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const parsed = partySchema.safeParse({
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    description: getString(formData, "description"),
    importantNotes: getString(formData, "importantNotes"),
    locationName: getString(formData, "locationName"),
    address: getString(formData, "address"),
    startsAt: getString(formData, "startsAt"),
    endsAt: getString(formData, "endsAt"),
    price: getString(formData, "price"),
    currency: getString(formData, "currency") || "TRY",
    coverImageUrl: getString(formData, "coverImageUrl"),
    status: getString(formData, "status"),
  });

  if (!parsed.success) {
    redirectWithError("/admin/parties/new", parsed.error.issues[0]?.message ?? "Form geçersiz.");
  }

  const input = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("parties").insert({
    title: input.title,
    slug: input.slug,
    description: input.description || null,
    important_notes: input.importantNotes || null,
    location_name: input.locationName,
    address: input.address || null,
    starts_at: new Date(input.startsAt).toISOString(),
    ends_at: input.endsAt ? new Date(input.endsAt).toISOString() : null,
    price: typeof input.price === "number" ? input.price : null,
    currency: input.currency,
    cover_image_url: input.coverImageUrl || null,
    status: input.status,
    created_by: profile.id,
  });

  if (error) {
    redirectWithError("/admin/parties/new", error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/parties");
  redirect("/admin/parties?created=1");
}

export async function updatePartyAction(formData: FormData) {
  await requireRole(["admin"]);
  const partyId = getString(formData, "partyId");
  const parsed = partySchema.safeParse({
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    description: getString(formData, "description"),
    importantNotes: getString(formData, "importantNotes"),
    locationName: getString(formData, "locationName"),
    address: getString(formData, "address"),
    startsAt: getString(formData, "startsAt"),
    endsAt: getString(formData, "endsAt"),
    price: getString(formData, "price"),
    currency: getString(formData, "currency") || "TRY",
    coverImageUrl: getString(formData, "coverImageUrl"),
    status: getString(formData, "status"),
  });

  if (!partyId) {
    redirectWithError("/admin/parties", "Parti bulunamadı.");
  }

  if (!parsed.success) {
    redirectWithError(`/admin/parties/${partyId}/edit`, parsed.error.issues[0]?.message ?? "Form geçersiz.");
  }

  const input = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("parties")
    .update({
      title: input.title,
      slug: input.slug,
      description: input.description || null,
      important_notes: input.importantNotes || null,
      location_name: input.locationName,
      address: input.address || null,
      starts_at: new Date(input.startsAt).toISOString(),
      ends_at: input.endsAt ? new Date(input.endsAt).toISOString() : null,
      price: typeof input.price === "number" ? input.price : null,
      currency: input.currency,
      cover_image_url: input.coverImageUrl || null,
      status: input.status,
    })
    .eq("id", partyId);

  if (error) {
    redirectWithError(`/admin/parties/${partyId}/edit`, error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/parties");
  redirect("/admin/parties?updated=1");
}

export async function updatePartyStatusAction(formData: FormData) {
  await requireRole(["admin"]);
  const partyId = getString(formData, "partyId");
  const status = getString(formData, "status");

  if (!partyId || !["draft", "published", "cancelled"].includes(status)) {
    redirectWithError("/admin/parties", "Parti durumu geçersiz.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("parties").update({ status }).eq("id", partyId);

  if (error) {
    redirectWithError("/admin/parties", error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/parties");
  redirect("/admin/parties?updated=1");
}

export async function assignTicketAction(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const parsed = assignTicketSchema.safeParse({
    partyId: getString(formData, "partyId"),
    userId: getString(formData, "userId"),
    maxEntries: getString(formData, "maxEntries"),
    note: getString(formData, "note"),
  });

  if (!parsed.success) {
    redirectWithError("/admin/tickets/assign", parsed.error.issues[0]?.message ?? "Form geçersiz.");
  }

  const supabase = await createClient();
  const { data: targetUser, error: userError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("id", parsed.data.userId)
    .maybeSingle();

  if (userError || !targetUser) {
    redirectWithError("/admin/tickets/assign", userError?.message ?? "Kullanıcı bulunamadı.");
  }

  const { error } = await supabase.from("tickets").insert({
    party_id: parsed.data.partyId,
    user_id: parsed.data.userId,
    assigned_by: profile.id,
    holder_first_name: targetUser.first_name,
    holder_last_name: targetUser.last_name,
    qr_token: generateQrToken(),
    max_entries: parsed.data.maxEntries,
    used_entries: 0,
    status: "active",
    note: parsed.data.note || null,
  });

  if (error) {
    redirectWithError("/admin/tickets/assign", error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/admin/tickets/assign");
  redirect("/admin/tickets/assign?created=1");
}

export async function revokeTicketAction(formData: FormData) {
  await requireRole(["admin"]);
  const ticketId = getString(formData, "ticketId");

  if (!ticketId) {
    redirectWithError("/admin/tickets", "Bilet bulunamadı.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tickets").update({ status: "revoked" }).eq("id", ticketId);

  if (error) {
    redirectWithError("/admin/tickets", error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/tickets");
  revalidatePath("/dashboard");
  redirect("/admin/tickets?updated=1");
}

export async function updateUserRoleAction(formData: FormData) {
  await requireRole(["admin"]);
  const userId = getString(formData, "userId");
  const role = getString(formData, "role");

  if (!userId || !["user", "admin", "scanner"].includes(role)) {
    redirectWithError("/admin/users", "Rol bilgisi geçersiz.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);

  if (error) {
    redirectWithError("/admin/users", error.message);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?updated=1");
}
