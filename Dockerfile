# Coolify 배포용 Dockerfile — 그대로 두면 됩니다.
# (Next.js standalone + 배포할 때 데이터베이스 마이그레이션 자동 적용)

# 1) 의존성 설치
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2) 빌드 (Prisma 클라이언트 생성 + Next 빌드)
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 3) 실행 (가벼운 이미지)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Next standalone 산출물
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 시작 시 DB 마이그레이션을 적용하기 위한 최소 도구
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

# 배포될 때마다: DB 스키마 적용 → 서버 시작
CMD ["sh", "-c", "node_modules/prisma/build/index.js migrate deploy; node server.js"]
