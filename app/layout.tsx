import { SessionProvider } from "next-auth/react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HypeMeUp - Level Up Your Career",
  description: "Track your daily wins, auto-generate weekly reports, and level up your resume. One achievement at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
