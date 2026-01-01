"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { createPost } from "@/app/actions/post";
import { useState } from "react";

export default function UploadPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState(""); // 文字数カウント用

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    // 修正点：formDataから直接ファイルを取得してチェックする
    const file = formData.get("image") as File;
    if (!file || file.size === 0 || !roomId) {
      alert("画像を選択してください");
      return;
    }
    
    // 修正点：imageUrlをセットするのではなく、roomIdをセットしてそのまま送信
    // (画像のファイル本体は input[name="image"] によって既にformDataに入っています)
    formData.set("roomId", roomId);
    await createPost(formData);
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-black font-sans flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <header className="mb-12 text-center">
          <h1 className="text-6xl font-black text-blue-600 tracking-tighter mb-2 italic">Upload</h1>
          <p className="text-zinc-400 font-bold tracking-widest uppercase text-sm">作品を公開する</p>
        </header>

        <form action={handleSubmit} className="space-y-8 bg-white p-12 rounded-[48px] shadow-xl border border-zinc-100">
          <div className="space-y-4">
            <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Image File</label>
            <div className="relative group">
              {/* 修正点：name="image" を追加。これでファイルそのものがサーバーに飛びます */}
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                required 
              />
              <div className="border-4 border-dashed border-zinc-100 rounded-[32px] p-12 text-center group-hover:border-blue-200 transition-colors">
                {preview ? <img src={preview} className="max-h-64 mx-auto rounded-xl shadow-md" /> : (
                  <div className="space-y-2">
                    <span className="text-4xl block"></span>
                    <p className="text-zinc-400 font-bold">クリックして画像を選択</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 ml-1 uppercase">Title</label>
            <input name="title" placeholder="作品のタイトル（任意）" className="w-full bg-zinc-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 ml-1 uppercase flex justify-between">
              <span>Caption</span>
              <span className={`${caption.length >= 160 ? "text-red-500" : "text-zinc-400"}`}>{caption.length}/160</span>
            </label>
            <textarea 
              name="caption" 
              maxLength={160}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="作品の説明（160文字以内）" 
              className="w-full bg-zinc-50 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium h-32 resize-none"
            />
          </div>

          <div className="flex flex-col gap-4">
            <button className="w-full bg-blue-600 text-white font-black p-6 rounded-3xl text-xl shadow-xl hover:bg-blue-700 transition transform active:scale-95">投稿を完了する</button>
            <button type="button" onClick={() => router.back()} className="text-zinc-400 font-bold hover:text-zinc-600 transition">キャンセル</button>
          </div>
        </form>
      </div>
    </main>
  );
}