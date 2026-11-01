import type { Metadata } from "next";
import "./globals.css";
import "./cinematic.css";
import "./mobile.css";
import { introBootstrap, introCriticalStyles } from "@/lib/intro-bootstrap";
export const metadata: Metadata = {
  title: "CLJ Locações e Soluções | Caminhões e Equipamentos",
  description:
    "Conheça a prévia demonstrativa da CLJ Locações e Soluções. Caminhões, equipamentos e soluções de transporte. Converse com a equipe pelo WhatsApp.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "CLJ Locações e Soluções",
    description:
      "Potência para mover seus projetos. Prévia demonstrativa de caminhões, equipamentos e soluções.",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/images/truck.webp",
        width: 1536,
        height: 1024,
        alt: "Caminhão ilustrativo gerado por IA",
      },
    ],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: introCriticalStyles }} />
        <script
          id="clj-intro-bootstrap"
          dangerouslySetInnerHTML={{ __html: introBootstrap }}
        />
      </head>
      <body>
        <noscript>
          <style>{`.intro { display:none!important; } html,body { overflow:auto!important; } .reveal { opacity: 1 !important; transform: none !important; } .hero-line, .hero-image-frame { transform: none !important; }`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
