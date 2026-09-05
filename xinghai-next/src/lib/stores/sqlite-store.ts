/**
 * SQLite 存储（方案 A 主实现，better-sqlite3）。
 * 建表 DDL 与迁移脚本共用 src/lib/schema.ts，保证结构一致。
 */

import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { SCHEMA_SQL } from "../schema";
import {
  DuplicateRegistrationError,
  type ApplyRecord,
  type ApplyStats,
  type AlumniRecord,
  type DataStore,
  type MemberRecord,
  type RegistrationQuery,
  type RegistrationRecord,
  type RegistrationInput,
  type RegistrationStats,
} from "../types";

/** SQLite 数据文件路径（默认项目根目录下 data/xinghai.db） */
export const DB_PATH =
  process.env.XINGHAI_DB_PATH ??
  path.join(process.cwd(), "data", "xinghai.db");

/* eslint-disable @typescript-eslint/no-explicit-any */
type Database = any; // better-sqlite3 的实例类型；经 serverExternalPackages 原生加载

/** 把数据库行的 snake_case 列映射为 camelCase 记录 */
function mapRegistration(row: any): RegistrationRecord {
  return {
    id: row.id,
    time: row.time,
    target: row.target ?? "",
    name: row.name,
    gender: row.gender ?? "",
    campus: row.campus ?? "",
    college: row.college ?? "",
    major: row.major ?? "",
    phone: row.phone ?? "",
    birth: row.birth,
    wechat: row.wechat,
    email: row.email,
    skill: row.skill,
    motive: row.motive,
    adjust: row.adjust ? 1 : 0,
    status: row.status,
    archivedAt: row.archived_at,
    source: row.source,
  };
}

const APPLY_COLS =
  "id, xh, name, campus, status, created, updated, source"; // 刻意不查 pwd

const MEMBER_COLS =
  "id, xh, name, gender, campus, college, major, phone, wechat, email, role, dept, join_date AS joinDate, grade, status, skill, note, position, updated, source";

const ALUMNI_COLS =
  "id, xh, name, gender, campus, college, major, phone, wechat, email, role, dept, join_date AS joinDate, grade, position, leave_date AS leaveDate, note, source";

export async function createSqliteStore(): Promise<DataStore> {
  const { default: Database } = await import("better-sqlite3");
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db: Database = new Database(DB_PATH);
  db.pragma("journal_mode = WAL"); // 提升并发读写表现（与旧栈优化一致）
  db.exec(SCHEMA_SQL);

  const isDuplicateConstraint = (err: unknown): boolean =>
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    String((err as { code: unknown }).code).startsWith("SQLITE_CONSTRAINT");

  const store: DataStore = {
    async createRegistration(input: RegistrationInput) {
      const keys = await store.findRegistrationDuplicate({
        phone: input.phone,
        email: input.email,
      });
      if (keys.phone || keys.email) throw new DuplicateRegistrationError(keys);

      const record: RegistrationRecord = {
        id: randomUUID(),
        time: new Date().toISOString(),
        target: input.target,
        name: input.name,
        gender: input.gender,
        campus: input.campus,
        college: input.college,
        major: input.major,
        phone: input.phone,
        birth: input.birth ?? null,
        wechat: input.wechat ?? null,
        email: input.email ?? null,
        skill: input.skill ?? null,
        motive: input.motive ?? null,
        adjust: input.adjust ? 1 : 0,
        status: null,
        archivedAt: null,
        source: "new",
      };
      try {
        db.prepare(
          `INSERT INTO registrations
             (id, time, target, name, gender, birth, campus, college, major,
              phone, wechat, email, skill, motive, adjust, status, archived_at, source)
           VALUES
             (@id, @time, @target, @name, @gender, @birth, @campus, @college, @major,
              @phone, @wechat, @email, @skill, @motive, @adjust, @status, @archivedAt, @source)`,
        ).run(record);
      } catch (err) {
        // 并发窗口下撞了唯一索引兜底
        if (isDuplicateConstraint(err)) {
          throw new DuplicateRegistrationError({
            phone: Boolean(input.phone),
            email: Boolean(input.email),
          });
        }
        throw err;
      }
      return record;
    },

    async findRegistrationDuplicate({ phone, email }) {
      const result = { phone: false, email: false };
      if (phone) {
        result.phone = Boolean(
          db
            .prepare(
              "SELECT 1 FROM registrations WHERE source='new' AND phone = ? LIMIT 1",
            )
            .get(phone),
        );
      }
      if (email) {
        result.email = Boolean(
          db
            .prepare(
              "SELECT 1 FROM registrations WHERE source='new' AND email = ? LIMIT 1",
            )
            .get(email),
        );
      }
      return result;
    },

    async listRegistrations(query: RegistrationQuery = {}) {
      const where: string[] = [];
      const params: Record<string, unknown> = {};
      if (query.q) {
        where.push(
          "(name LIKE @q OR phone LIKE @q OR target LIKE @q OR college LIKE @q)",
        );
        params.q = `%${query.q}%`;
      }
      if (query.source) {
        where.push("source = @source");
        params.source = query.source;
      }
      const sql = `SELECT * FROM registrations
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY time DESC LIMIT @limit`;
      params.limit = query.limit ?? 300;
      return db.prepare(sql).all(params).map(mapRegistration);
    },

    async registrationStats(): Promise<RegistrationStats> {
      const total = db
        .prepare("SELECT COUNT(*) AS c FROM registrations")
        .get().c as number;
      const today = db
        .prepare(
          "SELECT COUNT(*) AS c FROM registrations WHERE time LIKE ? || '%'",
        )
        .get(new Date().toISOString().slice(0, 10)).c as number;
      const byTarget: Record<string, number> = {};
      for (const row of db
        .prepare(
          "SELECT target, COUNT(*) AS c FROM registrations GROUP BY target",
        )
        .all()) {
        byTarget[row.target || "未填"] = row.c;
      }
      return { total, today, byTarget };
    },

    async listApplies(): Promise<ApplyRecord[]> {
      return db
        .prepare(`SELECT ${APPLY_COLS} FROM applies ORDER BY created DESC`)
        .all();
    },

    async applyStats(): Promise<ApplyStats> {
      const total = db.prepare("SELECT COUNT(*) AS c FROM applies").get()
        .c as number;
      const byStatus: Record<string, number> = {};
      for (const row of db
        .prepare("SELECT status, COUNT(*) AS c FROM applies GROUP BY status")
        .all()) {
        byStatus[row.status || "未知"] = row.c;
      }
      return { total, byStatus, pending: byStatus["待审"] ?? 0 };
    },

    async listMembers(): Promise<MemberRecord[]> {
      return db
        .prepare(
          `SELECT ${MEMBER_COLS} FROM members ORDER BY grade DESC, dept, name`,
        )
        .all();
    },

    async listAlumni(): Promise<AlumniRecord[]> {
      return db
        .prepare(
          `SELECT ${ALUMNI_COLS} FROM alumni ORDER BY grade DESC, name`,
        )
        .all();
    },
  };

  return store;
}
