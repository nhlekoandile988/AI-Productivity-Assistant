import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PAGES = [
  { title: "Dashboard", url: "/", keywords: "home overview tasks" },
  { title: "Email Generator", url: "/email", keywords: "mail compose write" },
  { title: "Notes Summarizer", url: "/notes", keywords: "summary summarize" },
  { title: "Task Planner", url: "/tasks", keywords: "todo plan" },
  { title: "Research Assistant", url: "/research", keywords: "search investigate" },
  { title: "AI Chat", url: "/chat", keywords: "conversation assistant" },
];

export function HeaderSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = q
    ? PAGES.filter((p) =>
        (p.title + " " + p.keywords).toLowerCase().includes(q.toLowerCase()),
      )
    : [];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    if (results.length === 0) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank");
    }
  };

  return (
    <form onSubmit={onSubmit} className="relative hidden md:block w-72">
      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search tools or Google..."
        className="pl-9 h-9 bg-brand-surface border-border"
      />
      {open && q && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border rounded-xl shadow-card overflow-hidden z-50">
          {results.map((r) => (
            <Link
              key={r.url}
              to={r.url}
              onClick={() => {
                setQ("");
                setOpen(false);
              }}
              className="block px-3 py-2 text-sm hover:bg-accent text-foreground"
            >
              {r.title}
            </Link>
          ))}
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm border-t border-border hover:bg-accent text-muted-foreground"
          >
            <Search className="h-3.5 w-3.5" /> Search "{q}" on Google
          </a>
        </div>
      )}
    </form>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefers = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefers);
    document.documentElement.classList.toggle("dark", prefers);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="h-9 w-9">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function ProfileStatus() {
  return (
    <div className="flex items-center gap-2.5 pl-2">
      <div className="relative">
        <div className="h-9 w-9 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm shadow-soft">
          A
        </div>
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
      </div>
      <div className="hidden lg:flex flex-col leading-tight">
        <span className="text-sm font-semibold text-foreground">Andile</span>
        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active
        </span>
      </div>
    </div>
  );
}
