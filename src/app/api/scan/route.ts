import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scanTicketSchema } from "@/lib/validators/ticket";

const scanAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

function getClientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = scanAttempts.get(key);

  if (!current || current.resetAt <= now) {
    scanAttempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { ok: false, reason: "rate_limited", message: "Çok fazla okutma denemesi. Biraz bekleyin." },
      { status: 429 },
    );
  }

  const json = await request.json();
  const parsed = scanTicketSchema.safeParse({
    ...json,
    token: typeof json.token === "string" ? json.token.replace(/^PARTY_TICKET:/, "") : json.token,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: "invalid_payload", message: parsed.error.issues[0]?.message ?? "Geçersiz istek." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("scan_ticket", {
    p_qr_token: parsed.data.token,
    p_party_id: parsed.data.partyId,
    p_requested_entries: parsed.data.requestedEntries,
  });

  if (error) {
    return NextResponse.json({ ok: false, reason: "scan_failed", message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
