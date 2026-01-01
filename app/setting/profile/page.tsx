import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { updateDisplayName } from "@/app/actions/user";
import Link from "next/link";
import DeleteAccountButton from "@/components/DeleteAccountButton"; // 追加

const prisma = new PrismaClient();

export default async function EditProfilePage() {
  const userId = (await cookies()).get("nooc_user_id")?.value;
  if (!userId) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8 font-sans flex items-center justify-center">
      <div className="max-w-md w-full space-y-12">
        <div className="space-y-4">
          <Link href="/" className="text-zinc-500 font-black text-xs tracking-widest hover:text-white transition-colors">
            ← BACK TO INDEX
          </Link>
          <h1 className="text-6xl font-black italic tracking-tighter leading-none">
            RENAME<br/>
          </h1>
          <p className="text-zinc-600 font-bold italic tracking-[0.2em] text-[16px]">
            新しい表示名を入力してください
          </p>
        </div>

        {/* 名前変更フォーム */}
        <form action={updateDisplayName} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 ml-6">Display Name</label>
            <input 
              name="name"
              type="text"
              defaultValue={user?.name || ""}
              placeholder="新しい名前を入力..."
              required
              maxLength={20}
              className="w-full bg-zinc-800 p-8 rounded-[32px] text-2xl font-black outline-none focus:ring-4 focus:ring-blue-600 transition-all border border-zinc-700 text-white"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-white text-black p-8 rounded-[32px] font-black text-2xl shadow-2xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
          >
            この名前に変更する！
          </button>
        </form>

        {/* --- ここからアカウント削除セクション --- */}
        <div className="pt-12 border-t border-zinc-800 flex flex-col items-center gap-6">
          <div className="text-center space-y-2">
            <p className="text-zinc-700 text-[13px] font-black uppercase tracking-[0.4em]">アカウント消去</p>
            <p className="text-zinc-500 text-[16px] font-bold">以下のボタンをクリックすると、全てのデータがサーバーから消去されます</p>
          </div>
          
          <DeleteAccountButton />
        </div>
      </div>
    </main>
  );
}