import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CPGRAMS - Centralized Public Grievance Redress and Monitoring System",
  description:
    "A portal for registering and monitoring public grievances in India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <header className="w-full py-4 border-b bg-primary text-white fixed top-0 left-0 right-0 z-50">
          <div className="container mx-auto flex justify-between items-center px-4">
            <div className="flex items-center gap-3 space-x-2">
              <div className="h-10 w-10 bg-background rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">GOI</span>
              </div>
              <Link href="/">
                <h1 className="text-xl font-bold">CPGRAMS</h1>
              </Link>
            </div>
            <div className="text-sm text-white">
              <span>
                Centralized Public Grievance Redress and Monitoring System
              </span>
            </div>
          </div>
        </header>
        <main className="flex-grow overflow-y-auto pt-[4.5rem]">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
