/**
 * 内存存储 —— better-sqlite3 不可用时的降级实现。
 * 数据仅存活于当前进程，重启即清空；保证脚手架在任何环境都能跑通。
 * 迁移脚本不使用本实现（迁移必须落盘）。
 */

import {
  DuplicateRegistrationError,
  type AlumniRecord,
  type ApplyRecord,
  type ApplyStats,
  type DataStore,
  type MemberRecord,
  type RegistrationQuery,
  type RegistrationRecord,
  type RegistrationInput,
  type RegistrationStats,
} from "../types";

export function createMemoryStore(): DataStore {
  const registrations: RegistrationRecord[] = [];

  return {
    async createRegistration(input: RegistrationInput) {
      const dup = {
        phone: Boolean(
          input.phone &&
            registrations.some(
              (r) => r.source === "new" && r.phone === input.phone,
            ),
        ),
        email: Boolean(
          input.email &&
            registrations.some(
              (r) => r.source === "new" && r.email === input.email,
            ),
        ),
      };
      if (dup.phone || dup.email) throw new DuplicateRegistrationError(dup);

      const record: RegistrationRecord = {
        id: crypto.randomUUID(),
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
      registrations.unshift(record);
      return record;
    },

    async findRegistrationDuplicate({ phone, email }) {
      return {
        phone: Boolean(
          phone &&
            registrations.some(
              (r) => r.source === "new" && r.phone === phone,
            ),
        ),
        email: Boolean(
          email &&
            registrations.some(
              (r) => r.source === "new" && r.email === email,
            ),
        ),
      };
    },

    async listRegistrations(query: RegistrationQuery = {}) {
      const q = query.q?.toLowerCase();
      return registrations
        .filter((r) => (query.source ? r.source === query.source : true))
        .filter((r) =>
          q
            ? [r.name, r.phone, r.target, r.college]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
            : true,
        )
        .slice(0, query.limit ?? 300);
    },

    async registrationStats(): Promise<RegistrationStats> {
      const todayPrefix = new Date().toISOString().slice(0, 10);
      const byTarget: Record<string, number> = {};
      for (const r of registrations) {
        const key = r.target || "未填";
        byTarget[key] = (byTarget[key] ?? 0) + 1;
      }
      return {
        total: registrations.length,
        today: registrations.filter((r) => r.time.startsWith(todayPrefix))
          .length,
        byTarget,
      };
    },

    async listApplies(): Promise<ApplyRecord[]> {
      return [];
    },
    async applyStats(): Promise<ApplyStats> {
      return { total: 0, byStatus: {}, pending: 0 };
    },
    async listMembers(): Promise<MemberRecord[]> {
      return [];
    },
    async listAlumni(): Promise<AlumniRecord[]> {
      return [];
    },
  };
}
