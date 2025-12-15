import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Termokimia: Eksoterm & Endoterm",
  description:
    "Modul belajar interaktif termokimia (eksoterm dan endoterm) dengan React + Next.js.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
