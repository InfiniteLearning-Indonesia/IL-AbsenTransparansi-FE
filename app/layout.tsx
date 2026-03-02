import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";

const lexendDeca = Lexend_Deca({
  variable: "--font-lexend-deca",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Absensi Tools - Infinite Learning",
  description: "Sistem Manajemen Absensi Mentee — Infinite Learning Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexendDeca.variable} ${lexendDeca.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
