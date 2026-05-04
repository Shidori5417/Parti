import Link from "next/link";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { Party } from "@/lib/types";
import { updatePartyStatusAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminPartiesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const profile = await requireRole(["admin"]);
  const params = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("parties")
    .select("id,title,slug,description,important_notes,location_name,address,starts_at,ends_at,price,currency,cover_image_url,status")
    .order("starts_at", { ascending: false });
  const parties = (data as Party[] | null) ?? [];

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Partiler</h1>
            <p className="mt-2 text-zinc-400">Taslak, yayında ve iptal edilmiş partileri buradan takip et.</p>
          </div>
          <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-fuchsia-500 px-4 font-semibold text-white hover:bg-fuchsia-400" href="/admin/parties/new">
            <Plus size={18} /> Yeni Parti
          </Link>
        </div>
        {params.created && (
          <p className="mt-6 rounded-md bg-teal-500/10 p-3 text-sm text-teal-200">Parti oluşturuldu.</p>
        )}
        <div className="mt-6 grid gap-4">
          {parties.length === 0 ? (
            <Card className="text-zinc-300">Henüz parti yok.</Card>
          ) : (
            parties.map((party) => (
              <Card key={party.id} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold text-white">{party.title}</h2>
                    <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-zinc-300">{party.status}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                    <CalendarDays size={16} /> {new Date(party.starts_at).toLocaleString("tr-TR")}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin size={16} /> {party.location_name ?? "Mekan yok"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10" href={`/admin/parties/${party.id}/edit`}>
                    Düzenle
                  </Link>
                  <Link className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10" href={`/parties/${party.slug}`}>
                    Görüntüle
                  </Link>
                  {party.status !== "cancelled" && (
                    <form action={updatePartyStatusAction}>
                      <input name="partyId" type="hidden" value={party.id} />
                      <input name="status" type="hidden" value="cancelled" />
                      <button className="rounded-md border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10" type="submit">
                        İptal Et
                      </button>
                    </form>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </SiteShell>
  );
}
