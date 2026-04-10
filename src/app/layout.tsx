import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "투자 아이디어 분석 툴",
  description: "AI를 활용한 투자 아이디어 분석 및 수혜 기업 탐색",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-sans antialiased bg-gray-50 min-h-screen`}>
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-6xl">{children}</main>
      </body>
    </html>
  );
}
