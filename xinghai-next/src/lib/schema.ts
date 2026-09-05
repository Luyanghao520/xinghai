/**
 * 新栈 SQLite 建表 DDL（唯一来源）。
 *
 * - 运行时由 src/lib/stores/sqlite-store.ts 执行；
 * - 迁移脚本 scripts/migrate-legacy.ts 也 import 同一份，保证两边结构一致。
 *
 * 列名与旧栈对应表保持同名列（snake_case），迁移时可直接按列搬运；
 * 新栈增加三列：id(TEXT，新数据为 uuid、迁移数据为 lg- 前缀确定性 id)、
 * source（数据来源）、status/archived_at（承接旧 archive_regs 的归档信息）。
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS registrations (
  id          TEXT PRIMARY KEY,
  time        TEXT NOT NULL,
  target      TEXT NOT NULL DEFAULT '',
  name        TEXT NOT NULL,
  gender      TEXT,
  birth       TEXT,
  campus      TEXT,
  college     TEXT,
  major       TEXT,
  phone       TEXT,
  wechat      TEXT,
  email       TEXT,
  skill       TEXT,
  motive      TEXT,
  adjust      INTEGER NOT NULL DEFAULT 0,
  status      TEXT,
  archived_at TEXT,
  source      TEXT NOT NULL DEFAULT 'new'
);

-- 报名/申请/成员三张表只读，不承担写接口；
-- 迁移进来的 applies 保留 pwd 列是为了完整对齐旧结构，但任何接口/页面都不得返回它。
CREATE TABLE IF NOT EXISTS applies (
  id      TEXT PRIMARY KEY,
  xh      TEXT NOT NULL,
  pwd     TEXT NOT NULL DEFAULT '',
  name    TEXT NOT NULL,
  campus  TEXT,
  status  TEXT NOT NULL DEFAULT '待审',
  created TEXT,
  updated TEXT,
  source  TEXT NOT NULL DEFAULT 'legacy'
);

CREATE TABLE IF NOT EXISTS members (
  id        TEXT PRIMARY KEY,
  xh        TEXT,
  name      TEXT NOT NULL,
  gender    TEXT,
  campus    TEXT,
  college   TEXT,
  major     TEXT,
  phone     TEXT,
  wechat    TEXT,
  email     TEXT,
  role      TEXT,
  dept      TEXT,
  join_date TEXT,
  grade     TEXT,
  status    TEXT,
  skill     TEXT,
  note      TEXT,
  position  TEXT,
  updated   TEXT,
  source    TEXT NOT NULL DEFAULT 'legacy'
);

CREATE TABLE IF NOT EXISTS alumni (
  id        TEXT PRIMARY KEY,
  xh        TEXT,
  name      TEXT NOT NULL,
  gender    TEXT,
  campus    TEXT,
  college   TEXT,
  major     TEXT,
  phone     TEXT,
  wechat    TEXT,
  email     TEXT,
  role      TEXT,
  dept      TEXT,
  join_date TEXT,
  grade     TEXT,
  position  TEXT,
  leave_date TEXT,
  note      TEXT,
  source    TEXT NOT NULL DEFAULT 'legacy'
);

-- 防重复提交：新提交（source='new'）的手机号/邮箱不允许重复；
-- 迁移的历史数据不参与该约束（旧栈历史上存在同号多届报名的可能）。
CREATE UNIQUE INDEX IF NOT EXISTS uq_regs_phone_new
  ON registrations(phone) WHERE source='new' AND phone IS NOT NULL AND phone != '';
CREATE UNIQUE INDEX IF NOT EXISTS uq_regs_email_new
  ON registrations(email) WHERE source='new' AND email IS NOT NULL AND email != '';
`;
