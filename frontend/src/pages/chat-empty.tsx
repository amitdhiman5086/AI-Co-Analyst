import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface ThreadResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatLayoutContext {
  refreshThreads: () => Promise<void>;
}

export function ChatEmpty() {
  const navigate = useNavigate();
  const { refreshThreads } = useOutletContext<ChatLayoutContext>();
  const [creating, setCreating] = useState(false);

  const handleStart = async () => {
    setCreating(true);
    try {
      const thread = await api.post<ThreadResponse>("/chat/threads", {
        title: "New conversation",
      });
      await refreshThreads();
      navigate(`/chat/${thread.id}`);
    } catch {
      // Could show error
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      <div className="max-w-lg text-center space-y-6">
        {/* Decorative icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-soft border border-hairline">
          <svg
            className="h-7 w-7 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-display-sm text-ink">
            Start a conversation
          </h1>
          <p className="text-body-sm text-muted leading-relaxed max-w-md mx-auto">
            Ask questions about SEC filings and get grounded, cited answers from
            the research corpus. Every response is traceable back to source
            documents.
          </p>
        </div>

        <Button onClick={handleStart} disabled={creating} className="px-8">
          {creating ? "Creating..." : "New Thread"}
        </Button>

        {/* Capability hints */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            {
              label: "Grounded",
              desc: "Answers cite source passages",
            },
            {
              label: "Verifiable",
              desc: "Every claim links to filings",
            },
            {
              label: "Streaming",
              desc: "Real-time response generation",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-hairline bg-surface-soft p-3 text-left"
            >
              <div className="text-xs font-semibold text-ink mb-1">
                {item.label}
              </div>
              <div className="text-[11px] text-muted leading-relaxed">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
