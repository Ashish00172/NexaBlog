import type { Metadata } from "next";
import type React from "react";
import "@/app/globals.css";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers/providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "NexaBlog | Enterprise Blog Platform",
    template: "%s | NexaBlog"
  },
  description: "Corporate-grade blog platform for modern companies.",
  openGraph: {
    title: "NexaBlog",
    description: "Corporate-grade blog platform for modern companies.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}