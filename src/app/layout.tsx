import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MusicPlayerProvider } from "@/lib/useMusicPlayer";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Anime Music Player - Nikmati Musik dengan Style Anime",
  description: "Website music player modern dengan style anime yang menakjubkan. Streaming musik berkualitas tinggi dengan visualisasi dan animasi yang memukau.",
  keywords: ["music player", "anime", "streaming", "cloudinary", "modern UI", "music"],
  authors: [{ name: "Anime Music Player Team" }],
  creator: "Anime Music Player",
  publisher: "Anime Music Player",
  openGraph: {
    title: "Anime Music Player",
    description: "Nikmati musik dengan style anime yang menakjubkan",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime Music Player",
    description: "Nikmati musik dengan style anime yang menakjubkan",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#FF10F0",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#FF10F0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <MusicPlayerProvider>
          {children}
        </MusicPlayerProvider>
      </body>
    </html>
  );
}
