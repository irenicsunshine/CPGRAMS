import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="w-full py-4 border-b bg-[#1d4e8f] text-white">
          <div className="container mx-auto flex justify-between items-center px-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#1d4e8f] font-bold text-sm">GOI</span>
              </div>
              <h1 className="text-xl font-bold">CPGRAMS</h1>
            </div>
            <div className="text-sm">
              <span>
                Centralized Public Grievance Redress and Monitoring System
              </span>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
