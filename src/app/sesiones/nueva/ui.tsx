"use client";
import { ReactNode } from "react";

/* ---------- Section card ---------- */
export function Section({
  numero, titulo, descripcion, icono, tone = "default", children,
}: {
  numero: number;
  titulo: string;
  descripcion?: string;
  icono?: ReactNode;
  tone?: "default" | "private" | "highlight";
  children: ReactNode;
}) {
  const bg =
    tone === "private"
      ? "bg-stone-50 border-stone-300 border-dashed"
      : tone === "highlight"
        ? "bg-amber-50/40 border-amber-200"
        : "bg-white border-stone-200";

  return (
    <section className={`rounded-3xl border ${bg} p-6 sm:p-8 shadow-sm`}>
      <header className="mb-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold shrink-0">
          {icono ?? numero}
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-stone-800 leading-tight">
            {titulo}
          </h2>
          {descripcion && (
            <p className="text-sm text-stone-500 mt-1 leading-relaxed">{descripcion}</p>
          )}
        </div>
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/* ---------- Field wrapper ---------- */
export function Field({
  label, hint, error, children, full,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      {label && <label className="label">{label}</label>}
      {children}
      {hint && !error && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/* ---------- Chip selectors ---------- */
export function ChipsMulti({
  opciones, valores, onToggle,
}: { opciones: string[]; valores: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((op) => {
        const activo = valores.includes(op);
        return (
          <button
            key={op}
            type="button"
            onClick={() => onToggle(op)}
            className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
              activo
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            {op}
          </button>
        );
      })}
    </div>
  );
}

export function ChipsSingle<T extends string>({
  opciones, valor, onSelect,
}: { opciones: { value: T; label: string }[]; valor: T | ""; onSelect: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((op) => {
        const activo = valor === op.value;
        return (
          <button
            key={op.value}
            type="button"
            onClick={() => onSelect(op.value)}
            className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
              activo
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-stone-200 text-stone-600 hover:border-stone-300"
            }`}
          >
            {op.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Char-count textarea ---------- */
export function CountingTextarea({
  rows = 4, max = 1500, value, onChange, placeholder, name,
}: {
  rows?: number;
  max?: number;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  name?: string;
}) {
  return (
    <div>
      <textarea
        name={name}
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input resize-none leading-relaxed"
      />
      <div className="flex justify-end mt-1">
        <span className={`text-xs ${(value?.length ?? 0) > max ? "text-red-600" : "text-stone-400"}`}>
          {value?.length ?? 0}/{max}
        </span>
      </div>
    </div>
  );
}
