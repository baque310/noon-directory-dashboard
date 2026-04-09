import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "لوحة تحكم دليل نون",
  description: "لوحة تحكم منصة دليل نون للإعلانات والخدمات",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-cairo bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
