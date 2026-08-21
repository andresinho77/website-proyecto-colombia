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
      <head>
        {/* Blocking, pre-hydration script — avoids a layout shift for a
            returning visitor who already dismissed EmergencyBanner (US-1.5).
            SSR always renders the banner open (the server can't read
            localStorage), and React's useEffect correction only runs after
            hydration — by then the banner would already have painted once
            and then disappeared, a visible CLS. This runs synchronously in
            <head>, before the banner's markup is even parsed, and adds a
            class to <html> that a CSS rule (app/globals.css) uses to hide
            it from the very first paint — the same "flash of wrong state"
            fix used for dark mode, applied to localStorage instead of a
            media query. Kept in sync afterwards by
            lib/localStorage.ts's setEmergencyBannerDismissed(). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('alojamiento_solidario_emergency_banner_dismissed')==='true'){document.documentElement.classList.add('eb-dismissed');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
