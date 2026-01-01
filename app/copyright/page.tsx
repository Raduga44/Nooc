// app/copyright/page.tsx
import Link from "next/link";

export default function CopyrightPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-8 font-sans">
      <div className="max-w-xl w-full space-y-12 text-center">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase text-zinc-500">著作権表示</h1>
        
        <div className="space-y-6 py-12 border-y border-zinc-800">
          <div className="space-y-2">
            <p className="text-xl font-bold tracking-widest">Copyright © 2025- Nooc</p>
            <p className="text-xl font-bold tracking-widest">Copyright © 2025- KoSAQ ETG.</p>
            <p className="text-xl font-bold tracking-widest">Version 0.8 '26/1/1</p>            
          </div>
          
          <p className="text-zinc-400 text-sm leading-relaxed font-medium pt-4">
            Noocのご利用は、利用者ご自身の責任において行われるものとします。
          </p>
        </div>

        <Link 
          href="/" 
          className="inline-block text-zinc-500 font-black text-xs hover:text-white transition-colors tracking-[0.3em] uppercase"
        >
          ← BACK TO HOME
        </Link>
      </div>
    </main>
  );
}