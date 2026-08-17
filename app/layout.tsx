import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// One friendly, rounded geometric sans for every text role — the
// Airbnb/Funda direction (a single warm humanist sans carrying both display
// and body via weight, not a serif+sans editorial pairing).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Alojamiento Solidario Colombia | Emergencia Terremoto 2026",
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
    <html lang="es" className={`scroll-smooth ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
