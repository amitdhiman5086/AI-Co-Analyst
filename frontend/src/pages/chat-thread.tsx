import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { api } from "@/lib/api";
import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface MessageResponse {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ChatLayoutContext {
  refreshThreads: () => Promise<void>;
}

export function ChatThread() {
  const { threadId } = useParams<{ threadId: string }>();
  const { refreshThreads } = useOutletContext<ChatLayoutContext>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [initialMessages, setInitialMessages] = useState<
    { id: string; role: "user" | "assistant" | "system"; parts: { type: "text"; text: string }[] }[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load message history on mount / thread change
  useEffect(() => {
    if (!threadId) return;

    let cancelled = false;
    setLoadingHistory(true);

    api
      .get<MessageResponse[]>(`/chat/threads/${threadId}`)
      .then((msgs) => {
        if (cancelled) return;
        setInitialMessages(
          msgs.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant" | "system",
            parts: [{ type: "text" as const, text: m.content }],
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setInitialMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [threadId]);

  // Custom fetch that injects Supabase bearer token
  const authedFetch: typeof globalThis.fetch = async (reqInput, init) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = new Headers(init?.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return globalThis.fetch(reqInput, { ...init, headers });
  };

  // TextStreamChatTransport for plain-text streaming from our Python backend
  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: `${env.VITE_API_BASE_URL}/chat/stream`,
        fetch: authedFetch,
        prepareSendMessagesRequest: ({ messages: msgs }) => {
          return {
            body: {
              threadId: threadId!,
              messages: msgs.map((m) => ({
                role: m.role,
                content: m.parts
                  ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                  .map((p) => p.text)
                  .join("") ?? "",
              })),
            },
          };
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threadId]
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    initialMessages: loadingHistory ? [] : initialMessages,
    transport,
    onFinish: () => {
      refreshThreads();
    },
  });

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || status === "streaming") return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const isStreaming = status === "streaming";

  if (loadingHistory) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted">Loading conversation...</span>
        </div>
      </div>
    );
  }

  // Extract text content from message parts
  const getMessageText = (msg: (typeof messages)[number]): string => {
    if ("parts" in msg && Array.isArray(msg.parts)) {
      return msg.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
    }
    return "";
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-muted">
                Send a message to start the conversation.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const text = getMessageText(msg);
            if (!text && msg.role !== "assistant") return null;

            return (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed
                    ${
                      msg.role === "user"
                        ? "bg-primary text-on-primary rounded-br-sm"
                        : "bg-surface-soft border border-hairline text-body rounded-bl-sm"
                    }
                  `}
                >
                  {text || (
                    <span className="flex items-center gap-2 text-muted">
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-teal animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-teal animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-teal animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                      Thinking...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mb-2 rounded-md border border-error/20 bg-error/10 px-4 py-2 text-xs text-error">
          {error.message}
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 border-t border-hairline bg-canvas px-6 py-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-end gap-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about SEC filings..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="h-10 px-5"
          >
            {isStreaming ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                Sending
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Send
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
