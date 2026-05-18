import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Seguimiento — Consejería Bíblica",
  description: "Sistema de seguimiento de sesiones de consejería bíblica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geist.className} antialiased bg-stone-50 text-stone-900`}>
        {children}
      </body>
    </html>
  );
}
