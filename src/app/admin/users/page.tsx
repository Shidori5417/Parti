import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { updateUserRoleAction } from "../actions";

export const dynamic = "force-dynamic";

type AdminUser = {
  id: string;
  first_name: string;
  last_name: string;
  birth_year: number | null;
  email: string;
  role: string;
  created_at: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const [profile, params] = await Promise.all([requireRole(["admin"]), searchParams]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,first_name,last_name,birth_year,email,role,created_at")
    .order("created_at", { ascending: false });
  const users = (data as AdminUser[] | null) ?? [];

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold text-white">Kullanıcılar</h1>
            <p className="mt-2 text-zinc-400">Profil, e-posta ve rol durumlarını takip et.</p>
          </div>
          <p className="rounded-md bg-white/10 px-3 py-2 text-sm text-zinc-300">Toplam: {users.length}</p>
        </div>
        {params.updated && <p className="mt-6 rounded-md bg-teal-500/10 p-3 text-sm text-teal-200">Kullanıcı güncellendi.</p>}
        {params.error && <p className="mt-6 rounded-md bg-red-500/10 p-3 text-sm text-red-200">{params.error}</p>}
        <div className="mt-6 grid gap-4">
          {users.length === 0 ? (
            <Card className="text-zinc-300">Henüz kullanıcı yok.</Card>
          ) : (
            users.map((user) => (
              <Card key={user.id} className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-bold text-white">{user.first_name || "İsimsiz"} {user.last_name}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{user.email}</p>
                  <p className="mt-1 text-sm text-zinc-500">Doğum yılı: {user.birth_year ?? "Eksik"}</p>
                </div>
                <form action={updateUserRoleAction} className="flex w-full gap-2 md:w-auto">
                  <input name="userId" type="hidden" value={user.id} />
                  <select className="h-10 flex-1 rounded-md border border-white/10 bg-[#1c1c26] px-3 text-sm text-white outline-none focus:border-fuchsia-400 md:w-36" name="role" defaultValue={user.role}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                    <option value="scanner">scanner</option>
                  </select>
                  <button className="rounded-md border border-white/10 px-3 text-sm font-semibold text-white hover:bg-white/10" type="submit">
                    Kaydet
                  </button>
                </form>
              </Card>
            ))
          )}
        </div>
      </main>
    </SiteShell>
  );
}
