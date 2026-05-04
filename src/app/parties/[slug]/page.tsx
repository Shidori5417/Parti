import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, TicketCheck } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/guards";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Party } from "@/lib/types";

export const dynamic = "force-dynamic";

type UserTicket = {
  id: string;
  status: string;
  max_entries: number;
  used_entries: number;
};

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getCurrentProfile();

  if (!hasSupabaseEnv()) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("parties")
    .select("id,title,slug,description,important_notes,location_name,address,starts_at,ends_at,price,currency,cover_image_url,status")
    .eq("slug", slug)
    .maybeSingle();
  const party = data as Party | null;

  if (!party) {
    notFound();
  }

  let ticket: UserTicket | null = null;

  if (profile) {
    const { data: ticketData } = await supabase
      .from("tickets")
      .select("id,status,max_entries,used_entries")
      .eq("party_id", party.id)
      .eq("user_id", profile.id)
      .maybeSingle();
    ticket = ticketData as UserTicket | null;
  }

  return (
    <SiteShell profile={profile}>
      <main>
        <section className="relative min-h-[42vh] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={party.cover_image_url ? { backgroundImage: `url(${party.cover_image_url})` } : undefined}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#09090f_0%,rgba(9,9,15,0.82)_55%,rgba(20,184,166,0.2)_100%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-20">
            <span className="rounded-md bg-white/10 px-3 py-1 text-sm text-zinc-200">{party.status}</span>
            <h1 className="mt-5 max-w-3xl text-5xl font-black text-white">{party.title}</h1>
            <div className="mt-6 grid gap-3 text-zinc-300 md:grid-cols-2">
              <p className="flex items-center gap-2"><CalendarDays size={18} /> {new Date(party.starts_at).toLocaleString("tr-TR")}</p>
              <p className="flex items-center gap-2"><MapPin size={18} /> {party.location_name ?? "Mekan açıklanacak"}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-white">Açıklama</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-300">{party.description ?? "Açıklama henüz eklenmedi."}</p>
            </Card>
            <Card>
              <h2 className="text-xl font-bold text-white">Önemli Notlar</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-300">{party.important_notes ?? "Önemli not yok."}</p>
            </Card>
          </div>
          <aside>
            <Card className="sticky top-24">
              <div className="grid size-12 place-items-center rounded-md bg-fuchsia-500/15 text-fuchsia-200">
                <TicketCheck size={24} />
              </div>
              <p className="mt-4 text-sm text-zinc-400">Fiyat</p>
              <p className="text-2xl font-bold text-white">
                {party.price ? `${party.price} ${party.currency}` : "Liste ile giriş"}
              </p>
              {ticket ? (
                <Link className="mt-5 inline-flex w-full justify-center rounded-md bg-fuchsia-500 px-4 py-3 font-semibold text-white hover:bg-fuchsia-400" href={`/dashboard/tickets/${ticket.id}`}>
                  Biletimi Görüntüle
                </Link>
              ) : (
                <p className="mt-5 rounded-md bg-white/10 p-3 text-sm text-zinc-300">Bu parti için hesabına tanımlı bilet bulunmuyor.</p>
              )}
            </Card>
          </aside>
        </section>
      </main>
    </SiteShell>
  );
}
