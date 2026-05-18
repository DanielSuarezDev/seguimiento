"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/personas", label: "Personas", icon: "👥" },
  { href: "/sesiones", label: "Sesiones", icon: "📋" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <aside className="w-60 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✝️</span>
          <div>
            <p className="font-semibold text-stone-800 text-sm">Seguimiento</p>
            <p className="text-xs text-stone-400">Consejería Bíblica</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-amber-50 text-amber-800 font-medium"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
