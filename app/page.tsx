import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { cookies } from "next/headers";
import { createRoom } from "@/app/actions/room";

const prisma = new PrismaClient();

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  
  const cookieStore = await cookies();
  const userId = cookieStore.get("nooc_user_id")?.value;
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

  // 1. 全ルームを取得してタグをリアルタイム集計（nameフィールドから抽出）
const allRoomsForTags = await prisma.room.findMany({
  select: { name: true } // tags: true ではなく name: true にする
});

const tagMap: Record<string, number> = {};
allRoomsForTags.forEach(room => {
  // ルーム名に含まれる #タグ を抽出
  const tags = room.name.match(/#[^\s#]+/g) || [];
  tags.forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; });
});

  const popularTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);

  // 2. ルーム一覧（検索対応）
  // qがある場合はnameフィールドに対して部分一致検索を行う
  const rooms = await prisma.room.findMany({
    where: q ? { name: { contains: q } } : {},
    include: {
      user: true,
      _count: { select: { posts: true } }
    },
    orderBy: { id: "desc" },
  });

  const roomCount = await prisma.room.count();
  const totalPosts = await prisma.post.count();

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-black font-sans relative">
      
      {/* --- 右上ナビゲーション (完全復元版) --- */}
      <div className="fixed top-8 right-8 z-50 flex flex-col items-end gap-2 text-sm font-bold">
        <a href="#create-room" className="bg-white border border-zinc-200 px-5 py-2.5 rounded-full shadow-sm hover:bg-zinc-50 transition">
          ルームを作成
        </a>

        {!user ? (
          <Link href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-md hover:bg-blue-700 transition">
            ID登録
          </Link>
        ) : (
          <div className="relative group pb-4"> 
            <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-full shadow-md flex items-center gap-2">
              My ID: <span className="text-blue-400">{user.name}</span>
            </button>
            <div className="absolute right-0 top-full pt-2 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform origin-top-right scale-95 group-hover:scale-100">
              <div className="bg-white border border-zinc-100 rounded-[32px] shadow-2xl p-6">
                <div className="mb-4 pb-4 border-b border-zinc-100 text-black">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1 font-black">Account</p>
                  <p className="text-zinc-500 text-[10px] font-mono mb-1">ID : {user.id}</p>
                  <p className="text-black text-lg font-black leading-tight">{user.name}</p>
                  <Link href="/setting/profile" className="text-blue-500 text-[10px] hover:underline">表示名の変更</Link>
                </div>
                <div className="space-y-4 text-black text-left">
                  <Link href="/bookmarks" className="hover:text-blue-600 transition-colors">ブックマーク ＞</Link>
                  <div className="pt-2">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-black">My Contents</p>
                    <div className="flex flex-col gap-2">
                      <Link href="/my-rooms" className="hover:text-blue-600 text-zinc-600 transition-colors">My Room ＞</Link>
                      <Link href="/my-illusts" className="hover:text-blue-600 text-zinc-600 transition-colors">My illust ＞</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-8xl font-black text-blue-600 tracking-tighter mb-2 italic">Nooc</h1>
          <p className="text-zinc-500 font-bold text-xl tracking-widest uppercase italic">Network Of Open Creation</p>
        </header>

        <section className="mb-12 text-center space-y-4">
          <p className="text-lg text-zinc-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Noocは、クリエイターが自由に集まり、創作を共有するためのネットワークです!
今すぐ作品を投稿しましょう！
          </p>
          <div className="flex justify-center gap-12 mt-8">
            <div className="text-center">
              <span className="block text-4xl font-black text-blue-600">{roomCount}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Rooms</span>
            </div>
            <div className="text-center">
              <span className="block text-4xl font-black text-blue-600">{totalPosts}</span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Creations</span>
            </div>
          </div>
        </section>

        {/* 検索・トレンドタグ */}
        <div className="mb-8 flex justify-center">
          <form className="relative w-full max-w-md">
            <input name="q" defaultValue={q} placeholder="タグで検索" className="w-full bg-white border-2 border-zinc-100 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 shadow-sm" />
            <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
          </form>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {popularTags.map(tag => (
            <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`} className={`px-4 py-2 rounded-xl font-bold text-sm ${q === tag ? "bg-blue-600 text-white" : "bg-white text-zinc-400 border border-zinc-100"}`}>
              {tag}
            </Link>
          ))}
        </div>

        {/* ルーム一覧 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-24">
          {rooms.map((room) => {
            // 表示用にタグと純粋な名前を分離
            const tags = room.name.match(/#[^\s#]+/g) || [];
            const displayName = room.name.replace(/#[^\s#]+/g, "").trim();

            return (
              <Link href={`/room/${room.id}`} key={room.id} className="group">
                <div className="bg-white p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all border border-zinc-100 flex justify-between items-center group-hover:border-blue-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {tags.map(tag => (
                        <span key={tag} className="text-[10px] font-black text-blue-500 uppercase tracking-tight">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-2xl font-black group-hover:text-blue-600 truncate flex items-center gap-2">
                      {displayName || "Untitled Room"}
                      {room.password && <span className="text-sm opacity-30">🔒</span>}
                    </h3>
                    <p className="text-zinc-400 text-[10px] font-bold mt-1 uppercase tracking-widest">
                      {room._count.posts} posts | by {room.user?.name}
                    </p>
                  </div>
                  <div className="text-zinc-100 group-hover:text-blue-500 text-3xl ml-4">→</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ルーム作成セクション */}
        <section id="create-room" className="bg-white p-10 rounded-[48px] shadow-lg border border-zinc-100 scroll-mt-24">
          <h2 className="text-2xl font-black mb-8 italic">新しいルームを作る！</h2>
          <form action={createRoom} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 ml-1 uppercase">ルームの名前とタグ</label>
                <input name="name" required placeholder="例：ルーム名 #タグ1 #タグ2" className="w-full bg-zinc-50 p-4 rounded-2xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 ml-1 uppercase">パスワード(任意)</label>
                <input name="password" type="password" className="w-full bg-zinc-50 p-4 rounded-2xl outline-none" />
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white font-black p-5 rounded-3xl text-xl shadow-xl hover:bg-blue-700 transition">
              ルームを作成！
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}