import type { Metadata } from "next";
import { Caveat, Ma_Shan_Zheng } from "next/font/google";
import "./globals.css";

const hand = Ma_Shan_Zheng({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

const journal = Caveat({
  subsets: ["latin"],
  variable: "--font-journal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "待办手账 | Tasks",
  description: "复古手账风格待办清单",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${hand.variable} ${journal.variable}`}>
      <body className="paper-texture min-h-screen">{children}</body>
    </html>
  );
}
