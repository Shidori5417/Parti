import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:bg-fuchsia-400",
        variant === "secondary" && "border border-white/10 bg-white/10 text-white hover:bg-white/15",
        variant === "ghost" && "text-zinc-200 hover:bg-white/10",
        variant === "danger" && "bg-red-500 text-white hover:bg-red-400",
        className,
      )}
      {...props}
    />
  );
}
