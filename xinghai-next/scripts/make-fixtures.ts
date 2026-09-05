/**
 * 生成假旧库夹具（仅用于本地验证迁移管道，生成到 .fixtures/ 目录）。
 * 真实数据请从 PythonAnywhere 导出，不要用本脚本伪造。
 *
 *   cd xinghai-next && npm run fixtures && LEGACY_DIR=.fixtures npm run migrate
 */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const outDir = path.resolve(process.cwd(), ".fixtures");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

function makeDb(file: string) {
  return new Database(path.join(outDir, file));
}

// --- registrations.db：报名 3 条 + 归档 1 条 ---
{
  const db = makeDb("registrations.db");
  db.exec(`CREATE TABLE registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT, time TEXT, target TEXT, name TEXT,
    gender TEXT, birth TEXT, campus TEXT, college TEXT, major TEXT, phone TEXT,
    wechat TEXT, email TEXT, skill TEXT, motive TEXT, adjust INTEGER)`);
  db.exec(`CREATE TABLE archive_regs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, time TEXT, target TEXT, name TEXT,
    gender TEXT, birth TEXT, campus TEXT, college TEXT, major TEXT, phone TEXT,
    wechat TEXT, email TEXT, skill TEXT, motive TEXT, adjust INTEGER,
    status TEXT, archived_at TEXT)`);
  const ins = db.prepare(
    `INSERT INTO registrations (time,target,name,gender,birth,campus,college,major,phone,wechat,email,skill,motive,adjust)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  );
  ins.run("2025-09-01 10:00:00", "声乐方向", "张小明", "男", "2006-05", "浦东", "音乐学院", "音乐学2401", "13800000001", "zx_std", "zx@example.com", "美声十级", "从小热爱唱歌", 1);
  ins.run("2025-09-02 14:30:00", "舞蹈方向", "李小红", "女", "2006-11", "松江", "舞蹈学院", "舞蹈教育2402", "13800000002", "lxh_dance", "lxh@example.com", "中国舞六年", "希望登上舞台", 0);
  ins.run("2025-09-03 09:15:00", "器乐方向", "王小刚", "男", "2005-03", "浦东", "音乐学院", "器乐2301", "13800000003", "wxg_cello", "wxg@example.com", "大提琴八年", "想找合奏伙伴", 1);
  db.prepare(
    `INSERT INTO archive_regs (time,target,name,gender,birth,campus,college,major,phone,wechat,email,skill,motive,adjust,status,archived_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run("2024-09-01 09:00:00", "主持方向", "陈旧旧", "女", "2004-01", "浦东", "电影学院", "播音2201", "13800000099", "cjj_old", "cjj@example.com", "主持经验丰富", "往届归档样例", 0, "已通过", "2024-09-20 12:00:00");
  db.close();
}

// --- apply.db：申请账号 2 条 ---
{
  const db = makeDb("apply.db");
  db.exec(`CREATE TABLE applies (
    id INTEGER PRIMARY KEY AUTOINCREMENT, xh TEXT, pwd TEXT, name TEXT,
    campus TEXT, status TEXT, created TEXT, updated TEXT)`);
  const ins = db.prepare(
    "INSERT INTO applies (xh,pwd,name,campus,status,created,updated) VALUES (?,?,?,?,?,?,?)",
  );
  ins.run("2430011", "<fixture-hash-1>", "张小明", "浦东", "待审", "2025-09-01 10:05:00", "2025-09-01 10:05:00");
  ins.run("2430022", "<fixture-hash-2>", "李小红", "松江", "已通过", "2025-09-02 14:35:00", "2025-09-05 18:00:00");
  db.close();
}

// --- members.db：在册 3 条 + 校友 1 条 ---
{
  const db = makeDb("members.db");
  db.exec(`CREATE TABLE members (
    xh TEXT, name TEXT, gender TEXT, campus TEXT, college TEXT, major TEXT,
    phone TEXT, wechat TEXT, email TEXT, role TEXT, dept TEXT, join_date TEXT,
    grade TEXT, status TEXT, skill TEXT, note TEXT, position TEXT, updated TEXT)`);
  db.exec(`CREATE TABLE alumni (
    xh TEXT, name TEXT, gender TEXT, campus TEXT, college TEXT, major TEXT,
    phone TEXT, wechat TEXT, email TEXT, role TEXT, dept TEXT, join_date TEXT,
    grade TEXT, position TEXT, leave_date TEXT, note TEXT)`);
  const ins = db.prepare(
    `INSERT INTO members (xh,name,gender,campus,college,major,phone,wechat,email,role,dept,join_date,grade,status,skill,note,position,updated)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  );
  ins.run("2330001", "刘团长", "女", "浦东", "音乐学院", "音表2301", "13800000101", "ltz01", "ltz@example.com", "学生干部", "主席团", "2023-09", "2023", "成员", "钢琴", "团长", "团长", "2025-06-01 10:00:00");
  ins.run("2430011", "张小明", "男", "浦东", "音乐学院", "音乐学2401", "13800000001", "zx_std", "zx@example.com", "成员", "声乐队", "2025-09", "2024", "成员", "美声", "", "队员", "2025-09-20 12:00:00");
  ins.run("2430022", "李小红", "女", "松江", "舞蹈学院", "舞蹈教育2402", "13800000002", "lxh_dance", "lxh@example.com", "成员", "舞蹈队", "2025-09", "2024", "成员", "中国舞", "领舞", "队员", "2025-09-20 12:00:00");
  const insA = db.prepare(
    `INSERT INTO alumni (xh,name,gender,campus,college,major,phone,wechat,email,role,dept,join_date,grade,position,leave_date,note)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  );
  insA.run("2030001", "陈学长", "男", "浦东", "电影学院", "播音2001", "13800000901", "cxz_alumni", "cxz@example.com", "成员", "主持队", "2020-09", "2020", "队长", "2024-06-30", "毕业离团");
  db.close();
}

console.log(`夹具已生成：${outDir}`);
