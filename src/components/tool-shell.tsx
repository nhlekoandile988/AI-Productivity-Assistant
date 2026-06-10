import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ToolShellProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

export function ToolShell({ icon: Icon, title, description, children }: ToolShellProps) {
  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto">
      <header className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow shrink-0">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">{description}</p>
        </div>
      </header>
      {children}
    </div>
  );
}
