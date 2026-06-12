"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// 방명록에 한 줄 추가하는 서버 액션 (내 앱 DB에 저장)
export async function addEntry(formData: FormData) {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!nickname || !message) return;

  try {
    await prisma.guestbookEntry.create({ data: { nickname, message } });
    revalidatePath("/");
  } catch (e) {
    // DB가 아직 준비되지 않았을 수 있어요. 화면이 죽지 않게 조용히 넘어갑니다.
    console.error("방명록 저장 실패 — DATABASE_URL과 마이그레이션을 확인하세요.", e);
  }
}
