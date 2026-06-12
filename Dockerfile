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

# (선택) 데이터 저장 기능을 쓸 때만 필요한 최소 도구 — DB 없이도 앱은 돌아갑니다
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

# 배포될 때마다:
#  - DATABASE_URL이 있으면 → 데이터베이스 모양을 코드에 맞춰 자동 반영(db push)
#  - 없으면 → 그냥 서버만 시작 (데이터 저장 기능은 꺼진 상태로 화면은 정상)
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss; fi; node server.js"]
