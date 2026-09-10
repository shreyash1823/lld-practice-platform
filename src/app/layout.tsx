import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Studio LLD",
  description:
    "A focused practice loop for low-level design: structured submissions and explainable rubric feedback.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="min-h-screen bg-[#f5f5f3] font-sans text-ink-900 antialiased">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-5">
          <header className="mb-8 flex items-center justify-between border-b border-ink-200 pb-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Studio LLD
            </Link>
            <nav className="flex items-center gap-5 text-sm text-ink-700">
              <Link href="/" className="transition-colors hover:text-ink-900">
                Problems
              </Link>
              <Link
                href="/history"
                className="transition-colors hover:text-ink-900"
              >
                Attempts
              </Link>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-12 border-t border-ink-200 pt-4 text-xs text-ink-700">
            Structured text in, rubric out. One valid design is not the only
            one.
          </footer>
        </div>
      </body>
    </html>
  );
}
