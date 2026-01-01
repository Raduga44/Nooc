import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function MyRoomsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("nooc_user_id")?.value;

  // 1. ログインチェック
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans p-6">
        <div className="text-center bg-white p-12 rounded-[48px] shadow-sm border border-zinc-100">
          <p className="text-zinc-400 font-black mb-6 uppercase tracking-[0.3em] text-xs">Access Denied</p>
          <Link href="/register" className="text-blue-600 font-black hover:scale-105 transition-transform text-3xl italic tracking-tighter block">
            Login required →
          </Link>
        </div>
      </div>
    );
  }

  // 2. データの取得 (エラー修正済み)
  // orderByをcreatedAtからidに変更し、userIdで絞り込み
  const myRooms = await prisma.room.findMany({
    where: { 
      userId: userId 
    },
    include: {
      _count: { 
        select: { posts: true } 
      }
    },
    orderBy: { 
      id: "desc" 
    }
  });

  return (
    <main className="min-h-screen bg-zinc-50 p-8 md:p-16 text-black font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* ヘッダーエリア */}
        <header className="mb-16">
          <Link 
            href="/" 
            className="text-blue-600 font-black text-xs mb-6 inline-block hover:translate-x-[-4px] transition-transform uppercase tracking-widest"
          >
            ← Back to Top
          </Link>
          <div className="flex items-baseline gap-4">
            <h1 className="text-7xl font-black italic tracking-tighter leading-none">My Rooms</h1>
            <span className="text-blue-600 font-black text-xl italic opacity-50">{myRooms.length}</span>
          </div>
        </header>

        {/* ルームリスト */}
        <div className="grid grid-cols-1 gap-6">
          {myRooms.map((room) => (
            <Link href={`/room/${room.id}`} key={room.id} className="group">
              <div className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all border border-zinc-100 flex justify-between items-center group-hover:border-blue-400 group-hover:translate-y-[-4px]">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-black group-hover:text-blue-600 transition-colors">
                      {room.name}
                    </h3>
                    {room.password && (
                      <span className="bg-zinc-100 text-[10px] py-1 px-3 rounded-full font-black text-zinc-400 uppercase tracking-tighter">
                        Private 🔒
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      {room._count.posts} creations inside
                    </p>
                    <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      ID: {room.id}
                    </p>
                  </div>
                </div>
                
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner group-hover:shadow-lg">
                  <span className="text-2xl font-black">→</span>
                </div>
              </div>
            </Link>
          ))}

          {/* ルームが空の場合の表示 */}
          {myRooms.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[60px] border-4 border-dashed border-zinc-50">
              <p className="text-zinc-300 font-black text-2xl italic uppercase tracking-tighter mb-8">まだルームがありません</p>
              <Link 
                href="/" 
                className="bg-zinc-900 text-white px-10 py-5 rounded-full font-black text-sm hover:bg-blue-600 transition-all shadow-xl active:scale-95"
              >
                あなたのルームを作りに行こう！
              </Link>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}