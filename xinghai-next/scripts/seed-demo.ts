/**
 * 成员演示数据种子（仅用于本地预览「在线成员」效果；生成 source='demo' 的成员行）。
 *
 *   npm run seed:demo            # 写入演示成员（幂等：先清后插）
 *   npm run seed:demo -- --clean # 清除演示成员
 *
 * 正式数据请走迁移脚本（npm run migrate），演示数据不含真实个人信息。
 */

import path from "node:path";
import Database from "better-sqlite3";

const TARGET_DB =
  process.env.XINGHAI_DB_PATH ?? path.join(process.cwd(), "data", "xinghai.db");
const fs = await import("node:fs");
fs.mkdirSync(path.dirname(TARGET_DB), { recursive: true });

const db = new Database(TARGET_DB);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id        TEXT PRIMARY KEY,
    xh        TEXT, name TEXT NOT NULL, gender TEXT, campus TEXT, college TEXT,
    major TEXT, phone TEXT, wechat TEXT, email TEXT, role TEXT, dept TEXT,
    join_date TEXT, grade TEXT, status TEXT, skill TEXT, note TEXT,
    position TEXT, updated TEXT, source TEXT NOT NULL DEFAULT 'legacy'
  )
`);

const clean = process.argv.includes("--clean");
if (clean) {
  const n = db.prepare("DELETE FROM members WHERE source='demo'").run().changes;
  console.log(`已清除演示成员 ${n} 条`);
} else {
  db.prepare("DELETE FROM members WHERE source='demo'").run();

  // 姓名/团队均为虚构演示数据；姓氏刻意覆盖「陈」以演示姓氏筛选
  const demo: Array<[string, string, string, string, string]> = [
    // [姓名, 团队, 届, 职务, 特长]
    ["陈星语", "合唱团", "2024", "团长", "美声"],
    ["陈可欣", "合唱团", "2025", "队员", "流行演唱"],
    ["陈志远", "交响乐团", "2024", "首席", "小提琴"],
    ["陈嘉懿", "办公室", "2024", "主任", "统筹协调"],
    ["王一诺", "合唱团", "2025", "声部长", "钢琴伴奏"],
    ["李慕清", "舞蹈团", "2024", "团长", "中国舞"],
    ["李嘉树", "舞蹈团", "2025", "队员", "Breaking"],
    ["张若曦", "主持团", "2024", "队长", "晚会主持"],
    "张致远|交响乐团|2025|队员|大提琴",
    "刘思彤|舞蹈团|2025|队员|Jazz",
    "刘子墨|话剧团|2024|团长|编剧",
    "徐佳音|合唱团|2025|队员|民族唱法",
    "徐天佑|企宣部|2024|部长|视频剪辑",
    "杨柳依|舞蹈团|2024|副团长|民族舞",
    "杨帆|企宣部|2025|干事|海报设计",
    "周子涵|主持团|2025|队员|配音",
    "周雅雯|民乐团|2024|团长|琵琶",
    "吴宇轩|话剧团|2025|队员|表演",
    "郑晓萌|礼仪队|2025|队长|礼仪模特",
    "林之恒|交响乐团|2024|团长|指挥",
    "黄诗琪|民乐团|2025|队员|二胡",
    "赵文博|资产管理部|2024|部长|器材管理",
    "孙悦宁|办公室|2025|干事|文书档案",
    "钱昊然|资产管理部|2025|干事|舞台设备",
  ].map((row) =>
    (typeof row === "string" ? row.split("|") : row) as [string, string, string, string, string],
  );

  const ins = db.prepare(
    `INSERT INTO members (id, xh, name, gender, campus, college, major, phone, wechat, email,
       role, dept, join_date, grade, status, skill, note, position, updated, source)
     VALUES (@id, NULL, @name, @gender, NULL, NULL, NULL, NULL, NULL, NULL,
       '成员', @dept, NULL, @grade, '成员', @skill, '演示数据', @position, @updated, 'demo')`,
  );
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    for (const [name, dept, grade, position, skill] of demo) {
      ins.run({
        id: `demo-${name}-${dept}`,
        name,
        gender: name.endsWith("彤") || name.endsWith("欣") || name.endsWith("曦") || name.endsWith("彤") ? "女" : "男",
        dept,
        grade,
        skill,
        position,
        updated: now,
      });
    }
  });
  tx();
  console.log(`已写入演示成员 ${demo.length} 条（source='demo'，可用 --clean 清除）`);
}
db.close();
