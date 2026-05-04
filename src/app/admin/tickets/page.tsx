import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { revokeTicketAction } from "../actions";

export const dynamic = "force-dynamic";

type AdminTicket = {
  id: string;
  holder_first_name: string;
  holder_last_name: string;
  max_entries: number;
  used_entries: number;
  status: string;
  profiles: { email: string } | null;
  parties: { title: string; starts_at: string } | null;
};

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const [profile, params] = await Promise.all([requireRole(["admin"]), searchParams]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("id,holder_first_name,holder_last_name,max_entries,used_entries,status,profiles(email),parties(title,starts_at)")
    .order("created_at", { ascending: false });
  const tickets = (data as AdminTicket[] | null) ?? [];

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Biletler</h1>
            <p className="mt-2 text-zinc-400">Tanımlı biletleri, kullanım durumunu ve iptalleri yönet.</p>
          </div>
          <Link className="rounded-md bg-fuchsia-500 px-4 py-3 font-semibold text-white hover:bg-fuchsia-400" href="/admin/tickets/assign">
            Bilet Tanımla
          </Link>
        </div>
        {params.updated && <p className="mt-6 rounded-md bg-teal-500/10 p-3 text-sm text-teal-200">Bilet güncellendi.</p>}
        {params.error && <p className="mt-6 rounded-md bg-red-500/10 p-3 text-sm text-red-200">{params.error}</p>}
        <div className="mt-6 grid gap-4">
          {tickets.length === 0 ? (
            <Card className="text-zinc-300">Henüz bilet yok.</Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-bold text-white">{ticket.parties?.title ?? "Parti"}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{ticket.holder_first_name} {ticket.holder_last_name} - {ticket.profiles?.email}</p>
                  <p className="mt-1 text-sm text-zinc-400">{ticket.used_entries}/{ticket.max_entries} kullanıldı</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white/10 px-3 py-2 text-sm text-zinc-200">{ticket.status}</span>
                  <Link className="rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10" href={`/dashboard/tickets/${ticket.id}`}>
                    Görüntüle
                  </Link>
                  {ticket.status !== "revoked" && (
                    <form action={revokeTicketAction}>
                      <input name="ticketId" type="hidden" value={ticket.id} />
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
