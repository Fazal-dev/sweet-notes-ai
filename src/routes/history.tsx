import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMessageHistory } from "@/lib/daily-message.functions";
import type { DailyMessage } from "@/lib/daily-message.functions";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Our Messages — Sweet Notes" },
      { name: "description", content: "Every message, every day." },
    ],
  }),
  component: HistoryPage,
});

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function MessageCard({ msg, index }: { msg: DailyMessage; index: number }) {
  return (
    <article
      className="rounded-2xl border border-border bg-card/70 px-5 py-6 backdrop-blur-sm animate-fade-up"
      style={{
        animationDelay: `${index * 60}ms`,
        boxShadow: msg.isSpecialDay
          ? "0 8px 32px -8px oklch(0.62 0.18 25 / 0.3)"
          : "0 4px 16px -4px oklch(0.62 0.18 25 / 0.12)",
        border: msg.isSpecialDay ? "1px solid oklch(0.62 0.18 25 / 0.3)" : undefined,
      }}
    >
      {/* Meta row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <p className="text-xs font-medium text-foreground sm:text-sm">{formatDate(msg.date)}</p>
          <p className="text-[0.65rem] text-muted-foreground mt-0.5 uppercase tracking-wider">
            Day {msg.dayCount.toLocaleString()} · {msg.isSpecialDay ? msg.specialDayLabel : msg.themeLabel}
          </p>
        </div>
        {msg.isSpecialDay && (
          <span
            className="rounded-full px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider"
            style={{
              background: "oklch(0.62 0.18 25 / 0.12)",
              color: "oklch(0.48 0.18 25)",
            }}
          >
            Special
          </span>
        )}
      </div>

      {/* Message */}
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap sm:text-base">
        {msg.message}
      </p>
    </article>
  );
}

function HistoryPage() {
  const fetchHistory = useServerFn(getMessageHistory);

  const history = useQuery({
    queryKey: ["message-history"],
    queryFn: () => fetchHistory(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-xl mx-auto">

        {/* Header */}
        <header className="text-center mb-10 animate-fade-up">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground sm:text-xs">
            Sweet Notes
          </p>
          <h1 className="mt-3 text-2xl font-medium text-foreground sm:text-3xl">
            Our messages
          </h1>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            Every day, a little something from him.
          </p>
        </header>

        {/* History list */}
        {history.isLoading && (
          <p className="text-center text-muted-foreground italic animate-fade-up">loading…</p>
        )}

        {history.data && history.data.length === 0 && (
          <div
            className="rounded-2xl border border-border bg-card/70 px-5 py-10 text-center animate-fade-up"
          >
            <p className="text-muted-foreground italic text-sm">
              No messages yet today. Go back and let it generate the first one!
            </p>
          </div>
        )}

        {history.data && history.data.length > 0 && (
          <div className="space-y-4">
            {history.data.map((msg, i) => (
              <MessageCard key={msg.date} msg={msg} index={i} />
            ))}
          </div>
        )}

        {/* Note about session-based history */}
        {history.data && history.data.length > 0 && (
          <p className="mt-6 text-center text-[0.65rem] text-muted-foreground/60">
            Messages are kept for this session. Each new day brings a fresh one.
          </p>
        )}

        {/* Back link */}
        <div className="mt-10 text-center animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
          >
            ← today's message
          </Link>
        </div>
      </div>
    </main>
  );
}
