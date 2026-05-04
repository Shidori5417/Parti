import Link from "next/link";
import { TicketCheck } from "lucide-react";
import type { Profile } from "@/lib/types";

export function SiteShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile?: Profile | null;
}) {
  return (
    <div className="min-h-screen bg-[#09090f] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#09090f]/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid size-9 place-items-center rounded-md bg-fuchsia-500 text-white">
              <TicketCheck size={19} />
            </span>
            Parti QR
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link className="rounded-md px-3 py-2 text-zinc-300 hover:bg-white/10" href="/dashboard">
              Biletlerim
            </Link>
            {profile && (
              <Link className="hidden rounded-md px-3 py-2 text-zinc-300 hover:bg-white/10 sm:inline-flex" href="/profile">
                Profil
              </Link>
            )}
            {profile?.role === "admin" && (
              <Link className="rounded-md px-3 py-2 text-zinc-300 hover:bg-white/10" href="/admin">
                Admin
              </Link>
            )}
            {(profile?.role === "scanner" || profile?.role === "admin") && (
              <Link className="rounded-md px-3 py-2 text-zinc-300 hover:bg-white/10" href="/scanner">
                Scanner
              </Link>
            )}
            {profile ? (
              <Link className="rounded-md bg-white px-3 py-2 font-semibold text-zinc-950" href="/auth/logout">
                Çıkış
              </Link>
            ) : (
              <Link className="rounded-md bg-white px-3 py-2 font-semibold text-zinc-950" href="/login">
                Giriş
              </Link>
            )}
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
