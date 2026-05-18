export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      <header className="py-4 px-6 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <span className="text-lg">✝️</span>
          <span className="font-semibold text-stone-700 text-sm">Seguimiento — Consejería Bíblica</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-10">{children}</main>
    </div>
  );
}
