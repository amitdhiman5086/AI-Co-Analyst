import { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface ThreadResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function ChatLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { threadId } = useParams();

  const [threads, setThreads] = useState<ThreadResponse[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchThreads = useCallback(async () => {
    try {
      const data = await api.get<ThreadResponse[]>("/chat/threads");
      setThreads(data);
    } catch {
      // Silently fail — thread list is non-critical
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleNewThread = async () => {
    setCreating(true);
    try {
      const thread = await api.post<ThreadResponse>("/chat/threads", {
        title: "New conversation",
      });
      setThreads((prev) => [thread, ...prev]);
      navigate(`/chat/${thread.id}`);
    } catch {
      // Could show an error toast in the future
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="flex h-screen flex-col bg-canvas text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-hairline bg-canvas px-6">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-primary"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2c0 5.523-4.477 10-10 10 5.523 0 10 4.477 10 10 0-5.523 4.477-10 10-10-5.523 0-10-4.477-10-10z" />
          </svg>
          <span className="font-sans text-sm font-semibold tracking-tight text-ink">
            AI Co-Analyst
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted font-mono bg-surface-soft px-2.5 py-0.5 rounded border border-hairline-soft">
            {user?.email}
          </span>
          <Button variant="outline" size="xs" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Body: Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-hairline bg-surface-card">
          {/* New Thread button */}
          <div className="p-3">
            <Button
              className="w-full justify-start gap-2 text-sm"
              onClick={handleNewThread}
              disabled={creating}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {creating ? "Creating..." : "New Thread"}
            </Button>
          </div>

          {/* Thread list */}
          <nav className="flex-1 overflow-y-auto px-2 pb-3">
            {loadingThreads ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : threads.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-soft">
                No conversations yet
              </p>
            ) : (
              threads.map((t) => {
                const isActive = t.id === threadId;
                return (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/chat/${t.id}`)}
                    className={`
                      w-full text-left rounded-md px-3 py-2.5 mb-0.5
                      transition-colors duration-100 cursor-pointer
                      ${
                        isActive
                          ? "bg-surface-cream-strong text-ink"
                          : "text-body hover:bg-surface-soft"
                      }
                    `}
                  >
                    <div className="text-sm font-medium truncate leading-snug">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-muted-soft mt-0.5">
                      {formatDate(t.updated_at)}
                    </div>
                  </button>
                );
              })
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden bg-canvas">
          <Outlet context={{ refreshThreads: fetchThreads }} />
        </main>
      </div>
    </div>
  );
}
