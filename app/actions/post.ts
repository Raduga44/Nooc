"use server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";

const prisma = new PrismaClient();

// 1. イラスト投稿 (Vercel Blob対応版)
export async function createPost(formData: FormData) {
  const roomId = Number(formData.get("roomId"));
  const imageFile = formData.get("image") as File;
  const title = (formData.get("title") as string) || "Untitled";
  const caption = (formData.get("caption") as string) || null;
  const userId = (await cookies()).get("nooc_user_id")?.value;

  // 基本チェック
  if (!roomId || !imageFile || !userId || imageFile.size === 0) return;

  // ルームの存在確認
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return;

  // --- クラウドストレージ(Vercel Blob)に保存 ---
  const blob = await put(`posts/${Date.now()}-${imageFile.name}`, imageFile, {
    access: 'public',
  });

  // DB保存
  await prisma.post.create({
    data: { 
      title, 
      caption, 
      imageUrl: blob.url,
      roomId, 
      userId 
    }
  });

  revalidatePath(`/room/${roomId}`);
  redirect(`/room/${roomId}`);
}

// 2. イラスト削除
export async function deletePost(formData: FormData) {
  const postId = Number(formData.get("postId"));
  const userId = (await cookies()).get("nooc_user_id")?.value;
  if (!postId || !userId) return;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (post && (post.userId === userId || user?.isAdmin)) {
    const targetRoomId = post.roomId;
    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.post.delete({ where: { id: postId } });
    
    revalidatePath(`/room/${targetRoomId}`);
    redirect(`/room/${targetRoomId}`);
  }
}

// 3. 作品への個別コメント投稿
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

// 4. 作品への個別コメント削除
export async function deleteComment(formData: FormData) {
  const commentId = Number(formData.get("commentId"));
  const postId = Number(formData.get("postId"));
  const userId = (await cookies()).get("nooc_user_id")?.value;

  if (!commentId || !userId) return;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (comment && (comment.userId === userId || user?.isAdmin)) {
    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath(`/post/${postId}`);
  }
}

// 5. ルームチャットへのコメント投稿
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

// 6. ルームチャットの削除
export async function deleteRoomComment(formData: FormData) {
  const commentId = Number(formData.get("commentId"));
  const roomId = Number(formData.get("roomId"));
  const userId = (await cookies()).get("nooc_user_id")?.value;

  if (!commentId || !userId) return;

  const comment = await prisma.roomComment.findUnique({ where: { id: commentId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (comment && (comment.userId === userId || user?.isAdmin)) {
    await prisma.roomComment.delete({ where: { id: commentId } });
    revalidatePath(`/room/${roomId}`);
  }
}