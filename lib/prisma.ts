// 내 앱 전용 데이터베이스(Postgres) 연결 — 이 파일은 그대로 두고 쓰면 됩니다.
//
// ⚠️ 여기는 "내 앱이 직접 저장하는 데이터"용입니다.
//    회사 데이터(매출·셀러·방송·고객 등)는 이걸로 가져오지 마세요 → lib/metabase.ts 사용.

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// 개발 중 핫리로드로 연결이 여러 개 생기는 걸 막는 표준 패턴입니다.
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
