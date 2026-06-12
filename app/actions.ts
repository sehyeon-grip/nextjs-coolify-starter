"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// 방명록에 한 줄 추가하는 서버 액션 (내 앱 DB에 저장)
export async function addEntry(formData: FormData) {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!nickname || !message) return;

  await prisma.guestbookEntry.create({ data: { nickname, message } });
  revalidatePath("/");
}
