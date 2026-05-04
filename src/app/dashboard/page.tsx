import Link from "next/link";
import { Card, StatCard } from "@/components/ui/card";
import { SiteShell } from "@/components/layout/site-shell";
import { requireCompleteUserProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { Ticket } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getTickets() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("id,party_id,user_id,holder_first_name,holder_last_name,max_entries,used_entries,status,note,parties(title,starts_at,location_name)")
    .order("created_at", { ascending: false });

  return (data as Ticket[] | null) ?? [];
}

export default async function DashboardPage() {
  const profile = await requireCompleteUserProfile();
  const tickets = await getTickets();
  const remaining = tickets.reduce((total, ticket) => total + Math.max(ticket.max_entries - ticket.used_entries, 0), 0);

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Biletlerim</h1>
        <p className="mt-2 text-zinc-400">Merhaba {profile.first_name || profile.email}. Aktif biletlerini ve kalan giriş hakkını buradan takip edebilirsin.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Toplam bilet" value={String(tickets.length)} />
          <StatCard label="Kalan giriş hakkı" value={String(remaining)} tone="text-teal-200" />
          <StatCard label="Rol" value={profile.role} tone="text-fuchsia-200" />
        </div>
        <div className="mt-8 grid gap-4">
          {tickets.length === 0 ? (
            <Card className="text-zinc-300">Henüz hesabına tanımlanmış bilet yok.</Card>
          ) : (
            tickets.map((ticket) => (
              <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                <Card className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="font-bold text-white">{ticket.parties?.title ?? "Parti"}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {ticket.max_entries} kişilik, {ticket.used_entries} kullanıldı
                    </p>
                  </div>
                  <span className="w-fit rounded-md bg-white/10 px-3 py-1 text-sm text-zinc-200">{ticket.status}</span>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </SiteShell>
  );
}
