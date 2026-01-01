"use server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

/**
 * 1. ルーム作成
 * ログイン状態を厳格にチェックし、userIdを確実に紐付けます
 */
export async function createRoom(formData: FormData) {
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const cookieStore = await cookies();
  const userId = cookieStore.get("nooc_user_id")?.value;

  if (!name || !userId) {
    console.error("作成失敗: ログインしていないか、ルーム名が空です。");
    redirect("/register");
  }

  try {
    await prisma.room.create({
      data: {
        name,
        password: password || null,
        userId: userId,
      },
    });
  } catch (error) {
    console.error("Room作成エラー:", error);
    return;
  }

  revalidatePath("/");
  redirect("/");
}

/**
 * 2. ルーム削除 (★画像のエラーを解消)
 * 親（Room）を消す前に、子（投稿やコメント）を消してDBの整合性を守ります
 */
export async function deleteRoom(formData: FormData) {
  const roomId = Number(formData.get("roomId"));
  const cookieStore = await cookies();
  const userId = cookieStore.get("nooc_user_id")?.value;
  
  if (!roomId || !userId) return;

  // 権限確認
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (room && (room.userId === userId || user?.isAdmin)) {
    try {
      // 外部キー制約エラーを防ぐため、関連データを先に削除
      await prisma.roomComment.deleteMany({ where: { roomId } });
      
      // 投稿に紐づくコメントも先に消す必要があるため、投稿IDを取得して削除
      const posts = await prisma.post.findMany({ where: { roomId }, select: { id: true } });
      const postIds = posts.map(p => p.id);
      await prisma.comment.deleteMany({ where: { postId: { in: postIds } } });
      
      await prisma.post.deleteMany({ where: { roomId } });
      
      // 最後にルーム本体を削除
      await prisma.room.delete({ where: { id: roomId } });
      
      revalidatePath("/");
      revalidatePath("/my-rooms");
    } catch (error) {
      console.error("削除エラー:", error);
    }
    
    redirect("/");
  }
}


/**
 * 4. 作品へのコメント投稿
 */
export async function addPostComment(formData: FormData) {
  const postId = Number(formData.get("postId"));
  const content = formData.get("content") as string;
  const userId = (await cookies()).get("nooc_user_id")?.value;

  if (!postId || !content || !userId) return;

  await prisma.comment.create({
    data: { content, postId, userId }
  });

  revalidatePath(`/post/${postId}`);
}

/**
 * 5. ルーム掲示板（ルームへのコメント）投稿
 */
export async function addRoomComment(formData: FormData) {
  const roomId = Number(formData.get("roomId"));
  const content = formData.get("content") as string;
  const userId = (await cookies()).get("nooc_user_id")?.value;

  if (!roomId || !content || !userId) return;

  await prisma.roomComment.create({
    data: { content, roomId, userId }
  });

  revalidatePath(`/room/${roomId}`);
}

//finish