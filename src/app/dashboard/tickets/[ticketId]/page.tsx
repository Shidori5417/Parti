import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SiteShell } from "@/components/layout/site-shell";
import { requireCompleteUserProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { toQrPayload, toQrDataUrl } from "@/lib/qr/generate";

type TicketDetail = {
  id: string;
  qr_token: string;
  holder_first_name: string;
  holder_last_name: string;
  max_entries: number;
  used_entries: number;
  status: string;
  parties: {
    title: string;
    starts_at: string;
    location_name: string | null;
    address: string | null;
  } | null;
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const profile = await requireCompleteUserProfile();
  const { ticketId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("id,qr_token,holder_first_name,holder_last_name,max_entries,used_entries,status,parties(title,starts_at,location_name,address)")
    .eq("id", ticketId)
    .maybeSingle();
  const ticket = data as TicketDetail | null;

  if (!ticket) {
    notFound();
  }

  const remaining = ticket.max_entries - ticket.used_entries;
  const qrDataUrl = await toQrDataUrl(ticket.qr_token);

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{ticket.parties?.title ?? "Bilet"}</h1>
              <p className="mt-2 text-zinc-400">{ticket.holder_first_name} {ticket.holder_last_name}</p>
            </div>
            <span className="rounded-md bg-white/10 px-3 py-1 text-sm">{ticket.status}</span>
          </div>
          <div className="mt-8 grid place-items-center rounded-lg border border-white/10 bg-white p-8 text-zinc-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="Bilet QR Kodu" width={256} height={256} className="rounded" />
            <p className="mt-4 max-w-full break-all font-mono text-xs">{toQrPayload(ticket.qr_token)}</p>
          </div>
          <div className="mt-6 grid gap-3 text-sm text-zinc-300 md:grid-cols-3">
            <p className="rounded-md bg-white/10 p-3">Kişi: {ticket.max_entries}</p>
            <p className="rounded-md bg-white/10 p-3">Kullanılan: {ticket.used_entries}</p>
            <p className="rounded-md bg-white/10 p-3">Kalan: {remaining}</p>
          </div>
          <Link className="mt-6 inline-flex rounded-md bg-fuchsia-500 px-4 py-3 font-semibold text-white" href={`/api/tickets/${ticket.id}/pdf`}>
            PDF İndir
          </Link>
        </Card>
      </main>
    </SiteShell>
  );
}
