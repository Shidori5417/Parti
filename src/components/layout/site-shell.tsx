import Link from "next/link";
import { TicketCheck } from "lucide-react";
import { getRoleHomePath } from "@/lib/auth/roles";
import type { Profile } from "@/lib/types";

function getNavItems(profile?: Profile | null) {
  if (!profile) {
    return [
      { href: "/", label: "Partiler" },
    ];
  }

  if (profile.role === "admin") {
    return [
      { href: "/admin", label: "Admin" },
      { href: "/admin/parties", label: "Partiler" },
      { href: "/admin/tickets", label: "Biletler" },
      { href: "/admin/users", label: "Kullanıcılar" },
      { href: "/admin/reports", label: "Raporlar" },
    ];
  }

  if (profile.role === "scanner") {
    return [{ href: "/scanner", label: "Scanner" }];
  }

  return [
    { href: "/", label: "Partiler" },
    { href: "/dashboard", label: "Biletlerim" },
    { href: "/profile", label: "Profil" },
  ];
}

export function SiteShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile?: Profile | null;
}) {
  const navItems = getNavItems(profile);
  const homeHref = profile ? getRoleHomePath(profile) : "/";

  return (
    <div className="min-h-screen bg-[#09090f] text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#09090f]/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href={homeHref} className="flex items-center gap-2 font-bold">
            <span className="grid size-9 place-items-center rounded-md bg-fuchsia-500 text-white">
              <TicketCheck size={19} />
            </span>
            Parti QR
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {navItems.map((item, index) => (
              <Link key={item.href} className={index === 0 ? "rounded-md px-3 py-2 text-zinc-300 hover:bg-white/10" : "hidden rounded-md px-3 py-2 text-zinc-300 hover:bg-white/10 sm:inline-flex"} href={item.href}>
                {item.label}
              </Link>
            ))}
            {profile?.role === "user" && (
              <Link className="rounded-md px-3 py-2 text-zinc-300 hover:bg-white/10 sm:hidden" href="/dashboard">
                Biletlerim
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
