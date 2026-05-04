import Link from "next/link";
import { Card, StatCard } from "@/components/ui/card";
import { SiteShell } from "@/components/layout/site-shell";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();
  const [{ count: partyCount }, { count: ticketCount }, { count: scanCount }] = await Promise.all([
    supabase.from("parties").select("*", { count: "exact", head: true }),
    supabase.from("tickets").select("*", { count: "exact", head: true }),
    supabase.from("ticket_scans").select("*", { count: "exact", head: true }),
  ]);

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Admin Paneli</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Parti" value={String(partyCount ?? 0)} />
          <StatCard label="Bilet" value={String(ticketCount ?? 0)} />
          <StatCard label="Okutma" value={String(scanCount ?? 0)} />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/admin/parties/new"><Card>Yeni parti oluştur</Card></Link>
          <Link href="/admin/parties"><Card>Partileri yönet</Card></Link>
          <Link href="/admin/tickets/assign"><Card>Bilet tanımla</Card></Link>
          <Link href="/admin/tickets"><Card>Biletleri yönet</Card></Link>
          <Link href="/admin/users"><Card>Kullanıcıları yönet</Card></Link>
          <Link href="/admin/reports"><Card>Giriş raporları</Card></Link>
        </div>
      </main>
    </SiteShell>
  );
}
