import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Copy, Loader2, Sparkles } from "lucide-react";
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

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes Summarizer · CAPACITI AI" },
      { name: "description", content: "Turn long notes into crisp summaries and action items." },
    ],
  }),
  component: NotesSummarizer,
});

function NotesSummarizer() {
  const ai = useServerFn(askAI);
  const { logActivity } = useAppStore();
  const [notes, setNotes] = useState("");
  const [style, setStyle] = useState("bullets");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!notes.trim()) return toast.error("Paste some notes first");
    setLoading(true);
    setOutput("");
    try {
      const styleHint =
        style === "bullets"
          ? "Return concise bullet points grouped under headings."
          : style === "executive"
            ? "Return a 3-paragraph executive summary."
            : "Return a TLDR (1-2 lines) then a bulleted Action Items list.";
      const res = await ai({
        data: {
          messages: [
            {
              role: "system",
              content: `You summarize meeting notes and documents clearly. ${styleHint}`,
            },
            { role: "user", content: notes },
          ],
        },
      });
      setOutput(res.content);
      logActivity("notes_summarized", `Summarized notes (${notes.length} chars)`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      icon={FileText}
      title="Notes Summarizer"
      description="Turn long notes into crisp action points."
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60 space-y-4">
          <h3 className="font-bold text-foreground">Your notes</h3>
          <div className="space-y-2">
            <Label>Output style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bullets">Structured bullets</SelectItem>
                <SelectItem value="executive">Executive summary</SelectItem>
                <SelectItem value="actions">TLDR + Action items</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Paste notes, transcript or document</Label>
            <Textarea
              id="notes"
              rows={14}
              placeholder="Paste anything — meeting notes, transcripts, articles..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button variant="hero" className="w-full h-11" onClick={run} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Summarizing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Summarize
              </>
            )}
          </Button>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/60 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Summary</h3>
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
          <div className="flex-1 min-h-[400px] rounded-xl bg-brand-surface p-4 text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
            {output || (
              <span className="text-muted-foreground">
                Your summary will appear here.
              </span>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
