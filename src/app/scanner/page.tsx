import { SiteShell } from "@/components/layout/site-shell";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { ScannerClient } from "./scanner-client";

export const dynamic = "force-dynamic";

export default async function ScannerPage() {
  const profile = await requireRole(["admin", "scanner"]);
  const supabase = await createClient();
  const { data: parties } = await supabase
    .from("parties")
    .select("id,title,status")
    .in("status", ["published", "draft"])
    .order("starts_at", { ascending: true });

  return (
    <SiteShell profile={profile}>
      <main className="min-h-screen px-4 py-8">
        <ScannerClient parties={(parties ?? []) as { id: string; title: string; status: string }[]} />
      </main>
    </SiteShell>
  );
}
