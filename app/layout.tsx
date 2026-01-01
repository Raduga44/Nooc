import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Nooc | イラスト共有",
  description: "ルームを作って、自分の作品を見てもらおう！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900`}
      >
        {/* メインコンテンツ */}
        {children}

        {/* 右下の著作権フローティングボタン */}
        <Link 
          href="/copyright" 
          className="fixed bottom-8 right-8 w-12 h-12 bg-white/80 hover:bg-blue-600 backdrop-blur-md text-zinc-400 hover:text-white rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 shadow-2xl z-50 border border-zinc-200 hover:border-blue-500 group"
          title="Copyright Information"
        >
          <span className="group-hover:scale-125 transition-transform duration-300">©</span>
        </Link>
      </body>
    </html>
  );
}