import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auditor de tiempo",
  description: "Registra manualmente en qué gastas el tiempo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
