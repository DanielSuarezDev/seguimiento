"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/personas",  label: "Personas",  icon: "👥" },
];

const configItems = [
  { href: "/configuracion/tipos-consejeria", label: "Tipos de consejería" },
  { href: "/configuracion/formularios",      label: "Formularios" },
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

  const enConfiguracion = pathname.startsWith("/configuracion");

  return (
    <aside className="w-56 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="px-5 py-5 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">✝️</span>
          <div>
            <p className="font-semibold text-stone-800 text-sm leading-tight">Seguimiento</p>
            <p className="text-[11px] text-stone-400">Consejería Bíblica</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-amber-50 text-amber-800 font-medium"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Configuración con sub-items */}
        <div className="pt-1">
          <Link
            href="/configuracion/tipos-consejeria"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              enConfiguracion
                ? "bg-amber-50 text-amber-800 font-medium"
                : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
            }`}
          >
            <span className="text-base">⚙️</span>
            Configuración
          </Link>
          <div className="ml-7 mt-0.5 space-y-0.5 border-l border-stone-100 pl-2">
            {configItems.map((sub) => {
              const isActiveSub = pathname === sub.href || pathname.startsWith(sub.href + "/");
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`block px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    isActiveSub
                      ? "text-amber-700 font-medium bg-amber-50/50"
                      : "text-stone-400 hover:text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {sub.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-3 border-t border-stone-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors"
        >
          <span className="text-base">🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
