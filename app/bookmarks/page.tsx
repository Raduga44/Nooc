"use client";

import Link from "next/link";

export default function BookmarksPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-black p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-black">← BACK TO TOP</Link>
        <h1 className="text-4xl font-black italic tracking-tighter mt-2 mb-12 uppercase">Bookmarks</h1>
        
        <div className="bg-white rounded-[40px] p-12 text-center border border-zinc-100 shadow-sm">
          <p className="text-zinc-400 font-bold">ブックマーク機能が追加されるまで、気長にお待ちください。</p>
        </div>
      </div>
    </div>
  );
}