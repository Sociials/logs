import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import AsciiBackground from "./components/AsciiBackground";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Logs | Sociials",
  description: "Live status updates and announcements from Sociials Discord server",
  keywords: ["logs", "status", "discord", "sociials", "announcements"],
  authors: [{ name: "Sociials" }],
  openGraph: {
    title: "Logs | Sociials",
    description: "Live status updates and announcements",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} ${jetbrainsMono.className}`}>
        <div className="scanlines" aria-hidden="true" />
        <AsciiBackground />
        {children}
      </body>
    </html>
  );
}
