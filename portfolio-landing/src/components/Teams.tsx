import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TEAMS, type Campus, type Team } from "../lib/data";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
type Filter = "全部" | Campus;
const FILTERS: Filter[] = ["全部", "松江", "浦东"];

/** 校区筛选开关（松江隐藏主持团，由数据驱动，无硬编码） */
function CampusFilter({
  value,
  onChange,
}: {
  value: Filter;
  onChange: (v: Filter) => void;
}) {
  return (
    <div className="inline-flex gap-1 rounded-full border border-stroke bg-bg/70 p-1 backdrop-blur-sm">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`rounded-full px-5 py-2 text-sm transition-colors duration-200 ${
            value === f
              ? "bg-text-primary text-bg"
              : "text-muted hover:bg-stroke/50 hover:text-text-primary"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

function CampusBadge({ campuses }: { campuses: Campus[] }) {
  const both = campuses.length === 2;
  return (
    <span className="shrink-0 rounded-full border border-stroke px-2.5 py-0.5 text-[11px] text-muted">
      {both ? "松江 · 浦东" : `仅${campuses[0]}`}
    </span>
  );
}

/** 队伍卡片：一段介绍 + 一个跳转，不展开详情（方案硬约束） */
function TeamCard({ team, index }: { team: Team; index: number }) {
  return (
    <motion.a
      href={`/recruit#depts`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.06, ease: EASE }}
      className="group flex flex-col rounded-3xl border border-stroke bg-surface/70 p-6 shadow-transparent backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-white/15 hover:bg-surface hover:shadow-[0_18px_44px_rgba(0,0,0,0.45)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{team.name}</h3>
          <p className="mt-0.5 font-display text-sm italic text-muted">
            {team.tagline}
          </p>
        </div>
        <CampusBadge campuses={team.campuses} />
      </div>

      <p className="mt-4 flex-1 text-[13px] leading-relaxed text-muted">
        {team.intro}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-stroke pt-4">
        <span className="text-[11px] tracking-[0.1em] text-muted">
          {team.noBasics ? "零基础可加入" : "建议有基础"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary transition-transform duration-300 group-hover:translate-x-1">
          报名 <span aria-hidden>→</span>
        </span>
      </div>
    </motion.a>
  );
}

function TeamGroup({
  title,
  subtitle,
  teams,
}: {
  title: string;
  subtitle: string;
  teams: Team[];
}) {
  if (!teams.length) return null;
  return (
    <div className="mt-12">
      <div className="mb-5 flex items-baseline gap-3">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <span className="text-sm text-muted">{subtitle}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team, i) => (
          <TeamCard key={team.id} team={team} index={i} />
        ))}
      </div>
    </div>
  );
}

/** 06 团队全景 —— 组织全景 + 校区筛选 + 卡片墙（本次改版核心） */
export default function Teams() {
  const [filter, setFilter] = useState<Filter>("全部");

  const list = useMemo(
    () =>
      filter === "全部"
        ? TEAMS
        : TEAMS.filter((t) => t.campuses.includes(filter)),
    [filter]
  );
  const perform = list.filter((t) => t.type === "演出团");
  const admin = list.filter((t) => t.type === "职能部门");

  return (
    <section id="teams" className="py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-stroke" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted">
              All Teams
            </span>
          </div>
          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            团队{" "}
            <em className="font-display font-normal italic">全景</em>
          </h2>
        </motion.div>

        {/* 第一层：组织全景图 */}
        <motion.div
          className="grid items-center gap-4 rounded-3xl border border-stroke bg-surface/60 p-7 backdrop-blur-md md:grid-cols-[1fr_auto_1fr] md:gap-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <div className="text-center md:text-left">
            <div className="font-display text-2xl italic text-text-primary">
              各团 · {perform.length || 7} 支
            </div>
            <div className="mt-1 text-sm text-muted">负责舞台</div>
          </div>
          <div className="mx-auto hidden h-14 w-px bg-stroke md:block" />
          <div className="text-center md:text-right">
            <div className="font-display text-2xl italic text-text-primary">
              职能部门 · {admin.length || 4} 个
            </div>
            <div className="mt-1 text-sm text-muted">让舞台发生</div>
          </div>
          <p className="text-center font-display text-base italic text-muted md:col-span-3 md:text-lg">
            「演出团负责舞台，职能部门让舞台发生。」
          </p>
        </motion.div>

        {/* 第二层：校区筛选 */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">
            你在哪个校区？切换查看该校区招新的队伍
          </p>
          <CampusFilter value={filter} onChange={setFilter} />
        </div>

        {/* 第三层：卡片墙 */}
        <TeamGroup title="演出团" subtitle={`共 ${perform.length} 支`} teams={perform} />
        <TeamGroup title="职能部门" subtitle={`共 ${admin.length} 个`} teams={admin} />
      </div>
    </section>
  );
}
