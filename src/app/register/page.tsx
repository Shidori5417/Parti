"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validators/auth";

export default function RegisterPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const parsed = registerSchema.safeParse({
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      birthYear: String(formData.get("birthYear") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Form geçersiz.");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: parsed.data.firstName,
            last_name: parsed.data.lastName,
            birth_year: String(parsed.data.birthYear),
          },
        },
      });

      setMessage(error ? error.message : "Kayıt alındı. Lütfen e-postanı doğrula.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Kayıt oluşturulamadı.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#09090f] px-4 py-10 text-zinc-100">
      <Card className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-white">Kayıt Ol</h1>
        <p className="mt-2 text-sm text-zinc-400">Profil bilgilerin bilet üzerinde doğru görünür.</p>
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={register}>
          <input className="h-11 rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="firstName" placeholder="İsim" required />
          <input className="h-11 rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="lastName" placeholder="Soyisim" required />
          <input className="h-11 rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="birthYear" placeholder="Doğum yılı" type="text" inputMode="numeric" pattern="[0-9]{4}" minLength={4} maxLength={4} required />
          <input className="h-11 rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" name="email" placeholder="E-posta" type="email" required />
          <input className="h-11 rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400 md:col-span-2" name="password" placeholder="Şifre" type="password" minLength={6} required />
          {message && <p className="rounded-md bg-white/10 p-3 text-sm text-zinc-200 md:col-span-2">{message}</p>}
          <Button className="md:col-span-2" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
            {isLoading ? "Kayıt olunuyor..." : "Kayıt Ol"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-zinc-400">
          Zaten hesabın var mı?{" "}
          <Link className="font-semibold text-fuchsia-300" href="/login">
            Giriş Yap
          </Link>
        </p>
      </Card>
    </main>
  );
}
