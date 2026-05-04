import Link from "next/link";
import { Download } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { Card, StatCard } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PartyOption = {
  id: string;
  title: string;
  starts_at: string;
};

type ScanRow = {
  id: string;
  requested_entries: number;
  result: string;
  reason: string | null;
  scanned_at: string;
  parties: { title: string } | null;
  profiles: { first_name: string; last_name: string; email: string } | null;
  tickets: { holder_first_name: string; holder_last_name: string } | null;
};

type TicketRow = {
  id: string;
  holder_first_name: string;
  holder_last_name: string;
  max_entries: number;
  used_entries: number;
  status: string;
  created_at: string;
  profiles: { email: string } | null;
  parties: { title: string; starts_at: string } | null;
};

function exportHref(type: "tickets" | "scans", partyId: string) {
  const params = new URLSearchParams({ type });

  if (partyId) {
    params.set("partyId", partyId);
  }

  return `/api/admin/reports/export?${params.toString()}`;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ partyId?: string }>;
}) {
  const [profile, params] = await Promise.all([requireRole(["admin"]), searchParams]);
  const selectedPartyId = params.partyId ?? "";
  const supabase = await createClient();

  const [{ data: parties }, ticketsQuery, scansQuery] = await Promise.all([
    supabase.from("parties").select("id,title,starts_at").order("starts_at", { ascending: false }),
    (() => {
      let query = supabase
        .from("tickets")
        .select("id,holder_first_name,holder_last_name,max_entries,used_entries,status,created_at,profiles(email),parties(title,starts_at)")
        .order("created_at", { ascending: false });

      if (selectedPartyId) {
        query = query.eq("party_id", selectedPartyId);
      }

      return query;
    })(),
    (() => {
      let query = supabase
        .from("ticket_scans")
        .select("id,requested_entries,result,reason,scanned_at,parties(title),profiles(first_name,last_name,email),tickets(holder_first_name,holder_last_name)")
        .order("scanned_at", { ascending: false })
        .limit(80);

      if (selectedPartyId) {
        query = query.eq("party_id", selectedPartyId);
      }

      return query;
    })(),
  ]);

  const partyOptions = (parties as PartyOption[] | null) ?? [];
  const ticketRows = (ticketsQuery.data as unknown as TicketRow[] | null) ?? [];
  const scanRows = (scansQuery.data as unknown as ScanRow[] | null) ?? [];
  const selectedParty = partyOptions.find((party) => party.id === selectedPartyId);

  const totalTickets = ticketRows.length;
  const totalEntries = ticketRows.reduce((sum, ticket) => sum + ticket.max_entries, 0);
  const usedEntries = ticketRows.reduce((sum, ticket) => sum + ticket.used_entries, 0);
  const revokedTickets = ticketRows.filter((ticket) => ticket.status === "revoked").length;
  const admittedTickets = ticketRows.filter((ticket) => ticket.used_entries > 0);
  const waitingTickets = ticketRows.filter((ticket) => ticket.status === "active" && ticket.used_entries === 0);

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold text-white">Giriş Raporları</h1>
            <p className="mt-2 text-zinc-400">
              {selectedParty ? `${selectedParty.title} için kapı durumu.` : "Tüm partiler için bilet, giriş ve okutma özeti."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-semibold text-white hover:bg-white/10"
              href={exportHref("tickets", selectedPartyId)}
            >
              <Download size={16} /> Bilet CSV
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-semibold text-white hover:bg-white/10"
              href={exportHref("scans", selectedPartyId)}
            >
              <Download size={16} /> Okutma CSV
            </Link>
          </div>
        </div>

        <form className="mt-6 flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 md:flex-row md:items-center">
          <label className="text-sm font-semibold text-zinc-300" htmlFor="partyId">
            Parti filtresi
          </label>
          <select
            className="h-11 flex-1 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-fuchsia-400"
            defaultValue={selectedPartyId}
            id="partyId"
            name="partyId"
          >
            <option value="">Tüm partiler</option>
            {partyOptions.map((party) => (
              <option key={party.id} value={party.id}>
                {party.title} - {new Date(party.starts_at).toLocaleDateString("tr-TR")}
              </option>
            ))}
          </select>
          <button className="h-11 rounded-md bg-fuchsia-500 px-4 text-sm font-semibold text-white hover:bg-fuchsia-400" type="submit">
            Filtrele
          </button>
          {selectedPartyId && (
            <Link className="inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold text-zinc-200 hover:bg-white/10" href="/admin/reports">
              Temizle
            </Link>
          )}
        </form>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <StatCard label="Bilet" value={String(totalTickets)} />
          <StatCard label="Toplam hak" value={String(totalEntries)} />
          <StatCard label="Kullanılan" value={String(usedEntries)} tone="text-teal-200" />
          <StatCard label="Kalan" value={String(totalEntries - usedEntries)} tone="text-fuchsia-200" />
          <StatCard label="İptal" value={String(revokedTickets)} tone="text-red-200" />
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <TicketList title="Giriş Yapanlar" empty="Henüz giriş yapan yok." tickets={admittedTickets} />
          <TicketList title="Giriş Yapmayanlar" empty="Bekleyen aktif bilet yok." tickets={waitingTickets} />
        </section>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Son Okutmalar</h2>
              <p className="mt-1 text-sm text-zinc-500">Başarılı ve reddedilen okutmalar birlikte görünür.</p>
            </div>
            <span className="text-sm text-zinc-500">{scanRows.length} kayıt</span>
          </div>
          <div className="mt-4 grid gap-4">
            {scanRows.length === 0 ? (
              <Card className="text-zinc-300">Henüz okutma kaydı yok.</Card>
            ) : (
              scanRows.map((scan) => (
                <Card key={scan.id} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h3 className="font-bold text-white">{scan.parties?.title ?? "Parti"}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {scan.tickets ? `${scan.tickets.holder_first_name} ${scan.tickets.holder_last_name}` : "Bilet bulunamadı"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Scanner: {scan.profiles ? `${scan.profiles.first_name} ${scan.profiles.last_name}` : "Bilinmiyor"}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={scan.result === "approved" ? "font-bold text-teal-200" : "font-bold text-red-200"}>{scan.result}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {scan.requested_entries} kişi - {scan.reason ?? "ok"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">{new Date(scan.scanned_at).toLocaleString("tr-TR")}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

function TicketList({
  title,
  empty,
  tickets,
}: {
  title: string;
  empty: string;
  tickets: TicketRow[];
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <span className="text-sm text-zinc-500">{tickets.length} bilet</span>
      </div>
      <div className="mt-4 grid gap-3">
        {tickets.length === 0 ? (
          <Card className="text-zinc-300">{empty}</Card>
        ) : (
          tickets.slice(0, 12).map((ticket) => (
            <Card key={ticket.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">
                    {ticket.holder_first_name} {ticket.holder_last_name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{ticket.profiles?.email ?? "E-posta yok"}</p>
                </div>
                <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-zinc-300">{ticket.status}</span>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                {ticket.used_entries}/{ticket.max_entries} hak kullanıldı
              </p>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
