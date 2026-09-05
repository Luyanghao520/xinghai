/**
 * 旧栈数据迁移脚本（幂等、只读旧库）
 *
 * 背景：真实数据在 PythonAnywhere 线上；仓库根目录的 *.db 是运行期自动
 * 重建的空库。上线前在 PA 上导出 registrations.db / apply.db / members.db
 * 放到仓库根目录（或用 LEGACY_DIR 指定目录），然后运行：
 *
 *   cd xinghai-next && npm run migrate
 *
 * 行为与保证：
 *   - 只读（readonly）打开旧库，绝不修改旧数据；
 *   - 迁移行使用确定性 id（lg-<旧表>-<旧rowid>）+ INSERT OR IGNORE，
 *     重复运行安全；已导入的旧行不会被覆盖（如需强制刷新，删除
 *     data/xinghai.db 后重跑——新栈新产生的报名数据也会一并清掉，慎用）；
 *   - 某个旧库文件不存在时跳过并警告（允许只迁移其中一部分）。
 */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import { SCHEMA_SQL } from "../src/lib/schema.ts";

const scriptDir = import.meta.dirname!;
const repoRoot = path.resolve(scriptDir, "..", "..");
const LEGACY_DIR = process.env.LEGACY_DIR ?? repoRoot;
const TARGET_DB =
  process.env.XINGHAI_DB_PATH ?? path.join(process.cwd(), "data", "xinghai.db");

/** 迁移映射：旧库文件 → 旧表 → 新表 */
interface Mapping {
  dbFile: string;
  legacyTable: string;
  targetTable: string;
  /** 旧表 → 新表的列（同名的直接搬） */
  columns: string[];
  /** 固定写入的来源标记 */
  source: string;
  /** 额外常量列（列名 → 取值方式：row 的字段名） */
  extra?: Record<string, string>;
}

const MAPPINGS: Mapping[] = [
  {
    dbFile: "registrations.db",
    legacyTable: "registrations",
    targetTable: "registrations",
    columns: [
      "time", "target", "name", "gender", "birth", "campus", "college",
      "major", "phone", "wechat", "email", "skill", "motive", "adjust",
    ],
    source: "legacy",
  },
  {
    dbFile: "registrations.db",
    legacyTable: "archive_regs",
    targetTable: "registrations",
    columns: [
      "time", "target", "name", "gender", "birth", "campus", "college",
      "major", "phone", "wechat", "email", "skill", "motive", "adjust",
    ],
    extra: { status: "status", archived_at: "archived_at" },
    source: "legacy-archive",
  },
  {
    dbFile: "apply.db",
    legacyTable: "applies",
    targetTable: "applies",
    columns: ["xh", "pwd", "name", "campus", "status", "created", "updated"],
    source: "legacy",
  },
  {
    dbFile: "members.db",
    legacyTable: "members",
    targetTable: "members",
    columns: [
      "xh", "name", "gender", "campus", "college", "major", "phone",
      "wechat", "email", "role", "dept", "join_date", "grade", "status",
      "skill", "note", "position", "updated",
    ],
    source: "legacy",
  },
  {
    dbFile: "members.db",
    legacyTable: "alumni",
    targetTable: "alumni",
    columns: [
      "xh", "name", "gender", "campus", "college", "major", "phone",
      "wechat", "email", "role", "dept", "join_date", "grade", "position",
      "leave_date", "note",
    ],
    source: "legacy",
  },
];

function main(): void {
  // 1. 准备新库（建表 DDL 与运行时同源；better-sqlite3 不会自建父目录）
  fs.mkdirSync(path.dirname(TARGET_DB), { recursive: true });
  const target = new Database(TARGET_DB);
  target.pragma("journal_mode = WAL");
  target.exec(SCHEMA_SQL);

  // 2. 逐个映射迁移
  let totalImported = 0;
  let totalSkipped = 0;
  const opened = new Map<string, InstanceType<typeof Database>>();

  for (const m of MAPPINGS) {
    const legacyPath = path.join(LEGACY_DIR, m.dbFile);
    try {
      if (!opened.has(legacyPath)) {
        if (!fs.existsSync(legacyPath)) throw new Error("文件不存在");
        opened.set(
          legacyPath,
          new Database(legacyPath, { readonly: true, fileMustExist: true }),
        );
      }
    } catch (err) {
      console.warn(
        `↷ 跳过 ${m.dbFile}:${m.legacyTable} —— ${err instanceof Error ? err.message : err}`,
      );
      continue;
    }
    const legacy = opened.get(legacyPath)!;

    const extraCols = Object.keys(m.extra ?? {});
    const allCols = [...m.columns, ...extraCols];
    const stmt = target.prepare(
      `INSERT OR IGNORE INTO ${m.targetTable}
         (id, ${allCols.join(", ")}, source)
       VALUES
         (@id, ${allCols.map((c) => `@${c}`).join(", ")}, @source)`,
    );

    let imported = 0;
    let skipped = 0;
    let invalid = 0;
    const rows = legacy
      .prepare(`SELECT rowid AS _rid, * FROM ${m.legacyTable}`)
      .all() as Array<Record<string, unknown>>;

    for (const row of rows) {
      if (!row.name) {
        invalid += 1; // 新表 name NOT NULL，脏数据跳过并计数
        continue;
      }
      const params: Record<string, unknown> = {
        id: `lg-${m.legacyTable}-${row._rid}`,
        source: m.source,
      };
      for (const col of m.columns) params[col] = row[col] ?? null;
      for (const [newCol, legacyCol] of Object.entries(m.extra ?? {})) {
        params[newCol] = row[legacyCol] ?? null;
      }
      if (m.targetTable === "registrations") {
        params.adjust = row.adjust ? 1 : 0;
      }
      const res = stmt.run(params);
      if (res.changes > 0) imported += 1;
      else skipped += 1;
    }

    totalImported += imported;
    totalSkipped += skipped;
    console.log(
      `✔ ${m.dbFile}:${m.legacyTable} → ${m.targetTable}(${m.source})  ` +
        `新导入 ${imported}，已存在跳过 ${skipped}${invalid ? `，无效跳过 ${invalid}` : ""}`,
    );
  }

  for (const db of opened.values()) db.close();

  // 3. 汇总校验
  console.log(`\n迁移完成：新导入 ${totalImported} 条，幂等跳过 ${totalSkipped} 条`);
  for (const t of ["registrations", "applies", "members", "alumni"]) {
    const rows = target
      .prepare(`SELECT source, COUNT(*) AS c FROM ${t} GROUP BY source`)
      .all() as Array<{ source: string; c: number }>;
    const detail = rows.map((r) => `${r.source}=${r.c}`).join(", ") || "空表";
    console.log(`  ${t}: ${detail}`);
  }
  target.close();
}

main();
