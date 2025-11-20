import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UniQube Pod Estimator",
  description:
    "Internal tooling to detect bathrooms, configure specs, and generate UniQube bathroom pod proposals."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50">{children}</div>
      </body>
    </html>
  );
}
