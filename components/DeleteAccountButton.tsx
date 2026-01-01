"use client";
import { deleteAccount } from "@/app/actions/user";

export default function DeleteAccountButton() {
  const handleDelete = async () => {
    // ユーザーに最後の警告を出す
    const confirmed = confirm(
      "【警告】アカウントを削除すると、あなたが作成したすべてのルームと投稿が完全に消去されます。この操作は取り消せません。本当によろしいですか？"
    );

    if (confirmed) {
      await deleteAccount();
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="text-red-500 hover:text-red-400 font-black text-[10px] uppercase tracking-[0.3em] transition-colors py-4 px-8 border border-zinc-800 rounded-full hover:border-red-500/30"
    >
      Delete Account
    </button>
  );
}