import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createPartyAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewPartyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireRole(["admin"]);
  const params = await searchParams;

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Yeni Parti</h1>
        <Card className="mt-6">
          {params.error && (
            <p className="mb-5 rounded-md bg-red-500/10 p-3 text-sm text-red-200">{params.error}</p>
          )}
          <form action={createPartyAction} className="grid gap-4" encType="multipart/form-data">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-zinc-300">
                Parti adı
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="title" required />
              </label>
              <label className="text-sm font-medium text-zinc-300">
                Slug
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="slug" placeholder="gece-partisi" required />
              </label>
            </div>
            <label className="text-sm font-medium text-zinc-300">
              Açıklama
              <textarea className="mt-2 min-h-28 w-full rounded-md border border-white/10 bg-white/10 px-3 py-3 text-white outline-none focus:border-fuchsia-400" name="description" />
            </label>
            <label className="text-sm font-medium text-zinc-300">
              Önemli notlar
              <textarea className="mt-2 min-h-24 w-full rounded-md border border-white/10 bg-white/10 px-3 py-3 text-white outline-none focus:border-fuchsia-400" name="importantNotes" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-zinc-300">
                Mekan
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="locationName" required />
              </label>
              <label className="text-sm font-medium text-zinc-300">
                Adres
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="address" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-zinc-300">
                Başlangıç
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="startsAt" type="datetime-local" required />
              </label>
              <label className="text-sm font-medium text-zinc-300">
                Bitiş
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="endsAt" type="datetime-local" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-zinc-300">
                Fiyat
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="price" type="number" min="0" step="0.01" />
              </label>
              <label className="text-sm font-medium text-zinc-300">
                Para birimi
                <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="currency" defaultValue="TRY" />
              </label>
              <label className="text-sm font-medium text-zinc-300">
                Durum
                <select className="mt-2 h-11 w-full rounded-md border border-white/10 bg-[#1c1c26] px-3 text-white outline-none focus:border-fuchsia-400" name="status" defaultValue="draft">
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                  <option value="cancelled">İptal</option>
                </select>
              </label>
            </div>
            <label className="text-sm font-medium text-zinc-300">
              Kapak görsel URL
              <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="coverImageUrl" type="url" />
            </label>
            <label className="text-sm font-medium text-zinc-300">
              Kapak görseli yükle
              <input className="mt-2 block w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-zinc-200 file:mr-4 file:rounded-md file:border-0 file:bg-fuchsia-500 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-fuchsia-400" name="coverImageFile" type="file" accept="image/jpeg,image/png,image/webp" />
            </label>
            <button className="mt-2 h-12 rounded-md bg-fuchsia-500 px-4 font-semibold text-white hover:bg-fuchsia-400" type="submit">
              Partiyi Kaydet
            </button>
          </form>
        </Card>
      </main>
    </SiteShell>
  );
}
