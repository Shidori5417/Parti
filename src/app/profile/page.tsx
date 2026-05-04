import { SiteShell } from "@/components/layout/site-shell";
import { Card } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth/guards";
import { updateProfileAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const [profile, params] = await Promise.all([requireProfile(), searchParams]);

  return (
    <SiteShell profile={profile}>
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Profil</h1>
        <p className="mt-2 text-zinc-400">Bilet üzerindeki isim ve yaş doğrulama bilgilerini güncel tut.</p>
        <Card className="mt-6">
          {params.updated && (
            <p className="mb-5 rounded-md bg-teal-500/10 p-3 text-sm text-teal-200">Profil güncellendi.</p>
          )}
          {params.error && (
            <p className="mb-5 rounded-md bg-red-500/10 p-3 text-sm text-red-200">{params.error}</p>
          )}
          <form action={updateProfileAction} className="grid gap-4">
            <label className="text-sm font-medium text-zinc-300">
              İsim
              <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="firstName" defaultValue={profile.first_name} required />
            </label>
            <label className="text-sm font-medium text-zinc-300">
              Soyisim
              <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="lastName" defaultValue={profile.last_name} required />
            </label>
            <label className="text-sm font-medium text-zinc-300">
              Doğum yılı
              <input className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="birthYear" type="number" defaultValue={profile.birth_year ?? ""} required />
            </label>
            <p className="rounded-md bg-white/10 p-3 text-sm text-zinc-300">E-posta: {profile.email}</p>
            <button className="h-12 rounded-md bg-fuchsia-500 px-4 font-semibold text-white hover:bg-fuchsia-400" type="submit">
              Profili Güncelle
            </button>
          </form>
        </Card>
      </main>
    </SiteShell>
  );
}
