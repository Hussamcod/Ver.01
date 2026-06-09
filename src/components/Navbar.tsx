"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/icp", label: "ICP" },
  { href: "/personas", label: "Buyer Personas" },
  { href: "/leads", label: "Lead Discovery" },
  { href: "/pipeline", label: "Call Pipeline" },
  { href: "/export", label: "Export to CRM" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center gap-8">
      <span className="font-bold text-lg tracking-tight text-blue-400">GTM Engine</span>
      <div className="flex gap-6">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm font-medium transition-colors ${
              pathname === l.href
                ? "text-blue-400 border-b-2 border-blue-400 pb-0.5"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
