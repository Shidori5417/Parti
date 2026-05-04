import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { Party } from "@/lib/types";
import { updatePartyAction } from "../../../actions";

export const dynamic = "force-dynamic";

function toInputDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}

export default async function EditPartyPage({
  params,
  searchParams,
}: {
  params: Promise<{ partyId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ partyId }, query, profile] = await Promise.all([params, searchParams, requireRole(["admin"])]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("parties")
    .select("id,title,slug,description,important_notes,location_name,address,starts_at,ends_at,price,currency,cover_image_url,status")
    .eq("id", partyId)
    .maybeSingle();
  const party = data as Party | null;

  if (!party) {
    notFound();
  }

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Partiyi Düzenle</h1>
        <Card className="mt-6">
          {query.error && <p className="mb-5 rounded-md bg-red-500/10 p-3 text-sm text-red-200">{query.error}</p>}
          <form action={updatePartyAction} className="grid gap-4" encType="multipart/form-data">
            <input name="partyId" type="hidden" value={party.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-zinc-300">Parti adı
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="title" defaultValue={party.title} required />
              </label>
              <label className="text-sm font-medium text-zinc-300">Slug
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="slug" defaultValue={party.slug} required />
              </label>
            </div>
            <label className="text-sm font-medium text-zinc-300">Açıklama
              <textarea className="mt-2 min-h-28 w-full rounded-md border border-white/10 bg-white/10 px-3 py-3 text-white outline-none focus:border-fuchsia-400" name="description" defaultValue={party.description ?? ""} />
            </label>
            <label className="text-sm font-medium text-zinc-300">Önemli notlar
              <textarea className="mt-2 min-h-24 w-full rounded-md border border-white/10 bg-white/10 px-3 py-3 text-white outline-none focus:border-fuchsia-400" name="importantNotes" defaultValue={party.important_notes ?? ""} />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-zinc-300">Mekan
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="locationName" defaultValue={party.location_name ?? ""} required />
              </label>
              <label className="text-sm font-medium text-zinc-300">Adres
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="address" defaultValue={party.address ?? ""} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-zinc-300">Başlangıç
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="startsAt" type="datetime-local" defaultValue={toInputDate(party.starts_at)} required />
              </label>
              <label className="text-sm font-medium text-zinc-300">Bitiş
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="endsAt" type="datetime-local" defaultValue={toInputDate(party.ends_at)} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-zinc-300">Fiyat
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="price" type="number" min="0" step="0.01" defaultValue={party.price ?? ""} />
              </label>
              <label className="text-sm font-medium text-zinc-300">Para birimi
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="currency" defaultValue={party.currency} />
              </label>
              <label className="text-sm font-medium text-zinc-300">Durum
                <select className="mt-2 h-11 w-full rounded-md border border-white/10 bg-[#1c1c26] px-3 text-white outline-none focus:border-fuchsia-400" name="status" defaultValue={party.status}>
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                  <option value="cancelled">İptal</option>
                </select>
              </label>
            </div>
            <label className="text-sm font-medium text-zinc-300">Kapak görsel URL
              <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="coverImageUrl" type="url" defaultValue={party.cover_image_url ?? ""} />
            </label>
            <label className="text-sm font-medium text-zinc-300">Yeni kapak görseli yükle
              <input className="mt-2 block w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-zinc-200 file:mr-4 file:rounded-md file:border-0 file:bg-fuchsia-500 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-fuchsia-400" name="coverImageFile" type="file" accept="image/jpeg,image/png,image/webp" />
            </label>
            <button className="h-12 rounded-md bg-fuchsia-500 px-4 font-semibold text-white hover:bg-fuchsia-400" type="submit">Kaydet</button>
          </form>
        </Card>
      </main>
    </SiteShell>
  );
}
