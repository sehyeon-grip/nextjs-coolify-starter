# 🌱 nextjs-coolify-starter

**AX 러닝크루용 풀스택 보일러플레이트.** 안전장치가 미리 깔린 출발점입니다.
빈 폴더가 아니라 여기서 시작하면, 비밀 값 유출 같은 흔한 사고 없이 바로 만들 수 있어요.

> 비전공자를 위해 만들었습니다. 어려운 설정은 Claude Code가 대신 해줍니다.

---

## 🚀 처음 시작하기

### 1. 이 템플릿으로 내 프로젝트 만들기

- GitHub에서 이 저장소의 **`Use this template`**(또는 **Fork**) 버튼을 눌러 **내 저장소**를 만듭니다.
- 만든 저장소를 내 컴퓨터로 받아옵니다. (Claude Code에게 시켜도 됩니다)

### 2. Claude Code에 아래를 그대로 붙여넣기

받아온 폴더에서 Claude Code를 열고, 아래 프롬프트를 **복사해서 붙여넣으면** 초기 설정이 끝납니다.

```
이 프로젝트의 초기 설정을 도와줘. 아래 순서대로 진행해줘:

1. 보안 안전장치 켜기
   - `git config core.hooksPath .githooks` 실행
   - `.githooks/pre-commit` 파일에 실행 권한 부여(chmod +x)
   - 제대로 켜졌는지 확인해서 알려줘

2. 스킬 확인
   - `.claude/skills/` 안에 safe-push, deploy, metabase-data,
     react-best-practices, composition-patterns 가 있는지 확인하고 알려줘

3. 필요한 패키지 설치 (npm install)

4. 환경변수(.env) 준비
   - `.env.example`을 복사해서 `.env` 파일 만들기
   - 어떤 값을 채워야 하는지 한국어로 하나씩 설명해줘
   - (실제 비밀값은 네가 만들지 말고, 내가 직접 넣도록 안내만)

5. 데이터베이스 준비
   - `npx prisma generate` 실행
   - 로컬 데이터베이스 연결 방법 안내 후, 준비되면 `npx prisma migrate dev` 도와줘

6. 동작 확인
   - `npm run dev` 실행해서 화면이 뜨는지 확인하고 접속 주소(localhost) 알려줘

각 단계마다 비전공자도 알 수 있게 한국어로 짧게 설명하고,
내가 직접 해야 할 게 있으면 멈추고 알려줘.
```

> 프롬프트를 깜빡해도 괜찮아요 — 안전장치는 Claude가 작업 시작할 때 자동으로 다시 켭니다(`CLAUDE.md` 규칙).

---

## 🧰 무엇이 들어있나요

| 항목 | 설명 |
|---|---|
| **Next.js (App Router) + TypeScript** | 웹 화면을 만드는 도구 |
| **Tailwind CSS** | 색·여백 등 꾸미기 |
| **Postgres + Prisma** | **내 앱 데이터** 저장 (예: 방명록) |
| **Metabase API 헬퍼** (`lib/metabase.ts`) | **회사 데이터** 읽기 전용 조회 |
| **자동 보안 검사** (`.githooks/pre-commit`) | 비밀 값이 깃에 올라가는 것을 차단 |
| **스킬 5종** (`.claude/skills/`) | safe-push · deploy · metabase-data · react/구성 모범사례 |

### 데이터는 두 종류 (중요)

```
회사 데이터(read-only) ─▶ Metabase API ─▶ (내 앱) Postgres 저장/가공 ─▶ 서비스
```

- **내가 새로 만들어 저장하는 데이터** → 내 Postgres + Prisma (`lib/prisma.ts`)
- **회사가 이미 가진 데이터**(매출·셀러 등) → Metabase API (`lib/metabase.ts`), 읽기 전용. **회사 DB 직접 접속 금지.**

---

## 🔐 안전하게 저장 · 배포하기

- 깃에 올리기 전: Claude Code에 **`/safe-push`** — 비밀 값 검사 후 안전하게 푸시
- Coolify에 배포: **`/deploy`** — `.env` 값을 Coolify에 넣었는지 체크리스트로 확인

---

## 💻 명령어 (참고용 — 보통은 Claude에게 부탁하면 됩니다)

```bash
npm install              # 패키지 설치
npm run dev              # 개발 서버 (localhost:3000)
npx prisma migrate dev   # DB 구조 변경 적용
npm run build            # 배포용 빌드
```
