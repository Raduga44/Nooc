"use client"; // クライアント側でURLを読み取るために追加

import { registerUser } from "../actions/user";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// エラー表示用のサブコンポーネント
function RegisterForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <form action={registerUser} className="space-y-6 text-black">
      {/* エラーメッセージの表示 */}
      {error === "taken" && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-xs font-black animate-bounce">
          これは表示されないはずだ
        </div>
      )}

      <div className="space-y-2 text-black">
        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">User ID</label>
        <input 
          name="id" 
          required 
          maxLength={32}
          pattern="^[a-zA-Z0-9]+$"
          placeholder="半角英数(変更不可)" 
          className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-black" 
        />
      </div>

      <div className="space-y-2 text-black">
        <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1 text-black">Display Name</label>
        <input 
          name="name" 
          required 
          placeholder="表示される名前" 
          className="w-full bg-zinc-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-black" 
        />
      </div>

      <button className="w-full bg-blue-600 text-white font-black p-5 rounded-3xl hover:bg-blue-700 transition shadow-xl text-xl transform active:scale-95">
        登録して始める
      </button>
    </form>
  );
}

// メインのページコンポーネント
export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-zinc-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl text-black">
        <h1 className="text-3xl font-black mb-2 italic">Welcome to Nooc</h1>
        <p className="text-zinc-500 font-bold mb-8 italic">IDと表示名を決める</p>

        {/**/}
        <Suspense fallback={<p className="text-center font-black animate-pulse">Loading...</p>}>
          <RegisterForm />
        </Suspense>
        
        <p className="text-center mt-6 text-zinc-400 text-[10px] leading-relaxed">
          ※IDは後から変更できません。<br />
          ※表示名は管理画面から変更可能です。<br />
          ※作成できない場合は、そのIDが既に使われている可能性があります。<br />
          別のIDを試してください。
        </p>
      </div>
    </main>
  );
}