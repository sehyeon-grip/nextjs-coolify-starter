// 회사 데이터(read-only) 가져오기 — 오직 이 파일(=Metabase API)을 통해서만.
//
// ⚠️ 절대 회사 데이터베이스에 직접 접속하지 마세요. 모든 회사 데이터는 Metabase API로만.
//    필요한 값(주소·API 키)은 크루 리더에게 받아 .env 에 넣습니다. (코드에 직접 쓰지 않기)
//
// 가장 안전하고 쉬운 방법: Metabase에 미리 만들어진 "질문(카드)"의 결과를 가져오는 것.

const MB_URL = process.env.METABASE_URL;
const MB_KEY = process.env.METABASE_API_KEY;

function assertConfigured() {
  if (!MB_URL || !MB_KEY) {
    throw new Error(
      "METABASE_URL / METABASE_API_KEY 가 설정되지 않았습니다. .env 파일에 리더가 준 값을 넣어주세요.",
    );
  }
}

/**
 * Metabase에 저장된 "질문(카드)"의 결과를 JSON으로 가져옵니다. (읽기 전용)
 * @param cardId Metabase 카드 번호 (예: 123) — 리더에게 받거나 Metabase 화면 URL에서 확인
 * @param parameters (선택) 카드에 파라미터가 있을 때만
 */
export async function getCardData(
  cardId: number,
  parameters?: Record<string, unknown>[],
): Promise<unknown[]> {
  assertConfigured();
  const res = await fetch(`${MB_URL}/api/card/${cardId}/query/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MB_KEY as string,
    },
    body: JSON.stringify(parameters ? { parameters } : {}),
    // 서버 컴포넌트에서 호출 — 캐시는 필요에 맞게 조절하세요.
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Metabase 카드 ${cardId} 조회 실패 (${res.status}): ${text}`);
  }
  return (await res.json()) as unknown[];
}
