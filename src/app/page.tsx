import Link from "next/link";
import { CalendarDays, MapPin, ShieldCheck, TicketCheck } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/guards";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Party } from "@/lib/types";

async function getPublishedParties() {
  if (!hasSupabaseEnv()) {
    return [] as Party[];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("parties")
    .select("id,title,slug,description,important_notes,location_name,address,starts_at,ends_at,price,currency,cover_image_url,status")
    .eq("status", "published")
    .order("starts_at", { ascending: true })
    .limit(6);

  return (data as Party[] | null) ?? [];
}

export default async function Home() {
  const [profile, parties] = await Promise.all([getCurrentProfile(), getPublishedParties()]);

  return (
    <SiteShell profile={profile}>
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(217,70,239,0.35),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(20,184,166,0.2),transparent_28%),linear-gradient(135deg,#09090f_0%,#15111f_55%,#071110_100%)]" />
          <div className="relative mx-auto grid min-h-[72vh] max-w-6xl content-center gap-8 px-4 py-20">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-1 text-sm text-zinc-200">
                <ShieldCheck size={16} /> Güvenli QR bilet ve kapı kontrolü
              </p>
              <h1 className="text-5xl font-black leading-tight text-white md:text-7xl">
                Parti QR
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                Davetli listesi, çok kişilik bilet, PDF/QR indirme ve kapıda scanner onayı için MVP iskeleti hazır.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="rounded-md bg-fuchsia-500 px-5 py-3 font-semibold text-white hover:bg-fuchsia-400" href="/register">
                  Kayıt Ol
                </Link>
                <Link className="rounded-md border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white hover:bg-white/15" href="/dashboard">
                  Biletlerim
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Yayındaki Partiler</h2>
              <p className="mt-1 text-zinc-400">Supabase bağlanınca `published` partiler burada listelenir.</p>
            </div>
          </div>

          {parties.length === 0 ? (
            <Card className="border-dashed text-zinc-300">
              Henüz yayınlanmış parti yok. Admin panelinden ilk partiyi oluşturabilirsin.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {parties.map((party) => (
                <Link key={party.id} href={`/parties/${party.slug}`}>
                  <Card className="h-full hover:border-fuchsia-400/50">
                    <div className="mb-4 grid size-11 place-items-center rounded-md bg-teal-400/15 text-teal-200">
                      <TicketCheck size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{party.title}</h3>
                    <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                      <CalendarDays size={16} /> {new Date(party.starts_at).toLocaleString("tr-TR")}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                      <MapPin size={16} /> {party.location_name ?? "Mekan açıklanacak"}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </SiteShell>
  );
}
