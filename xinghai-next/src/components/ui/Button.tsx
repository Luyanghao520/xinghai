import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-strong",
  outline:
    "border border-border bg-surface text-foreground hover:border-primary hover:text-primary",
  ghost: "text-primary hover:bg-primary-soft",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60";

/** 样式工厂：让 Link 等非 button 元素也能复用同一套按钮外观 */
export function buttonStyles(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
): string {
  return `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** 通用按钮（样式占位，后续可迁移到 shadcn/ui 的 Button） */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonStyles(variant, size)} ${className}`}
      {...props}
    />
  );
}
