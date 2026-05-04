import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ExportType = "tickets" | "scans";

type TicketExportRow = {
  id: string;
  holder_first_name: string;
  holder_last_name: string;
  max_entries: number;
  used_entries: number;
  status: string;
  note: string | null;
  created_at: string;
  profiles: { email: string } | null;
  parties: { title: string; starts_at: string; location_name: string | null } | null;
};

type ScanExportRow = {
  id: string;
  requested_entries: number;
  result: string;
  reason: string | null;
  scanned_at: string;
  parties: { title: string } | null;
  profiles: { first_name: string; last_name: string; email: string } | null;
  tickets: { holder_first_name: string; holder_last_name: string } | null;
};

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(headers: string[], rows: unknown[][]) {
  return [headers.map(csvCell).join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\r\n");
}

function csvResponse(filename: string, csv: string) {
  return new NextResponse(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  await requireRole(["admin"]);

  const type = (request.nextUrl.searchParams.get("type") ?? "tickets") as ExportType;
  const partyId = request.nextUrl.searchParams.get("partyId");
  const supabase = await createClient();

  if (type === "scans") {
    let query = supabase
      .from("ticket_scans")
      .select("id,requested_entries,result,reason,scanned_at,parties(title),profiles(first_name,last_name,email),tickets(holder_first_name,holder_last_name)")
      .order("scanned_at", { ascending: false });

    if (partyId) {
      query = query.eq("party_id", partyId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const rows = ((data as unknown as ScanExportRow[] | null) ?? []).map((scan) => [
      scan.scanned_at,
      scan.parties?.title,
      scan.tickets ? `${scan.tickets.holder_first_name} ${scan.tickets.holder_last_name}` : "",
      scan.profiles ? `${scan.profiles.first_name} ${scan.profiles.last_name}` : "",
      scan.profiles?.email,
      scan.requested_entries,
      scan.result,
      scan.reason,
    ]);

    return csvResponse(
      `okutmalar-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(["Tarih", "Parti", "Bilet Sahibi", "Scanner", "Scanner E-posta", "Kişi", "Sonuç", "Sebep"], rows),
    );
  }

  if (type !== "tickets") {
    return NextResponse.json({ error: "Geçersiz export tipi." }, { status: 400 });
  }

  let query = supabase
    .from("tickets")
    .select("id,holder_first_name,holder_last_name,max_entries,used_entries,status,note,created_at,profiles(email),parties(title,starts_at,location_name)")
    .order("created_at", { ascending: false });

  if (partyId) {
    query = query.eq("party_id", partyId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rows = ((data as unknown as TicketExportRow[] | null) ?? []).map((ticket) => [
    ticket.created_at,
    ticket.parties?.title,
    ticket.parties?.starts_at,
    ticket.parties?.location_name,
    `${ticket.holder_first_name} ${ticket.holder_last_name}`,
    ticket.profiles?.email,
    ticket.max_entries,
    ticket.used_entries,
    ticket.max_entries - ticket.used_entries,
    ticket.status,
    ticket.note,
  ]);

  return csvResponse(
    `biletler-${new Date().toISOString().slice(0, 10)}.csv`,
    toCsv(["Tanım Tarihi", "Parti", "Parti Tarihi", "Mekan", "Bilet Sahibi", "E-posta", "Toplam Hak", "Kullanılan", "Kalan", "Durum", "Not"], rows),
  );
}
