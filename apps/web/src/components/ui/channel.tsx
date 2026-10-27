import { Briefcase, Camera, Globe, Mail, MessageCircle, MessageSquare, MessagesSquare, Phone, Star, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/cn";

export type Channel = "whatsapp" | "sms" | "email" | "webchat" | "instagram" | "facebook" | "google" | "voice" | "linkedin";

export const channelMeta: Record<Channel, { label: string; icon: typeof Mail; className: string }> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, className: "bg-[#25d366]/15 text-[#128c4a] dark:text-[#3ddc84]" },
  sms: { label: "SMS", icon: MessageSquare, className: "bg-info-soft text-info" },
  email: { label: "Email", icon: Mail, className: "bg-accent-soft text-warning" },
  webchat: { label: "Webchat", icon: MessagesSquare, className: "bg-primary-soft text-primary" },
  instagram: { label: "Instagram", icon: Camera, className: "bg-[#e1306c]/12 text-[#c13584] dark:text-[#f06aa0]" },
  facebook: { label: "Messenger", icon: ThumbsUp, className: "bg-[#1877f2]/12 text-[#1877f2] dark:text-[#5aa0ff]" },
  google: { label: "Google", icon: Star, className: "bg-[#fbbc05]/15 text-[#a07400] dark:text-[#fbbc05]" },
  voice: { label: "Call", icon: Phone, className: "bg-success-soft text-success" },
  linkedin: { label: "LinkedIn", icon: Briefcase, className: "bg-[#0a66c2]/12 text-[#0a66c2] dark:text-[#5aa0ff]" },
};

export function ChannelIcon({ channel, size = "sm", className }: { channel: Channel; size?: "xs" | "sm" | "md"; className?: string }) {
  const meta = channelMeta[channel] ?? { label: channel, icon: Globe, className: "bg-surface-2 text-muted" };
  const Icon = meta.icon;
  const box = { xs: "size-4 [&_svg]:size-2.5 rounded", sm: "size-6 [&_svg]:size-3.5 rounded-md", md: "size-8 [&_svg]:size-4 rounded-lg" }[size];
  return (
    <span title={meta.label} className={cn("inline-flex shrink-0 items-center justify-center", box, meta.className, className)}>
      <Icon />
    </span>
  );
}
