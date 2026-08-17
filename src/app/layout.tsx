import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "NIMBLUX — Technology • Innovation • Community",
    template: "%s | NIMBLUX",
  },
  description:
    "Discover verified internships, global hackathons, high-growth jobs, tech events, competitions, and scholarships — all in one student-focused platform.",
  keywords: [
    "internships",
    "hackathons",
    "student jobs",
    "tech opportunities",
    "scholarships",
    "coding competitions",
    "software engineering",
    "NIMBLUX",
  ],
  authors: [{ name: "NIMBLUX Team" }],
  creator: "NIMBLUX",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nimblux.com",
    title: "NIMBLUX — Discover Opportunities. Build Your Future.",
    description:
      "The premier student-focused technology platform for internships, hackathons, jobs, events, and scholarships.",
    siteName: "NIMBLUX",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIMBLUX — Technology • Innovation • Community",
    description:
      "Discover verified internships, hackathons, jobs, and scholarships all in one place.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
