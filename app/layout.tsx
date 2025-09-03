import type { Metadata } from "next";
import "./globals.css";
import "./mathlive.css";
import "./form-components.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AKILI Mobile Administration",
  description: "Administration panel for AKILI Mobile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
