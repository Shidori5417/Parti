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

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function safeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uploadPartyCoverImage({
  formData,
  ownerId,
  redirectPath,
}: {
  formData: FormData;
  ownerId: string;
  redirectPath: string;
}) {
  const file = getFile(formData, "coverImageFile");

  if (!file) {
    return getString(formData, "coverImageUrl");
  }

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

  if (!allowedTypes.has(file.type)) {
    redirectWithError(redirectPath, "Kapak görseli JPG, PNG veya WebP olmalı.");
  }

  if (file.size > 5 * 1024 * 1024) {
    redirectWithError(redirectPath, "Kapak görseli en fazla 5 MB olabilir.");
  }

  const supabase = await createClient();
  const fileName = safeFileName(file.name) || "cover-image";
  const path = `${ownerId}/${crypto.randomUUID()}-${fileName}`;
  const { error } = await supabase.storage.from("party-images").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    redirectWithError(redirectPath, error.message);
  }

  const { data } = supabase.storage.from("party-images").getPublicUrl(path);
  return data.publicUrl;
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
  const coverImageUrl = await uploadPartyCoverImage({
    formData,
    ownerId: profile.id,
    redirectPath: "/admin/parties/new",
  });
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
    cover_image_url: coverImageUrl || input.coverImageUrl || null,
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
  const profile = await requireRole(["admin"]);
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
  const coverImageUrl = await uploadPartyCoverImage({
    formData,
    ownerId: profile.id,
    redirectPath: `/admin/parties/${partyId}/edit`,
  });
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
      cover_image_url: coverImageUrl || input.coverImageUrl || null,
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
