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
  const applies: ApplyRecord[] = [];
  const members: MemberRecord[] = [];

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
        .filter((r) => {
          if (!query.status) return true;
          if (query.status === "pending") return r.status == null;
          return r.status === query.status;
        })
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

    async updateRegistrationStatus(id: string, status: string | null) {
      const row = registrations.find((r) => r.id === id);
      if (!row) return false;
      row.status = status;
      row.archivedAt = status === null ? null : new Date().toISOString();
      return true;
    },

    async deleteRegistration(id: string) {
      const idx = registrations.findIndex((r) => r.id === id);
      if (idx < 0) return false;
      registrations.splice(idx, 1);
      return true;
    },

    async admitRegistration(id: string): Promise<MemberRecord | null> {
      const row = registrations.find((r) => r.id === id);
      if (!row || row.status === "已录取") return null;
      const now = new Date().toISOString();
      const member: MemberRecord = {
        id: crypto.randomUUID(),
        xh: null,
        name: row.name,
        gender: row.gender,
        campus: row.campus,
        college: row.college,
        major: row.major,
        phone: row.phone,
        wechat: row.wechat,
        email: row.email,
        role: "成员",
        dept: row.target || null,
        joinDate: now.slice(0, 10),
        grade: String(new Date().getFullYear()),
        status: "成员",
        skill: row.skill,
        note: `来自招新报名（${row.time}）`,
        position: "队员",
        updated: now,
        source: "admit",
      };
      members.unshift(member);
      row.status = "已录取";
      row.archivedAt = now;
      return member;
    },

    async listApplies(): Promise<ApplyRecord[]> {
      return [...applies];
    },
    async applyStats(): Promise<ApplyStats> {
      const byStatus: Record<string, number> = {};
      for (const a of applies) {
        byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
      }
      return { total: applies.length, byStatus, pending: byStatus["待审"] ?? 0 };
    },
    async setApplyStatus(id: string, status: string) {
      const row = applies.find((a) => a.id === id);
      if (!row) return false;
      row.status = status;
      row.updated = new Date().toISOString();
      return true;
    },
    async listMembers(): Promise<MemberRecord[]> {
      return [...members];
    },
    async listAlumni(): Promise<AlumniRecord[]> {
      return [];
    },
  };
}
