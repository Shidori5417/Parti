import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20", className)}
      {...props}
    />
  );
}

export function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <Card>
      <p className="text-sm text-zinc-400">{label}</p>
      <p className={cn("mt-2 text-3xl font-bold text-white", tone)}>{value}</p>
    </Card>
  );
}
