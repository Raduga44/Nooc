import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import DeleteRoomButton from "@/components/DeleteRoomButton";
import { addRoomComment, deleteRoomComment } from "@/app/actions/post";

const prisma = new PrismaClient();

export default async function RoomPage({ params, searchParams }: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ pw?: string }> 
}) {
  const { id } = await params;
  const { pw } = await searchParams;
  const roomId = Number(id);

  const userId = (await cookies()).get("nooc_user_id")?.value;
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  const isAdmin = user?.isAdmin === true;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { 
      user: true, 
      posts: { 
        include: { user: true },
        orderBy: { createdAt: "desc" } 
      },
      roomComments: { 
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 50
      }
    },
  });

  if (!room) notFound();

  const canDeleteRoom = isAdmin || (userId && room.userId === userId);

  if (room.password && room.password !== pw) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-8 font-sans">
        <div className="max-w-md w-full text-center space-y-8">
          <span className="text-7xl block animate-bounce">🔒</span>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">{room.name}</h1>
          <form className="space-y-4 text-black">
            <input name="pw" type="password" placeholder="パスワードを入力" required className="w-full p-6 rounded-3xl text-center text-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500 transition-all" />
            <button className="w-full bg-blue-600 text-white p-6 rounded-3xl font-black text-xl shadow-xl hover:bg-blue-700 transition transform active:scale-95">入室する</button>
          </form>
          <Link href="/" className="text-zinc-500 font-bold hover:text-zinc-400 transition inline-block mt-4">← 一覧に戻る</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-black font-sans pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* ヘッダー */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end py-12 mb-12 border-b border-zinc-200 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-blue-600 font-black text-xs hover:translate-x-[-4px] transition-transform tracking-widest uppercase">← ROOMS</Link>
              {canDeleteRoom && <DeleteRoomButton roomId={room.id} />}
            </div>
            <h1 className="text-7xl font-black tracking-tighter italic leading-none uppercase">{room.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px]">{room.password ? "プライベート" : "パブリック"}</p>
              <span className="text-zinc-200">/</span>
              <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Owner: <span className="text-zinc-900">{room.user?.name}</span></p>
            </div>
          </div>
          <Link href={`/upload?roomId=${roomId}`} className="bg-zinc-900 text-white px-10 py-5 rounded-full font-black text-sm shadow-2xl hover:bg-blue-600 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest">作品を投稿する</Link>
        </header>

        {/* 作品一覧 */}
        <section className="mb-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {room.posts.map((post) => (
            <div key={post.id} className="relative group">
              {(isAdmin || userId === post.userId) && <div className="absolute top-4 right-4 z-30"><DeleteButton postId={post.id} variant="icon" /></div>}
              <Link href={`/post/${post.id}`}>
                <div className="bg-white rounded-[32px] shadow-sm overflow-hidden border border-zinc-100 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                  <div className="aspect-[4/5] bg-zinc-50 p-4"><img src={post.imageUrl} className="w-full h-full object-contain" alt="" /></div>
                  <div className="p-6"><h3 className="font-black text-xl truncate italic uppercase">{post.title}</h3></div>
                </div>
              </Link>
            </div>
          ))}
        </section>

        {/* チャットセクション */}
        <section className="max-w-2xl mx-auto border-t border-zinc-200 pt-16">
          <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-10 text-center">ルームチャット</h2>

          {userId ? (
            <form action={addRoomComment} className="relative mb-12">
              <input type="hidden" name="roomId" value={roomId} />
              <input name="content" placeholder="メッセージを入力..." required autoComplete="off" className="w-full bg-white rounded-full py-6 px-10 pr-36 font-bold text-sm shadow-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
              <button className="absolute right-3 top-3 bottom-3 bg-blue-600 text-white font-black px-8 rounded-full text-[10px] uppercase">送信</button>
            </form>
          ) : (
            <div className="bg-zinc-100 p-8 rounded-[32px] text-center mb-12"><p className="text-zinc-400 font-black text-[10px] uppercase">ログインして参加</p></div>
          )}

          <div className="space-y-6">
            {room.roomComments.map((comment) => (
              <div key={comment.id} className={`flex gap-4 group ${comment.userId === userId ? 'flex-row-reverse' : ''}`}>
                {/* アイコン：NOOCブルー */}
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-black text-xs text-white uppercase shadow-sm shrink-0">{comment.user.name[0]}</div>
                
                <div className={`flex flex-col ${comment.userId === userId ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="font-black text-[11px] italic uppercase">{comment.user.name}</span>
                    <span className="text-[8px] text-zinc-300 font-bold">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="relative">
                    {/* 自分の吹き出し：NOOCブルー */}
                    <div className={`px-6 py-4 rounded-[24px] text-sm font-medium shadow-sm ${comment.userId === userId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-zinc-800 rounded-tl-none border border-zinc-100'}`}>
                      {comment.content}
                    </div>
                    {/* 削除ボタン：ホバーで表示 */}
                    {(comment.userId === userId || isAdmin) && (
                      <form action={deleteRoomComment} className={`absolute top-1/2 -translate-y-1/2 ${comment.userId === userId ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <input type="hidden" name="commentId" value={comment.id} /><input type="hidden" name="roomId" value={roomId} />
                        <button className="text-zinc-300 hover:text-red-500 p-2 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}