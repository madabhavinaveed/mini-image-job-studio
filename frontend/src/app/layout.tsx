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
  title: "Occibo Mini Image Job Studio",
  description: "Create a children's book illustration request, queue it, and review the result.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper bg-[radial-gradient(1000px_420px_at_8%_-10%,rgba(196,92,58,0.08),transparent_55%)] font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
