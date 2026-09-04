import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nimblux.xyz"),
  alternates: {
    canonical: "https://www.nimblux.xyz",
  },
  title: {
    default: "NIMBLUX — Technology • Innovation • Community",
    template: "%s | NIMBLUX",
  },
  description:
    "NIMBLUX brings internships, hackathons, jobs, events, scholarships, competitions and career opportunities together in one trusted platform.",
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
  authors: [{ name: "NIMBLUX Team" }],
  creator: "NIMBLUX",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.nimblux.xyz",
    title: "NIMBLUX — Opportunities that shape your future.",
    description:
      "NIMBLUX brings internships, hackathons, jobs, events, scholarships, competitions and career opportunities together in one trusted platform.",
    siteName: "NIMBLUX",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIMBLUX — Technology • Innovation • Community",
    description:
      "NIMBLUX brings internships, hackathons, jobs, events, scholarships, competitions and career opportunities together in one trusted platform.",
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
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-bronze-500/20 selection:text-ivory-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
