import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // Import your providers file
import Sidebar from "@/components/custom/sidebar"; // Assuming you made a sidebar component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GearGuard | Asset Maintenance",
  description: "Dynamic asset tracking and maintenance management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Sidebar remains visible on all pages */}
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto pt-4 px-4">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}