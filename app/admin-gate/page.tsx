import { promoteToAdmin } from "@/app/actions/user";

export default async function AdminGate() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans p-8">
      <div className="max-w-sm w-full space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-black italic tracking-tighter animate-pulse">
            管理者権限に接続            
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">
            Enter Master Password
          </p>
        </div>

        <form action={promoteToAdmin} className="space-y-4">
          <input 
            name="admin_password" 
            type="password" 
            placeholder="**************************" 
            required
            className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-center text-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-white"
          />
          <button className="w-full bg-white text-black py-6 rounded-full font-black text-lg hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-2xl">
            確定
          </button>
        </form>

        <a href="/" className="inline-block text-zinc-700 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-500 transition-colors">
          ← BACK TO TOP
        </a>
      </div>
    </main>
  );
}