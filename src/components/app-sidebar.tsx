import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Notes Summarizer", url: "/notes", icon: FileText },
  { title: "Task Planner", url: "/tasks", icon: ListChecks },
  { title: "Research Assistant", url: "/research", icon: Search },
  { title: "AI Chat", url: "/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border/40 px-4 py-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-glow group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display font-bold text-white text-base tracking-tight">
              CAPACITI
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-medium">
              AI Workplace
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60 text-[10px] uppercase tracking-[0.16em] font-semibold px-3">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={cn(
                        "h-11 rounded-xl text-white/80 hover:bg-white/10 hover:text-white data-[active=true]:bg-gradient-sidebar-active data-[active=true]:text-white data-[active=true]:shadow-orange-glow data-[active=true]:font-semibold transition-all",
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-[18px] w-[18px]" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40 p-4 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
            <span className="text-xs font-semibold text-white">AI Online</span>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            Powered by Lovable AI Gateway
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
