import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farkel Scorekeeper",
  description: "Multiplayer 6-dice Farkel score tracker with live sync",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
