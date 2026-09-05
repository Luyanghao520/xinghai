"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";

/**
 * 在籍成员总览（趣味姓氏图 + 全团名册）。
 * - 不区分团队、无在线状态：「在籍」= 当前名册上的全体成员；
 * - 姓氏图：环形占比图（conic-gradient 实现，无外部依赖）+ 榜单，
 *   例如「陈姓占比多少」一眼可见。
 */

export interface MemberView {
  id: string;
  name: string;
  grade: string;
  position: string;
  skill: string;
}

const DONUT_COLORS = [
  "#1d4ed8", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#a855f7",
];

function surnameOf(name: string): string {
  return name.slice(0, 1);
}

export default function MemberRoster({ members }: { members: MemberView[] }) {
  /** 姓氏统计：[姓氏, 人数] 降序 */
  const stats = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of members) {
      const s = surnameOf(m.name);
      map.set(s, (map.get(s) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([s, c]) => ({ surname: s, count: c }))
      .sort((a, b) => b.count - a.count);
  }, [members]);

  /** 环形图分段（前 9 名单列，其余并入「其他」） */
  const segments = useMemo(() => {
    const total = members.length || 1;
    const top = stats.slice(0, 9);
    const restCount = stats.slice(9).reduce((sum, s) => sum + s.count, 0);
    const parts = top.map((s, i) => ({
      label: `${s.surname}姓`,
      count: s.count,
      pct: (s.count / total) * 100,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
    if (restCount > 0) {
      parts.push({
        label: "其他姓",
        count: restCount,
        pct: (restCount / total) * 100,
        color: "#cbd5e1",
      });
    }
    // 纯函数式累计占比（避免渲染期变量重赋值，React Compiler lint 要求）
    return parts.map((p, i) => ({
      ...p,
      from: parts.slice(0, i).reduce((sum, q) => sum + q.pct, 0),
      to: parts.slice(0, i + 1).reduce((sum, q) => sum + q.pct, 0),
    }));
  }, [stats, members.length]);

  const gradient = segments
    .map((s) => `${s.color} ${s.from}% ${s.to}%`)
    .join(", ");
  const top = stats[0];

  return (
    <div className="mt-8">
      {/* 趣味姓氏图 */}
      <Card>
        <h2 className="text-lg font-semibold">趣味姓氏图</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          全团 {members.length} 名在籍成员共覆盖 {stats.length} 个姓氏
          {top && stats.length > 1
            ? `——「${top.surname}姓」以 ${top.count} 人（${Math.round((top.count / members.length) * 100)}%）登顶！`
            : ""}
        </p>

        <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-center">
          {/* 环形占比图 */}
          <div
            className="relative h-44 w-44 shrink-0 rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
            role="img"
            aria-label={`在籍成员姓氏占比：${segments
              .map((s) => `${s.label} ${Math.round(s.pct)}%`)
              .join("，")}`}
          >
            <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-surface shadow-inner">
              <p className="text-2xl font-bold text-primary-strong">{members.length}</p>
              <p className="text-xs text-muted-foreground">在籍成员</p>
            </div>
          </div>

          {/* 榜单 */}
          <ul className="grid w-full flex-1 grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {segments.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="w-14 font-medium">{s.label}</span>
                <span className="text-muted-foreground">{s.count} 人</span>
                <span className="ml-auto font-semibold text-primary">
                  {s.pct.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* 全团名册 */}
      <h2 className="mt-10 text-lg font-semibold">
        在籍名册 <span className="text-sm font-normal text-muted-foreground">（{members.length} 人）</span>
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {members.map((m) => (
          <Card key={m.id} className="!p-4">
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary"
              >
                {surnameOf(m.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.position || "成员"}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {m.grade} 届{m.skill ? ` · ${m.skill}` : ""}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
