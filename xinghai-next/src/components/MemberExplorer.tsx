"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";

/**
 * 成员在线浏览（「在线成员」风格）：
 * - 按团队归类展示各团人数与在线人数；
 * - 点击团队卡片筛选该团成员；支持按姓氏筛选（如「陈」）。
 *
 * 「在线」为演示用伪在线状态（由成员 id 确定性推导，约三成在线），
 * 真实在线能力需后续接入在线系统；数据来源为成员库（当前为演示数据时见页面提示）。
 */

export interface MemberView {
  id: string;
  name: string;
  dept: string;
  grade: string;
  position: string;
  skill: string;
}

const TEAM_ICOS: Record<string, string> = {
  合唱团: "🎤",
  交响乐团: "🎻",
  民乐团: "🎶",
  舞蹈团: "💃",
  话剧团: "🎭",
  主持团: "🎙️",
  礼仪队: "💐",
  办公室: "🗂️",
  资产管理部: "🎛️",
  企宣部: "📣",
};

/** 确定性伪在线：同一成员当天状态稳定 */
function isOnline(id: string): boolean {
  let h = 0;
  const key = id + new Date().toISOString().slice(0, 10);
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h % 100 < 35;
}

function surnameOf(name: string): string {
  return name.slice(0, 1);
}

export default function MemberExplorer({ members }: { members: MemberView[] }) {
  const [activeTeam, setActiveTeam] = useState<string>("全部");
  const [surname, setSurname] = useState<string>("");

  const teams = useMemo(() => {
    const map = new Map<string, MemberView[]>();
    for (const m of members) {
      const list = map.get(m.dept) ?? [];
      list.push(m);
      map.set(m.dept, list);
    }
    return [...map.entries()]
      .map(([name, list]) => ({
        name,
        ico: TEAM_ICOS[name] ?? "★",
        total: list.length,
        online: list.filter((m) => isOnline(m.id)).length,
      }))
      .sort((a, b) => b.online - a.online || b.total - a.total);
  }, [members]);

  const surnames = useMemo(() => {
    const pool = members.filter((m) => activeTeam === "全部" || m.dept === activeTeam);
    return [...new Set(pool.map((m) => surnameOf(m.name)))].sort();
  }, [members, activeTeam]);

  const visible = useMemo(
    () =>
      members
        .filter((m) => activeTeam === "全部" || m.dept === activeTeam)
        .filter((m) => (surname ? m.name.startsWith(surname) : true))
        .sort((a, b) => Number(isOnline(b.id)) - Number(isOnline(a.id)) || a.name.localeCompare(b.name, "zh")),
    [members, activeTeam, surname],
  );

  const totalOnline = members.filter((m) => isOnline(m.id)).length;

  return (
    <div className="mt-8">
      {/* 在线概览 */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
          <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500" />
          当前在线 {totalOnline} / {members.length} 人
        </span>
        <span className="text-xs text-muted-foreground">在线状态为演示数据，正式版将接入真实在线体系</span>
      </div>

      {/* 团队卡片：点击筛选 */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <button
          type="button"
          onClick={() => setActiveTeam("全部")}
          className={`rounded-xl border p-3 text-left transition-colors ${
            activeTeam === "全部"
              ? "border-primary bg-primary-soft"
              : "border-border bg-surface hover:border-primary/50"
          }`}
        >
          <p className="font-semibold">★ 全部成员</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {members.length} 人 · 在线 {totalOnline}
          </p>
        </button>
        {teams.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => setActiveTeam(t.name)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              activeTeam === t.name
                ? "border-primary bg-primary-soft"
                : "border-border bg-surface hover:border-primary/50"
            }`}
          >
            <p className="font-semibold">
              <span aria-hidden className="mr-1">
                {t.ico}
              </span>
              {t.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.total} 人 ·{" "}
              <span className="font-medium text-emerald-600">在线 {t.online}</span>
            </p>
          </button>
        ))}
      </div>

      {/* 姓氏筛选 */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">按姓氏筛选：</span>
        <input
          value={surname}
          onChange={(e) => setSurname(e.target.value.trim().slice(0, 2))}
          placeholder="如：陈"
          className="w-24 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
          aria-label="按姓氏筛选成员"
        />
        {(surname || activeTeam !== "全部") && (
          <button
            type="button"
            onClick={() => {
              setSurname("");
              setActiveTeam("全部");
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            清除筛选
          </button>
        )}
        <div className="flex flex-wrap gap-1.5">
          {surnames.slice(0, 12).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSurname(surname === s ? "" : s)}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                surname === s
                  ? "bg-primary text-white"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}姓
            </button>
          ))}
        </div>
      </div>

      {/* 成员卡片 */}
      {visible.length === 0 ? (
        <Card className="mt-6 text-center text-muted-foreground">
          没有符合条件的成员
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((m) => {
            const online = isOnline(m.id);
            return (
              <Card key={m.id} className="!p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      aria-hidden
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary"
                    >
                      {surnameOf(m.name)}
                    </div>
                    <span
                      title={online ? "在线" : "离线"}
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface ${
                        online ? "bg-emerald-500" : "bg-zinc-300"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.dept} · {m.position || "成员"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {m.grade} 届{m.skill ? ` · ${m.skill}` : ""}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
