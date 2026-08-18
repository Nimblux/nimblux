import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


export const metadata: Metadata = {
  metadataBase: new URL("https://nimblux.xyz"),

  title: {
    default: "NIMBLUX — Internships, Hackathons, Jobs & Opportunities",
    template: "%s | NIMBLUX",
  },

  description:
    "Discover verified internships, hackathons, jobs, scholarships, events, competitions, and career opportunities on NIMBLUX — Technology • Innovation • Community.",

  keywords: [
    "internships",
    "hackathons",
    "jobs",
    "student jobs",
    "tech opportunities",
    "scholarships",
    "coding competitions",
    "software engineering",
    "NIMBLUX",
  ],

  authors: [{ name: "Dev Kumar" }],
  creator: "NIMBLUX",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nimblux.xyz",
    title: "NIMBLUX — Discover Opportunities. Build Your Future.",
    description:
      "The premier student-focused technology platform for internships, hackathons, jobs, events, competitions, and scholarships.",
    siteName: "NIMBLUX",
  },

  twitter: {
    card: "summary_large_image",
    title: "NIMBLUX — Technology • Innovation • Community",
    description:
      "Discover internships, hackathons, jobs, and scholarships all in one place.",
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
