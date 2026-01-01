import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";

const prisma = new PrismaClient();

export default async function MyIllustsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("nooc_user_id")?.value;

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-bold">ログインが必要です</p>
      </div>
    );
  }

  // 自分の投稿（Post）を取得
  const myPosts = await prisma.post.findMany({
    where: { userId: userId },
    include: { room: true }, // どのルームで描いたかも取得
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-black">← BACK TO TOP</Link>
          <h1 className="text-5xl font-black italic tracking-tighter mt-2 uppercase">My Illusts</h1>
          <p className="text-zinc-400 text-sm font-bold mt-2">{myPosts.length} POSTS</p>
        </header>

        {myPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {myPosts.map((post) => (
              <div key={post.id} className="group relative">
                <div className="bg-zinc-50 rounded-[32px] overflow-hidden border border-zinc-100 aspect-square relative shadow-sm hover:shadow-xl transition-all">
                  {/* ここにイラスト（キャンバスデータ）を表示 */}
                  {/* 今回は仮でURLまたはプレースホルダー */}
                  <div className="p-4 h-full flex items-center justify-center text-[10px] text-zinc-300">
                    {/* post.content がデータURLならimgタグで表示 */}
                    <img src={post.content} alt="My drawing" className="object-contain w-full h-full" />
                  </div>

                  {/* ホバー時に情報を表示 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-white text-[10px] font-bold mb-1 uppercase tracking-widest">Room</p>
                    <p className="text-white font-black mb-4">{post.room?.name || "Unknown Room"}</p>
                    <Link 
                      href={`/room/${post.roomId}`} 
                      className="bg-white text-black text-[10px] px-4 py-2 rounded-full font-bold hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      この部屋へ行く
                    </Link>
                  </div>
                </div>
                <p className="mt-3 text-[10px] font-mono text-zinc-400 text-center">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border-2 border-dashed border-zinc-100 rounded-[64px]">
            <span className="text-4xl block mb-4">🎨</span>
            <p className="text-zinc-300 font-bold">まだイラストを投稿していません</p>
            <Link href="/" className="text-blue-500 text-sm font-bold hover:underline mt-4 inline-block">
              ルームを探しに行く
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}