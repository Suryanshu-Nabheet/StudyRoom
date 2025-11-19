"use client";

import {
  ArrowRight,
  Brain,
  Check,
  CirclePlay,
  CircleStop,
  Copy,
  Layers,
  MessageCircle,
  Mic,
  MicOff,
  Monitor,
  MonitorStop,
  PhoneOff,
  ScrollText,
  Settings,
  ShieldCheck,
  SignalHigh,
  Sparkles,
  Users,
  Video,
  VideoOff,
  Volume2,
  X,
} from "lucide-react";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const iconMap = {
  video: Video,
  "video-off": VideoOff,
  chat: MessageCircle,
  users: Users,
  copy: Copy,
  check: Check,
  play: CirclePlay,
  stop: CircleStop,
  network: SignalHigh,
  brain: Brain,
  speaker: Volume2,
  transcript: ScrollText,
  mic: Mic,
  "mic-off": MicOff,
  monitor: Monitor,
  "monitor-stop": MonitorStop,
  power: PhoneOff,
  sparkles: Sparkles,
  shield: ShieldCheck,
  layers: Layers,
  arrow: ArrowRight,
  settings: Settings,
  close: X,
} as const;

export default function Icon({
  name,
  className = "",
  size = 20,
  strokeWidth = 1.6,
}: IconProps) {
  const LucideIcon = iconMap[name as keyof typeof iconMap];

  if (!LucideIcon) {
    return null;
  }

  return (
    <LucideIcon
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
    />
  );
}

