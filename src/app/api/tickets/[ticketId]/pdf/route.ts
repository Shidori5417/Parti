import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { TicketDocument } from "@/lib/pdf/ticket-document";
import { toQrDataUrl } from "@/lib/qr/generate";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type TicketPdfData = {
  id: string;
  holder_first_name: string;
  holder_last_name: string;
  max_entries: number;
  used_entries: number;
  status: string;
  qr_token: string;
  parties: {
    title: string;
    starts_at: string;
    location_name: string | null;
    address: string | null;
    important_notes: string | null;
  } | null;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select("id,holder_first_name,holder_last_name,max_entries,used_entries,status,qr_token,parties(title,starts_at,location_name,address,important_notes)")
    .eq("id", ticketId)
    .maybeSingle();
  const ticket = data as TicketPdfData | null;

  if (!ticket) {
    return NextResponse.json({ ok: false, message: "Bilet bulunamadı." }, { status: 404 });
  }

  const qrDataUrl = await toQrDataUrl(ticket.qr_token);
  const pdf = await renderToBuffer(TicketDocument({ ticket, qrDataUrl }));

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="parti-bilet-${ticket.id}.pdf"`,
    },
  });
}
