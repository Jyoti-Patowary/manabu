import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "学ぶ MANABU | Japanese Flashcards (JLPT N5 - N1)",
  description: "Master Japanese vocabulary, kanji, and grammar from N5 to N1 with spaced repetition (SRS).",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FBFBFA] text-slate-900 selection:bg-rose-100 selection:text-rose-900 font-japanese">
        {children}
      </body>
    </html>
  );
}
