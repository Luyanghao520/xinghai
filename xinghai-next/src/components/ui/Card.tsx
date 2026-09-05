import type { ReactNode } from "react";

export interface CardProps {
  className?: string;
  children: ReactNode;
}

/** 通用卡片容器：半透明 surface + 毛玻璃（内容浮在全站背景视频之上） */
export function Card({ className = "", children }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-6 shadow-sm backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
