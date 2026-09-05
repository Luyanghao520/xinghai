import type { ReactNode } from "react";

export interface CardProps {
  className?: string;
  children: ReactNode;
}

/** 通用卡片容器（样式占位，后续可迁移到 shadcn/ui 的 Card） */
export function Card({ className = "", children }: CardProps) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
