/**
 * 数据访问抽象层（脚手架占位实现）
 *
 * 设计目标：页面与 API 只依赖本文件导出的类型和函数；
 * 未来接入真实数据库时**只改本文件**，页面与接口零改动。
 *
 * 当前实现（对应任务书第六节方案 A）：
 *   1. 优先使用 better-sqlite3，把报名写入本地文件库 data/xinghai.db（可经
 *      环境变量 XINGHAI_DB_PATH 改路径）；
 *   2. 原生模块不可用时（如缺少编译环境/预编译包）自动降级为「内存存储」，
 *      数据仅存活于当前进程，重启即清空——保证脚手架在任何环境都能跑通。
 *
 * 后续切换数据库的路径：
 *   - 本地/部署平台继续用 SQLite：无需改动，挂持久盘即可；
 *   - 切方案 B（Supabase Postgres + Vercel）：另写一个实现同一
 *     RegistrationStore 接口的 PostgresStore，替换 initStore() 的返回即可。
 */

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

/** 报名表单提交内容（入参） */
export interface RegistrationInput {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

/** 报名记录（入库后的完整形态） */
export interface RegistrationRecord extends RegistrationInput {
  id: string;
  createdAt: string; // ISO 8601 时间字符串
}

/**
 * 报名存储接口。
 * 旧栈 8 个 SQLite 库的表结构迁移完成后，会在此基础上扩展更多实体接口
 * （成员、演出、公告等），统一走同样的「接口 + 可替换实现」模式。
 */
export interface RegistrationStore {
  create(input: RegistrationInput): Promise<RegistrationRecord>;
  list(): Promise<RegistrationRecord[]>;
}

/** SQLite 数据文件路径（默认项目根目录下 data/xinghai.db） */
const DB_PATH =
  process.env.XINGHAI_DB_PATH ??
  path.join(process.cwd(), "data", "xinghai.db");

/** 内存存储：不落盘的兜底实现，保证原生模块缺失时站点仍可用 */
function createMemoryStore(): RegistrationStore {
  const records: RegistrationRecord[] = [];
  console.warn(
    "[db] 当前使用内存存储：数据仅保存在进程内，重启即清空（better-sqlite3 不可用时的降级模式）",
  );
  return {
    async create(input) {
      const record: RegistrationRecord = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      };
      records.unshift(record);
      return record;
    },
    async list() {
      return [...records];
    },
  };
}

/** SQLite 存储：本地开发与持久化部署（方案 A）的主力实现 */
async function createSqliteStore(): Promise<RegistrationStore> {
  const { default: Database } = await import("better-sqlite3");
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL"); // 提升并发读写表现（与旧栈优化一致）
  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      phone      TEXT,
      message    TEXT,
      created_at TEXT NOT NULL
    )
  `);

  return {
    async create(input) {
      const record: RegistrationRecord = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      };
      db.prepare(
        `INSERT INTO registrations (id, name, email, phone, message, created_at)
         VALUES (@id, @name, @email, @phone, @message, @createdAt)`,
      ).run(record);
      return record;
    },
    async list() {
      return db
        .prepare(
          `SELECT id, name, email, phone, message, created_at AS createdAt
           FROM registrations ORDER BY created_at DESC`,
        )
        .all() as RegistrationRecord[];
    },
  };
}

/* ------------------------------------------------------------------ */
/* 对外暴露的唯一入口：单例 store + 语义化函数                          */
/* ------------------------------------------------------------------ */

let storePromise: Promise<RegistrationStore> | null = null;

async function getStore(): Promise<RegistrationStore> {
  if (!storePromise) {
    storePromise = createSqliteStore().catch((err: unknown) => {
      console.warn(
        "[db] SQLite 初始化失败，已降级为内存存储：",
        err instanceof Error ? err.message : err,
      );
      return createMemoryStore();
    });
  }
  return storePromise;
}

/** 新增一条报名记录（/api/register 使用） */
export async function createRegistration(
  input: RegistrationInput,
): Promise<RegistrationRecord> {
  return (await getStore()).create(input);
}

/** 查询全部报名记录（后续后台管理页使用） */
export async function listRegistrations(): Promise<RegistrationRecord[]> {
  return (await getStore()).list();
}
