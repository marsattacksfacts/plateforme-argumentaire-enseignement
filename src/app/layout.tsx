import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Facteur·ices à bicyclette — Périple épiscolaire 2026",
  description: "169 km à vélo à travers la Wallonie pour porter les lettres des citoyen·nes au Parlement de la FWB. Plus de 10 000 lettres récoltées, une aventure humaine et militante.",
  openGraph: {
    title: "Facteur·ices à bicyclette — Périple épiscolaire 2026",
    description: "169 km à vélo à travers la Wallonie pour porter les lettres des citoyen·nes au Parlement de la FWB.",
    type: "website",
    locale: "fr_BE",
    images: [
      {
        url: "/photos/chevaux-de-frise.jpeg",
        width: 1200,
        height: 630,
        alt: "Vélos bloqués par des chevaux de frise devant le Parlement de la FWB",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F0E8', color: '#1C1917' }}>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}