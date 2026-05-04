"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleUserRound, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Giriş yapılamadı.");
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Google girişi başlatılamadı.");
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#09090f] px-4 py-10 text-zinc-100">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
        <p className="mt-2 text-sm text-zinc-400">Biletlerini görmek veya kapıda okutma yapmak için hesabına gir.</p>
        <form className="mt-6 space-y-4" onSubmit={signInWithEmail}>
          <label className="block text-sm font-medium text-zinc-300">
            E-posta
            <input
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-zinc-300">
            Şifre
            <input
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {message && <p className="rounded-md bg-red-500/10 p-3 text-sm text-red-200">{message}</p>}
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
            {isLoading ? "Bekleniyor..." : "Giriş Yap"}
          </Button>
        </form>
        <Button className="mt-3 w-full" variant="secondary" onClick={signInWithGoogle} disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CircleUserRound size={18} />}
          {isLoading ? "Bekleniyor..." : "Google ile Giriş"}
        </Button>
        <p className="mt-5 text-center text-sm text-zinc-400">
          Hesabın yok mu?{" "}
          <Link className="font-semibold text-fuchsia-300" href="/register">
            Kayıt Ol
          </Link>
        </p>
      </Card>
    </main>
  );
}
