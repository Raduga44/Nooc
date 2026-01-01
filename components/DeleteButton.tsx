"use client";

import { deletePost } from "@/app/actions/post";

// 詳細ページでもルーム画面でも使えるようにデザインを共通化しました
export default function DeleteButton({ postId, variant = "icon" }: { 
  postId: number, 
  variant?: "icon" | "text" 
}) {
  const handleDelete = async (formData: FormData) => {
    if (confirm("本当にこの作品を削除しますか？")) {
      await deletePost(formData);
    }
  };

  return (
    <form action={handleDelete}>
      <input type="hidden" name="postId" value={postId} />
      
      {variant === "icon" ? (
        // ルーム一覧用の「✕」ボタン
        <button 
          type="submit" 
          className="bg-red-500 text-white w-10 h-10 rounded-full font-black shadow-lg hover:bg-red-600 transition transform hover:scale-110 flex items-center justify-center"
        >
          ✕
        </button>
      ) : (
        // 詳細ページ用の「テキスト」ボタン
        <button 
          type="submit"
          className="bg-red-50 text-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
        >
          この投稿を削除する
        </button>
      )}
    </form>
  );
}