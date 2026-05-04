import { SiteShell } from "@/components/layout/site-shell";
import { Card, StatCard } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

type TicketSummary = {
  max_entries: number;
  used_entries: number;
  status: string;
};

export default async function AdminReportsPage() {
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();
  const [{ data: scans }, { data: tickets }] = await Promise.all([
    supabase
      .from("ticket_scans")
      .select("id,requested_entries,result,reason,scanned_at,parties(title),profiles(first_name,last_name,email),tickets(holder_first_name,holder_last_name)")
      .order("scanned_at", { ascending: false })
      .limit(30),
    supabase.from("tickets").select("max_entries,used_entries,status"),
  ]);

  const scanRows = (scans as ScanRow[] | null) ?? [];
  const ticketRows = (tickets as TicketSummary[] | null) ?? [];
  const totalEntries = ticketRows.reduce((sum, ticket) => sum + ticket.max_entries, 0);
  const usedEntries = ticketRows.reduce((sum, ticket) => sum + ticket.used_entries, 0);
  const revokedTickets = ticketRows.filter((ticket) => ticket.status === "revoked").length;

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Giriş Raporları</h1>
        <p className="mt-2 text-zinc-400">Parti günü toplam hak, kullanılan hak ve son okutmalar.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Toplam giriş hakkı" value={String(totalEntries)} />
          <StatCard label="Kullanılan" value={String(usedEntries)} tone="text-teal-200" />
          <StatCard label="Kalan" value={String(totalEntries - usedEntries)} tone="text-fuchsia-200" />
          <StatCard label="İptal bilet" value={String(revokedTickets)} tone="text-red-200" />
        </div>
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">Son Okutmalar</h2>
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
                    <p className="mt-1 text-sm text-zinc-400">{scan.requested_entries} kişi - {scan.reason ?? "ok"}</p>
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
