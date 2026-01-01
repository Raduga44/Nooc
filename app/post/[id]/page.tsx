import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { addPostComment, deleteComment } from "@/app/actions/post";

const prisma = new PrismaClient();

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  const userId = (await cookies()).get("nooc_user_id")?.value;
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { 
      user: true, 
      room: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!post) notFound();

  const isAdmin = user?.isAdmin === true;

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* 戻るボタン：ホバー時に青くなる */}
      <div className="fixed top-8 left-8 z-50">
        <Link href={`/room/${post.roomId}`} className="bg-white/80 backdrop-blur shadow-sm border border-zinc-100 hover:border-blue-600 hover:text-blue-600 p-4 rounded-full font-black text-xs transition-all flex items-center gap-2 tracking-widest uppercase">
          ← BACK TO ROOM
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row h-screen">
        {/* 左側：作品表示エリア（背景を少し青みがかったグレーに） */}
        <div className="flex-[2] bg-slate-50 flex items-center justify-center p-8 lg:p-20 relative overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title || ""} 
            className="max-w-full max-h-[85vh] object-contain shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-sm" 
          />
        </div>

        {/* 右側：詳細・コメントエリア */}
        <div className="flex-1 p-8 lg:p-16 border-l border-zinc-100 overflow-y-auto bg-white flex flex-col">
          <div className="max-w-md w-full mx-auto">
            
            <header className="mb-12">
              <p className="text-[10px] text-blue-600 font-black mb-2 tracking-[0.2em] uppercase">
              POSTED ON {post.createdAt.toLocaleDateString()}
              </p>
              <h1 className="text-6xl font-black tracking-tighter mb-8 italic leading-[0.85] break-words uppercase text-zinc-900">
                {post.title || "UNTITLED"}
              </h1>
              
              <div className="flex items-center gap-4">
                {/*  */}
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-2xl uppercase shadow-lg shadow-blue-100">
                  {post.user?.name[0]}
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] leading-none mb-2">Created by</p>
                  <p className="font-black text-2xl italic leading-none hover:text-blue-600 transition-colors cursor-default">{post.user?.name || "Anonymous"}</p>
                </div>
              </div>
            </header>

            {/* キャプション：左側に青いアクセントライン */}
            <div className="mb-12 bg-blue-50/50 border-l-4 border-blue-600 p-8 rounded-r-[32px]">
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mb-4">Caption</p>
              <p className="text-zinc-800 text-lg leading-relaxed whitespace-pre-wrap font-medium italic">
                {post.caption || "この作品には説明がありません。"}
              </p>
            </div>

            {/* コメントセクション */}
            <div className="mb-12 pt-8 border-t border-zinc-100">
              <h2 className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-8">
                Comments ({post.comments.length})
              </h2>
              
              <div className="space-y-8 mb-10">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 group relative">
                    {/* コメントアイコンもホバーで青く */}
                    <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-black text-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all uppercase shadow-sm">
                      {comment.user.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-black text-sm italic uppercase tracking-tight text-zinc-900">{comment.user.name}</p>
                        <p className="text-[9px] text-zinc-300 font-bold uppercase">{comment.createdAt.toLocaleDateString()}</p>
                      </div>
                      <p className="text-zinc-600 text-[15px] leading-snug font-medium pr-8">{comment.content}</p>
                    </div>

                    {(comment.userId === userId || isAdmin) && (
                      <form action={deleteComment} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <input type="hidden" name="commentId" value={comment.id} />
                        <input type="hidden" name="postId" value={postId} />
                        <button className="text-zinc-200 hover:text-red-500 transition-colors p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </form>
                    )}
                  </div>
                ))}
                
                {post.comments.length === 0 && (
                  <div className="py-10 border-2 border-dashed border-blue-50 rounded-[32px] text-center bg-zinc-50/30">
                    <p className="text-zinc-300 italic font-black text-sm uppercase tracking-widest">まだコメントがありません</p>
                  </div>
                )}
              </div>

              {/* 投稿フォーム：送信ボタンをNOOCブルーに */}
              {userId ? (
                <form action={addPostComment} className="flex flex-col gap-4">
                  <input type="hidden" name="postId" value={postId} />
                  <textarea 
                    name="content" 
                    required 
                    placeholder="感想を伝える..." 
                    className="w-full bg-zinc-50 rounded-[24px] p-6 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all min-h-[120px] resize-none border border-transparent focus:border-blue-100"
                  />
                  <button className="bg-blue-600 text-white font-black py-5 rounded-full hover:bg-zinc-900 transition-all uppercase text-xs tracking-[0.3em] shadow-xl shadow-blue-100 active:scale-95">
                    コメントを投稿
                  </button>
                </form>
              ) : (
                <div className="bg-zinc-50 p-8 rounded-[32px] text-center border border-zinc-100">
                  <Link href="/register" className="text-zinc-400 font-black text-xs uppercase tracking-[0.2em] hover:text-blue-600 transition-colors inline-block">
                    Join the conversation →
                  </Link>
                </div>
              )}
            </div>

            {/* フッター：タグ風の表示 */}
            <div className="pt-8 border-t border-zinc-100">
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-3">Posted In</p>
              <Link href={`/room/${post.roomId}`} className="text-2xl font-black text-blue-600 hover:text-zinc-900 italic transition-colors leading-none inline-block">
                # {post.room.name}
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}