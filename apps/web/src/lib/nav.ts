import {
  Bot,
  CalendarDays,
  ChartColumn,
  CreditCard,
  Inbox,
  Kanban,
  LayoutDashboard,
  Megaphone,
  Plug,
  Radar,
  Send,
  Settings,
  Star,
  TrendingUp,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  description: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Sidebar follows the funnel: engage → find → attract → convert → measure. */
export const navSections: NavSection[] = [
  {
    title: "",
    items: [
      { href: "/dashboard", label: "Home", icon: LayoutDashboard, description: "KPIs, AI activity and today's tasks" },
      { href: "/inbox", label: "Inbox", icon: Inbox, badge: "12", description: "All conversations across every channel" },
      { href: "/agent", label: "AI Agent", icon: Bot, description: "Knowledge, playbooks, rules and sandbox" },
    ],
  },
  {
    title: "Sell",
    items: [
      { href: "/contacts", label: "Contacts", icon: Users, description: "Every lead and customer in one place" },
      { href: "/pipeline", label: "Pipeline", icon: Kanban, description: "Deals by stage" },
      { href: "/calendar", label: "Calendar", icon: CalendarDays, description: "Appointments and booking pages" },
      { href: "/payments", label: "Payments", icon: CreditCard, description: "Pay links, invoices and payouts" },
    ],
  },
  {
    title: "Grow",
    items: [
      { href: "/prospecting", label: "Prospecting", icon: Radar, description: "Find new leads with AI search agents" },
      { href: "/sequences", label: "Sequences", icon: Send, description: "Multi-step outbound outreach" },
      { href: "/campaigns", label: "Campaigns", icon: Megaphone, description: "WhatsApp, SMS and email broadcasts" },
      { href: "/marketing", label: "Marketing", icon: TrendingUp, description: "Ads co-pilot, SEO and social" },
      { href: "/reviews", label: "Reviews", icon: Star, description: "Requests, monitoring and AI replies" },
    ],
  },
  {
    title: "Operate",
    items: [
      { href: "/analytics", label: "Analytics", icon: ChartColumn, description: "Funnel, attribution and AI performance" },
      { href: "/automations", label: "Automations", icon: Workflow, description: "Trigger → action workflows" },
      { href: "/integrations", label: "Integrations", icon: Plug, description: "CRM, calendars, ads and more" },
      { href: "/settings", label: "Settings", icon: Settings, description: "Workspace, team, channels and billing" },
    ],
  },
];

export const allNavItems = navSections.flatMap((s) => s.items);
