import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, Loader2, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";

import { askAI } from "@/lib/ai.functions";
import { useAppStore } from "@/lib/app-store";
import { ToolShell } from "@/components/tool-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant · CAPACITI AI" },
      { name: "description", content: "Get structured research briefs on any topic." },
    ],
  }),
  component: Research,
});

function Research() {
  const ai = useServerFn(askAI);
  const { logActivity } = useAppStore();
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("brief");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!topic.trim()) return toast.error("Add a topic");
    setLoading(true);
    setOutput("");
    try {
      const depthHint =
        depth === "brief"
          ? "Produce a 1-page brief: overview, key facts, why it matters, open questions."
          : depth === "deep"
            ? "Produce a deep research report with sections: Background, Key Players, Current State, Trends, Risks, Opportunities, Recommendations."
            : "Produce a comparison-focused report with a clear table of options and trade-offs.";
      const res = await ai({
        data: {
          messages: [
            {
              role: "system",
              content: `You are a meticulous research analyst. ${depthHint} Use markdown headings and concise bullets. If facts could be outdated, note that.`,
            },
            { role: "user", content: `Topic: ${topic}` },
          ],
        },
      });
      setOutput(res.content);
      logActivity("research_query", `Researched: ${topic.slice(0, 60)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to research");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      icon={Search}
      title="Research Assistant"
      description="Deep-dive answers with structured insights."
    >
      <div className="space-y-6">
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60 space-y-4">
          <div className="grid md:grid-cols-[1fr_220px] gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Research topic or question</Label>
              <Textarea
                id="topic"
                rows={3}
                placeholder="e.g. The state of AI in South African corporate training in 2025"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Depth</Label>
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Quick brief</SelectItem>
                  <SelectItem value="deep">Deep report</SelectItem>
                  <SelectItem value="compare">Comparison</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="hero"
                className="w-full h-11 mt-1"
                onClick={run}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Researching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Research
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Findings</h3>
            {output && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success("Copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            )}
          </div>
          <div className="min-h-[360px] rounded-xl bg-brand-surface p-5 text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
            {output || (
              <span className="text-muted-foreground">
                Your research findings will appear here.
              </span>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
