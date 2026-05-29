import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeJournal",
  description: "Track and improve your trading performance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-muted font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
