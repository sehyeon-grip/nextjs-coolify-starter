import { addEntry } from "./actions";
import { prisma } from "@/lib/prisma";

// 이 페이지는 "보일러플레이트가 잘 동작하는지" 보여주는 예제입니다.
// 마음껏 지우고 여러분의 서비스로 바꿔 시작하세요.

// 빌드 때가 아니라 "접속할 때마다" 데이터베이스를 읽게 합니다.
// (이게 없으면 빌드 시점 상태가 화면에 굳어버립니다)
export const dynamic = "force-dynamic";

type Entry = { id: number; nickname: string; message: string; createdAt: Date };

async function loadEntries(): Promise<{ entries: Entry[]; error: string | null }> {
  try {
    const entries = await prisma.guestbookEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { entries, error: null };
  } catch {
    // DB가 연결되지 않았을 때도 화면은 정상으로 떠야 합니다. (저장 기능만 꺼진 상태)
    return {
      entries: [],
      error:
        "💾 데이터 저장 기능은 데이터베이스를 연결하면 켜져요. 지금은 화면만 동작합니다. (Claude에게 \"방명록을 저장되게 해줘\"라고 하면 안내해줍니다)",
    };
  }
}

export default async function Home() {
  const { entries, error } = await loadEntries();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">🌱 내 첫 풀스택 앱</h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        이 화면이 보이면 보일러플레이트가 잘 돌아가고 있는 거예요. 아래 방명록은{" "}
        <strong>내 앱 데이터베이스</strong>에 저장됩니다.
      </p>

      {/* 방명록 입력 — 내 앱 DB(Postgres + Prisma) 사용 */}
      <form action={addEntry} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          name="nickname"
          placeholder="닉네임"
          className="rounded-lg border border-gray-300 px-3 py-2 sm:w-32 dark:border-gray-700 dark:bg-gray-900"
          required
        />
        <input
          name="message"
          placeholder="한 줄 남기기"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
        >
          남기기
        </button>
      </form>

      {error ? (
        <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {error}
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {entries.length === 0 && (
            <li className="text-gray-500">아직 글이 없어요. 첫 글을 남겨보세요!</li>
          )}
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-800"
            >
              <span className="font-semibold">{e.nickname}</span>{" "}
              <span className="text-gray-700 dark:text-gray-300">{e.message}</span>
            </li>
          ))}
        </ul>
      )}

      {/* 회사 데이터는 다른 경로(Metabase API)로 가져옵니다 */}
      <section className="mt-14 rounded-xl border border-dashed border-gray-300 p-5 text-sm dark:border-gray-700">
        <h2 className="font-semibold">📊 회사 데이터가 필요하면?</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          매출·셀러·방송·고객 같은 <strong>회사 데이터</strong>는 위 방명록처럼 직접 저장하는 게
          아니라, <code>lib/metabase.ts</code>를 통해 <strong>Metabase API로 읽어옵니다</strong>.
          Claude에게 &ldquo;Metabase 카드 123번 결과를 표로 보여줘&rdquo;처럼 요청해 보세요.
        </p>
      </section>
    </main>
  );
}
