import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QTi - Quant Trading Bot",
  description: "Автоматизированный торговый бот для количественной торговли",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
