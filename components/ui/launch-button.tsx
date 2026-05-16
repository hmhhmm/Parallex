"use client";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LaunchButtonProps {
  label?: string;
  className?: string;
}

export function LaunchButton({ label = "Launch App", className }: LaunchButtonProps) {
  return (
    <button
      className={cn(
        "group relative overflow-hidden inline-flex items-center",
        "h-12 px-8 rounded-sm cursor-pointer",
        "border border-cyan-400/40 bg-cyan-400/5 text-white",
        "text-[11px] font-medium tracking-[0.32em] uppercase",
        "transition-all duration-500",
        "hover:border-cyan-400/90 hover:bg-cyan-400/10",
        "hover:shadow-[0_0_40px_rgba(0,255,255,0.18)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
        className
      )}
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      <span className="transition-opacity duration-500 group-hover:opacity-0">
        {label}
      </span>
      <i className="absolute right-1 top-1 bottom-1 z-10 grid place-items-center rounded-[2px] w-0 overflow-hidden transition-all duration-500 bg-transparent group-hover:w-[calc(100%-0.5rem)] group-hover:bg-cyan-400/15 group-active:scale-95">
        <ChevronRight size={15} strokeWidth={2} className="text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200" aria-hidden="true" />
      </i>
    </button>
  );
}
