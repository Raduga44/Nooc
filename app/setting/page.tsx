"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [newName, setNewName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("nooc_user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setNewName(u.name);
    } else {
      router.push("/register"); // 未登録なら戻す
    }
  }, [router]);

  const handleUpdate = () => {
    if (!newName.trim() || !user) return;
    const updatedUser = { ...user, name: newName };
    localStorage.setItem("nooc_user", JSON.stringify(updatedUser));
    alert("表示名を更新しました！");
    router.push("/");
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white text-black p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-3xl font-black italic tracking-tighter text-center">SETTINGS</h1>
        
        <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-[40px] shadow-sm">
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Display Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-white border border-zinc-200 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
          />
          <p className="mt-4 text-xs text-zinc-400 font-medium px-2">
            ※ID（{user.id}）は変更できません。
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleUpdate}
            className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold shadow-lg hover:bg-black transition-all"
          >
            更新を保存する
          </button>
          <Link href="/" className="text-center text-sm font-bold text-zinc-400 hover:text-black">
            キャンセルして戻る
          </Link>
        </div>
      </div>
    </div>
  );
}