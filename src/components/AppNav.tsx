"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Ahora" },
  { href: "/resumen", label: "Resumen" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 rounded-xl bg-zinc-100 p-1">
      {links.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
              active
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
