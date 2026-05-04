import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { assignTicketAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AssignTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const profile = await requireRole(["admin"]);
  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: parties }, { data: users }] = await Promise.all([
    supabase.from("parties").select("id,title,status,starts_at").order("starts_at", { ascending: true }),
    supabase.from("profiles").select("id,first_name,last_name,email,role").order("created_at", { ascending: false }),
  ]);

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Bilet Tanımla</h1>
        <Card className="mt-6">
          {params.created && (
            <p className="mb-5 rounded-md bg-teal-500/10 p-3 text-sm text-teal-200">Bilet tanımlandı.</p>
          )}
          {params.error && (
            <p className="mb-5 rounded-md bg-red-500/10 p-3 text-sm text-red-200">{params.error}</p>
          )}
          <form action={assignTicketAction} className="grid gap-4">
            <label className="text-sm font-medium text-zinc-300">
              Parti
              <select className="mt-2 h-11 w-full rounded-md border border-white/10 bg-[#1c1c26] px-3 text-white outline-none focus:border-fuchsia-400" name="partyId" required>
                <option value="">Parti seç</option>
                {(parties ?? []).map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.title} ({party.status})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-300">
              Kullanıcı
              <select className="mt-2 h-11 w-full rounded-md border border-white/10 bg-[#1c1c26] px-3 text-white outline-none focus:border-fuchsia-400" name="userId" required>
                <option value="">Kullanıcı seç</option>
                {(users ?? []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} - {user.email} ({user.role})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-zinc-300">
              Giriş hakkı
              <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="maxEntries" type="number" min="1" defaultValue="1" required />
            </label>
            <label className="text-sm font-medium text-zinc-300">
              Not
              <textarea className="mt-2 min-h-24 w-full rounded-md border border-white/10 bg-white/10 px-3 py-3 text-white outline-none focus:border-fuchsia-400" name="note" />
            </label>
            <button className="h-12 rounded-md bg-fuchsia-500 px-4 font-semibold text-white hover:bg-fuchsia-400" type="submit">
              Bilet Tanımla
            </button>
          </form>
        </Card>
      </main>
    </SiteShell>
  );
}
