/**
 * 数据访问抽象层（门面）。
 *
 * 页面与 API 只 import 本文件，不接触具体数据库驱动；
 * 未来从 SQLite（方案 A）切到 Postgres（方案 B）时，
 * 在 getStore() 里替换实现即可，页面与接口零改动。
 *
 * 当前实现：
 *   1. 优先 better-sqlite3（data/xinghai.db，路径可用 XINGHAI_DB_PATH 覆盖）；
 *   2. 原生模块不可用时自动降级为内存存储并打警告。
 */

import { createMemoryStore } from "./stores/memory-store";
import {
  type AlumniRecord,
  type ApplyRecord,
  type ApplyStats,
  type DataStore,
  type MemberRecord,
  type RegistrationInput,
  type RegistrationQuery,
  type RegistrationRecord,
  type RegistrationStats,
} from "./types";

export * from "./types"; // 对外统一出口：类型 + DuplicateRegistrationError

let storePromise: Promise<DataStore> | null = null;

async function getStore(): Promise<DataStore> {
  if (!storePromise) {
    storePromise = import("./stores/sqlite-store")
      .then(({ createSqliteStore }) => createSqliteStore())
      .catch((err: unknown) => {
        console.warn(
          "[db] SQLite 初始化失败，已降级为内存存储（数据不落盘）：",
          err instanceof Error ? err.message : err,
        );
        return createMemoryStore();
      });
  }
  return storePromise;
}

/* ---------- 报名 ---------- */

/** 新增一条招新报名（重复手机号/邮箱抛 DuplicateRegistrationError） */
export async function createRegistration(
  input: RegistrationInput,
): Promise<RegistrationRecord> {
  return (await getStore()).createRegistration(input);
}

/** 后台报名列表（支持模糊搜索与来源过滤） */
export async function listRegistrations(
  query?: RegistrationQuery,
): Promise<RegistrationRecord[]> {
  return (await getStore()).listRegistrations(query);
}

/** 后台报名统计：总数 / 今日 / 按意向方向 */
export async function registrationStats(): Promise<RegistrationStats> {
  return (await getStore()).registrationStats();
}

/* ---------- 招新申请（旧栈 applies 审核体系，只读展示） ---------- */

export async function listApplies(): Promise<ApplyRecord[]> {
  return (await getStore()).listApplies();
}

export async function applyStats(): Promise<ApplyStats> {
  return (await getStore()).applyStats();
}

/* ---------- 成员 / 校友 ---------- */

export async function listMembers(): Promise<MemberRecord[]> {
  return (await getStore()).listMembers();
}

export async function listAlumni(): Promise<AlumniRecord[]> {
  return (await getStore()).listAlumni();
}
