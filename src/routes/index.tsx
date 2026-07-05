import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getDailyMessage, getMeta } from "@/lib/daily-message.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "One Message a Day — For Kuttymma" },
      { name: "description", content: "A little something for you, every morning." },
    ],
  }),
  component: Index,
});

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function HeartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ width: "0.9em", height: "0.9em", display: "inline", verticalAlign: "middle" }}
    >
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );
}

function Index() {
  const router = useRouter();
  const fetchDaily = useServerFn(getDailyMessage);
  const fetchMeta = useServerFn(getMeta);
  const [refreshing, setRefreshing] = useState(false);

  const meta = useQuery({
    queryKey: ["meta"],
    queryFn: () => fetchMeta(),
    staleTime: Infinity,
  });

  const daily = useQuery({
    queryKey: ["daily-message"],
    queryFn: () => fetchDaily({ data: {} }),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const onRegenerate = async () => {
    setRefreshing(true);
    try {
      await fetchDaily({ data: { force: true } });
      await router.invalidate();
      await daily.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-16">
      <div className="w-full max-w-xl">

        {/* Header */}
        <header className="text-center mb-8 sm:mb-10 animate-fade-up">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground sm:text-xs">
            One message a day
          </p>
          <h1 className="mt-3 text-2xl font-medium text-foreground sm:text-3xl md:text-4xl">
            {meta.data ? `For ${meta.data.herName},` : "For you,"}
          </h1>

          {/* Day counter */}
          {daily.data && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary sm:text-base">
              <HeartIcon />
              Day {daily.data.dayCount.toLocaleString()} of us
              <HeartIcon />
            </p>
          )}

          {/* Date + theme */}
          {daily.data && (
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {formatDate(daily.data.date)}
              {!daily.data.isSpecialDay && ` · ${daily.data.themeLabel}`}
            </p>
          )}

          {/* Special day badge */}
          {daily.data?.isSpecialDay && (
            <p
              className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold animate-fade-up"
              style={{
                background: "oklch(0.62 0.18 25 / 0.12)",
                color: "oklch(0.48 0.18 25)",
                border: "1px solid oklch(0.62 0.18 25 / 0.25)",
                animationDelay: "60ms",
              }}
            >
              {daily.data.specialDayLabel}
            </p>
          )}
        </header>

        {/* Message card */}
        <article
          className="relative rounded-3xl border border-border bg-card/70 px-5 py-8 shadow-[0_30px_80px_-30px_oklch(0.62_0.18_25/0.35)] backdrop-blur-sm sm:px-8 sm:py-12 animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          {daily.isLoading && (
            <p className="text-center text-muted-foreground italic">writing today's message…</p>
          )}

          {daily.error && (
            <div className="text-center space-y-3">
              <p className="text-destructive">Couldn't write today's message.</p>
              <p className="text-xs text-muted-foreground">{(daily.error as Error).message}</p>
              <button onClick={onRegenerate} className="text-sm underline text-primary">
                try again
              </button>
            </div>
          )}

          {daily.data && (
            <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap sm:text-xl md:text-2xl">
              {daily.data.message}
            </p>
          )}

          {daily.data && meta.data && (
            <p className="mt-8 text-right text-sm text-muted-foreground italic sm:text-base">
              — {meta.data.yourName}
            </p>
          )}
        </article>

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between animate-fade-up" style={{ animationDelay: "240ms" }}>
          <Link
            to="/history"
            className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
          >
            our history
          </Link>

          <button
            onClick={onRegenerate}
            disabled={refreshing || daily.isLoading}
            className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {refreshing ? "writing…" : "regenerate"}
          </button>
        </footer>
      </div>
    </main>
  );
}
