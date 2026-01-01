"use server";
import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function registerUser(formData: FormData) {
  const customId = formData.get("id") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string || "default_pass"; // パスワード必須対策

  if (!customId || !name) return;

  try {
    const user = await prisma.user.create({
      data: { 
        id: customId,
        name: name, 
        password: password, // スキーマで必須ならここが必要
        isAdmin: false 
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("nooc_user_id", user.id, { 
      path: "/",
      maxAge: 60 * 60 * 24 * 365 
    });
  } catch (error) {
    console.error("User registration failed:", error);
    redirect("/register?error=id_taken");
  }

  revalidatePath("/");
  redirect("/");
}

// 表示名の変更
export async function updateDisplayName(formData: FormData) {
  const newName = formData.get("name") as string;
  const userId = (await cookies()).get("nooc_user_id")?.value;

  if (!userId || !newName) return;

  await prisma.user.update({
    where: { id: userId },
    data: { name: newName },
  });

  revalidatePath("/");
  redirect("/");
}

// アカウント削除機能
export async function deleteAccount() {
  const userId = (await cookies()).get("nooc_user_id")?.value;

  if (!userId) return;

  await prisma.$transaction([
    prisma.post.deleteMany({ where: { userId: userId } }),
    prisma.room.deleteMany({ where: { userId: userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  const cookieStore = await cookies();
  cookieStore.delete("nooc_user_id");

  revalidatePath("/");
  redirect("/");
}

// 管理者昇格
export async function promoteToAdmin(formData: FormData) {
  const password = formData.get("admin_password") as string;
  const MASTER_PASSWORD = "|5UyyKx2VTjL"; 

  if (password !== MASTER_PASSWORD) {
    redirect("/?error=unauthorized");
  }

  const userId = (await cookies()).get("nooc_user_id")?.value;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isAdmin: true },
  });

  const cookieStore = await cookies();
  cookieStore.set("nooc_admin_key", "admin_secret_1234", { 
    maxAge: 60 * 60 * 24 * 30 
  });

  revalidatePath("/");
  redirect("/");
}