import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Send, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { askAI } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "Hello Andile 👋 — how can I help you today?",
};

export function FloatingChat() {
  const ai = useServerFn(askAI);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

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
                "You are CAPACITI's friendly AI assistant for Andile. Be concise, warm, professional.",
            },
            ...next,
          ],
        },
      });
      setMessages((m) => [...m, { role: "assistant", content: res.content }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-card border border-border rounded-2xl shadow-card flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
          <div className="bg-gradient-brand px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-sm">CAPACITI Assistant</div>
                <div className="text-[10px] opacity-90 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="h-7 w-7 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-brand-surface">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-gradient-brand text-white rounded-br-md"
                    : "bg-card text-foreground border border-border rounded-bl-md"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3 bg-card flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything..."
              rows={1}
              className="resize-none min-h-[40px] max-h-24 text-sm"
            />
            <Button variant="hero" size="icon" className="h-10 w-10 shrink-0" onClick={send} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-brand text-white shadow-glow hover:shadow-orange-glow hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Open AI assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </>
  );
}
