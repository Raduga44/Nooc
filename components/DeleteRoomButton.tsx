"use client";
import { deleteRoom } from "@/app/actions/room";

export default function DeleteRoomButton({ roomId }: { roomId: number }) {
  const handleDelete = async (formData: FormData) => {
    if (confirm("このルームと中の全作品を完全に削除します。本当によろしいですか？")) {
      await deleteRoom(formData);
    }
  };

  return (
    <form action={handleDelete} className="inline-block">
      <input type="hidden" name="roomId" value={roomId} />
      <button 
        type="submit" 
        className="text-red-400 hover:text-red-600 font-black text-[10px] uppercase tracking-widest transition-colors ml-4 border-l border-zinc-200 pl-4"
      >
        Delete Room
      </button>
    </form>
  );
}