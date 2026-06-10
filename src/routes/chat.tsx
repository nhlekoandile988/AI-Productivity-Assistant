import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Send, Loader2, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

import { askAI } from "@/lib/ai.functions";
import { useAppStore } from "@/lib/app-store";
import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat · CAPACITI AI" },
      { name: "description", content: "Conversational AI for anything you need." },
    ],
  }),
  component: Chat,
});

type Msg = { role: "user" | "assistant"; content: string };

function Chat() {
  const ai = useServerFn(askAI);
  const { logActivity } = useAppStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ai({
        data: {
          messages: [
            {
              role: "system",
              content:
                "You are CAPACITI's AI workplace assistant — helpful, concise, professional. Format with markdown when useful.",
            },
            ...next,
          ],
        },
      });
      setMessages((m) => [...m, { role: "assistant", content: res.content }]);
      logActivity("chat_message", `Chat: ${userMsg.content.slice(0, 60)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <ToolShell
      icon={MessageSquare}
      title="AI Chat"
      description="Conversational AI for anything you need."
    >
      <div className="bg-card rounded-2xl shadow-soft border border-border/60 flex flex-col h-[calc(100vh-260px)] min-h-[500px] overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1.5">
                Ask CAPACITI AI anything
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Brainstorm, draft, analyze or research — start typing below.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-brand flex items-center justify-center shadow-soft">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-gradient-brand text-white shadow-soft rounded-br-md"
                    : "bg-brand-surface text-foreground rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="h-8 w-8 shrink-0 rounded-xl bg-foreground/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-foreground/70" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-brand flex items-center justify-center shadow-soft">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-brand-surface rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 bg-card">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Message CAPACITI AI..."
              rows={1}
              className="resize-none min-h-[44px] max-h-32"
            />
            <Button
              variant="hero"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={send}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
