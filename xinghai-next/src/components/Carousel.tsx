"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ShowcaseItem } from "@/lib/site-content";

/**
 * 演出作品轮播（无外部依赖）：左右箭头 + 圆点指示 + 6 秒自动播放（悬停暂停）+ 键盘方向键。
 */
export default function Carousel({ items }: { items: ShowcaseItem[] }) {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const count = items.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (!paused.current) go(index + 1);
    }, 6000);
    return () => clearInterval(timer);
  }, [index, go]);

  if (count === 0) return null;
  const item = items[index];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      tabIndex={0}
      aria-roledescription="轮播图"
      aria-label="演出作品轮播"
    >
      {/* 图片区（16:9） */}
      <div className="relative aspect-video w-full bg-background">
        {items.map((it, i) => (
          <Image
            key={it.img}
            src={it.img}
            alt={it.title}
            fill
            sizes="(max-width: 1024px) 100vw, 960px"
            className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
            priority={i === 0}
          />
        ))}

        {/* 左右箭头 */}
        <button
          type="button"
          aria-label="上一张"
          onClick={() => go(index - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="下一张"
          onClick={() => go(index + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white opacity-0 transition-opacity hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100"
        >
          ›
        </button>

        {/* 文案层 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-5 pt-14 text-white sm:p-6 sm:pt-20">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs backdrop-blur">
            {item.tag}
          </span>
          <h3 className="mt-2 text-lg font-bold sm:text-xl">{item.title}</h3>
          <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-white/85">{item.desc}</p>
          <Link
            href={item.href}
            className="mt-3 inline-block rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-900 transition-colors hover:bg-white"
          >
            {item.linkText} →
          </Link>
        </div>
      </div>

      {/* 圆点指示 */}
      <div className="absolute right-4 top-4 flex gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 backdrop-blur">
        {items.map((it, i) => (
          <button
            key={it.img}
            type="button"
            aria-label={`跳到第 ${i + 1} 张：${it.title}`}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-5 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
