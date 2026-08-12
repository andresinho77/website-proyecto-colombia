import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alojamiento Solidario Colombia 🇨🇴 | Emergencia Terremoto 2026",
  description:
    "Plataforma pública y gratuita para conectar rápidamente a quienes necesitan alojamiento temporal con quien tiene espacio disponible tras el terremoto del 10 de agosto de 2026 en Chocó, Pereira, Cali, Quibdó, Manizales y Armenia.",
  keywords: [
    "Alojamiento Solidario Colombia",
    "Terremoto Colombia 2026",
    "Refugio Pereira",
    "Alojamiento Cali",
    "Albergue Quibdó",
    "Ayuda Emergencia Colombia",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
