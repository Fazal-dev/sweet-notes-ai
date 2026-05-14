import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getDailyMessage, getMeta } from "@/lib/daily-message.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "One Message a Day" },
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
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <header className="text-center mb-10 animate-fade-up">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            One message a day
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-medium text-foreground">
            {meta.data ? `For ${meta.data.herName},` : "For you,"}
          </h1>
          {daily.data && (
            <p className="mt-2 text-sm text-muted-foreground">
              {formatDate(daily.data.date)} · {daily.data.theme}
            </p>
          )}
        </header>

        <article
          className="relative rounded-3xl border border-border bg-card/70 backdrop-blur-sm px-8 py-12 shadow-[0_30px_80px_-30px_oklch(0.62_0.18_25/0.35)] animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          {daily.isLoading && (
            <p className="text-center text-muted-foreground italic">
              writing today's message…
            </p>
          )}

          {daily.error && (
            <div className="text-center space-y-3">
              <p className="text-destructive">
                Couldn't write today's message.
              </p>
              <p className="text-xs text-muted-foreground">
                {(daily.error as Error).message}
              </p>
              <button
                onClick={onRegenerate}
                className="text-sm underline text-primary"
              >
                try again
              </button>
            </div>
          )}

          {daily.data && (
            <p className="text-xl md:text-2xl leading-relaxed text-foreground whitespace-pre-wrap">
              {daily.data.message}
            </p>
          )}

          {daily.data && meta.data && (
            <p className="mt-8 text-right text-base text-muted-foreground italic">
              — {meta.data.yourName}
            </p>
          )}
        </article>

        <footer
          className="mt-8 text-center animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
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
