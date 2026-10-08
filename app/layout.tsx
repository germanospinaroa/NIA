import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const body = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nia.gritlab.pro"),
  title: "Sabes lo que quieres. ¿Por qué terminas haciendo otra cosa?",
  description:
    "Dices que sí cuando querías decir que no. Preguntas decisiones que ya habías tomado. Te callas para no incomodar. NIA trabaja contigo para que eso empiece a cambiar.",
  openGraph: {
    type: "website",
    url: "https://nia.gritlab.pro/",
    siteName: "NIA",
    title: "Sabes lo que quieres. ¿Por qué terminas haciendo otra cosa?",
    description:
      "Dices que sí cuando querías decir que no. Preguntas decisiones que ya habías tomado. Te callas para no incomodar. NIA trabaja contigo para que eso empiece a cambiar.",
    images: [
      {
        url: "/og/nia-whatsapp-preview.jpg",
        width: 1200,
        height: 630,
        alt: "NIA — Otra vez no me hice caso.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sabes lo que quieres. ¿Por qué terminas haciendo otra cosa?",
    description:
      "Dices que sí cuando querías decir que no. Preguntas decisiones que ya habías tomado. Te callas para no incomodar. NIA trabaja contigo para que eso empiece a cambiar.",
    images: ["/og/nia-whatsapp-preview.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${body.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
