import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { ModalHost } from "@/components/modal-host";

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Niche Scouter — Live market reconnaissance",
  description:
    "Give us an industry, we'll hand back the underserved gaps — with the evidence attached.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${plexMono.variable}`}>
      <body>
        <Providers>
          <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
            <Header />
            {children}
            <ModalHost />
          </div>
        </Providers>
      </body>
    </html>
  );
}
