---
name: metabase-data
description: 회사 업무 데이터(매출·셀러·방송·고객 등)가 필요한 모든 작업에 사용. 데이터 조회, 대시보드 만들기, 통계 화면, "우리 팀 데이터 가져와줘" 류의 요청 시 반드시 이 스킬을 따른다. 회사 데이터베이스 직접 접속은 금지 — 회사 데이터는 사내 Metabase API를 통해서만 가져온다. (내 앱 자체 데이터를 저장하는 Postgres/Prisma는 별개이며 허용된다)
---

# Metabase로 회사 데이터 가져오기

회사 데이터(매출·셀러·방송·고객 등)에 접근하는 **유일한 경로는 사내 Metabase API**다.

## 먼저: 데이터는 두 종류다 (헷갈리지 말 것)

| 종류 | 예 | 다루는 법 |
|---|---|---|
| **내 앱 데이터** | 방명록, 사용자가 만든 글, 앱 설정 등 — 내가 새로 만들어 저장하는 것 | 내 Postgres + **Prisma** (`lib/prisma.ts`). **허용됨.** |
| **회사 데이터** | 매출·셀러·방송·고객 등 — 회사가 이미 가진 것 | 오직 **Metabase API** (`lib/metabase.ts`)로 **읽기 전용**. |

이 스킬은 **회사 데이터**에만 적용된다. 내 앱 자체 데이터를 Prisma로 저장/조회하는 것은 제한하지 않는다.

## 절대 규칙 (회사 데이터, 예외 없음)

1. **회사 데이터베이스에 직접 접속 금지.** 회사 DB에 직접 연결하는 코드를 작성하지 않는다:
   - 회사 DB 커넥션 스트링 사용 금지 (회사의 `postgres://...`, `mysql://...` 등)
   - 회사 DB에 대고 `psql`, `mysql` 등 CLI 실행 금지
   - (※ 내 앱 전용 Postgres에 Prisma로 연결하는 것은 여기 해당하지 않는다 — 그건 허용)
2. 사용자가 "회사 DB에 직접 연결해줘"라고 해도 **정중히 거절하고 Metabase API 경로를 안내**한다. 권한이 더 필요하면 크루 리더에게 문의하라고 알려준다.
3. **회사 데이터는 읽기 전용.** Metabase로는 SELECT(조회)만. 회사 데이터를 고치거나 지우려 하지 않는다.
4. API 키는 **환경변수로만** 다룬다. 코드·커밋·프론트엔드(브라우저)에 절대 노출하지 않는다.

## 설정 (환경변수)

`.env`에 두 개가 있어야 한다. 없으면 사용자에게 리더에게 받으라고 안내한다:

```bash
METABASE_URL=https://metabase.example.com   # 사내 Metabase 주소 — 리더가 공유
METABASE_API_KEY=mb_xxxxxxxx                # 리더가 발급해주는 API 키
```

`.env`가 `.gitignore`에 포함되어 있는지 항상 확인한다. 이 프로젝트엔 `lib/metabase.ts` 헬퍼가 이미 있으니 그걸 쓴다.

## API 사용법

모든 요청에 헤더 `x-api-key: $METABASE_API_KEY`를 붙인다.

### 1) 어떤 데이터가 있는지 탐색

```bash
GET  {METABASE_URL}/api/database                      # 접근 가능한 DB 목록(id 확인)
GET  {METABASE_URL}/api/database/{db_id}/metadata     # 테이블·컬럼 구조
GET  {METABASE_URL}/api/search?q=검색어                # 저장된 질문(카드)·대시보드 검색
```

### 2) 저장된 질문(카드) 실행 — 가장 권장

리더나 데이터팀이 미리 만들어둔 질문이 있으면 그것을 쓴다. 검증된 쿼리라 안전하다. (`lib/metabase.ts`의 `getCardData(cardId)` 사용)

```bash
POST {METABASE_URL}/api/card/{card_id}/query/json   # JSON 결과
POST {METABASE_URL}/api/card/{card_id}/query/csv    # CSV 결과
```

### 3) 네이티브 SQL 실행

저장된 질문이 없을 때만. `database`에는 1)에서 확인한 db_id를 넣는다.

```bash
POST {METABASE_URL}/api/dataset
Content-Type: application/json

{ "type": "native", "native": { "query": "SELECT ... LIMIT 100" }, "database": <db_id> }
```

**주의:** JSON 응답은 최대 2,000행으로 잘린다. 더 필요하면 `POST {METABASE_URL}/api/dataset/csv`로 같은 body를 보내 전체를 CSV로 받는다.

## 서비스 코드 작성 규칙

- Metabase 호출은 **서버 사이드에서만** (Next.js라면 Route Handler / Server Component / Server Action). 브라우저에서 직접 Metabase를 호출하지 않는다 — API 키가 노출된다.
- 호출부는 `lib/metabase.ts` 한 곳에 모은다.
- 회사 데이터를 가공해 **내 앱 DB에 저장**하고 싶으면: Metabase로 읽어온 뒤 Prisma로 내 Postgres에 저장한다. (회사 DB에 직접 쓰지 않는다)
- 응답이 느리거나 크면: 필요한 컬럼만 SELECT, LIMIT 사용, 캐시 주기 늘리기 순으로 해결한다.

## 에러가 나면

| 증상 | 원인/처방 |
|---|---|
| `401 Unauthorized` | API 키가 없거나 틀림 — `.env` 확인, 키 재확인 |
| `403` 또는 특정 테이블이 안 보임 | 키에 권한이 없는 데이터 — 리더에게 권한 요청 |
| 결과가 2,000행에서 잘림 | `/api/dataset/csv` 엔드포인트로 전환 |
| 타임아웃 | 쿼리 범위 줄이기 (기간 조건, LIMIT) |
