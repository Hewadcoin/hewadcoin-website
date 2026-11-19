
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEWAD COIN",
  description: "The Future of Global Trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
