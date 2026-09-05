/**
 * 站点内容数据 —— 从旧栈 content.json / kb.json 原样移植（不重写文案）。
 *
 * 来源：仓库根目录 content.json（旧 CMS 数据）。
 * 阶段7 做 CMS 编辑后台后，这里改为从数据库/文件读取；现在先作为静态数据源，
 * 保证「改一处全站生效」仍只动这一个文件。
 */

/** 首页欢迎语（含旧栈的 <br>/<b> 标记；内容来自自有 content.json，非用户输入） */
export const heroWelcome =
  "学校的舞台上，处处有我们的身影——迎新晚会、十佳歌手、毕业季草坪音乐会……<br>校园里大大小小的活动，很大程度上都由<b>星海艺术团</b>统筹。<br><br>2026级的你，要不要成为这束光的一部分？<b>我们，招新啦。</b>";

/** 首页四大卖点（content.json b0-b3） */
export const sellingPoints = [
  {
    ico: "🌟",
    title: "核心舞台",
    text: "校迎新晚会、十佳歌手大赛、毕业季音乐会……核心活动由我们统筹，聚光灯为你而亮。",
  },
  {
    ico: "🤝",
    title: "同好挚友",
    text: "来自各学院、却同样热爱艺术的伙伴，会变成并肩作战、也一起玩闹的挚友。",
  },
  {
    ico: "💪",
    title: "实战成长",
    text: "策划、统筹、表达、审美——在一次次实战里，把「想做」变成「能做」。",
  },
  {
    ico: "🏆",
    title: "拿奖土壤",
    text: "近五年 40+ 奖项、连续三届全国大学生艺术展演一等奖，这里有拿奖的土壤。",
  },
];

/** 荣誉成就 */
export const honors = [
  { ico: "🏆", title: "全国大学生艺术展演", text: "连续三届斩获全国大学生艺术展演一等奖。" },
  { ico: "🎖️", title: "40+ 奖项", text: "近五年带队斩获国家级、市级奖项 40 余项。" },
  { ico: "🎤", title: "校级核心舞台", text: "迎新晚会、十佳歌手、毕业季音乐会等核心活动的中坚力量。" },
];

/** 师资（content.json t_wei / t_dai） */
export const teachers = [
  {
    role: "艺术团指导老师",
    name: "魏老师",
    text: "华东师范大学音乐学硕士，中国声乐学会理事、上海市美学学会理事、上海音乐家协会会员。近五年带队斩获国家级、市级奖项 40 余项。",
  },
  {
    role: "带队老师",
    name: "带队老师",
    text: "协助魏老师处理艺术团日常事务，陪伴大家一起成长、一起登台。",
  },
];

/** 表演团队（org.perform_teams，desc 为招新短文案） */
export const performTeams = [
  { name: "合唱团", ico: "🎤", short: "天籁和声，屡获金奖，分声部系统训练。", full: "天籁和声，屡获金奖。分声部系统训练，零基础也有完整培养路径，把热爱唱成奖杯。" },
  { name: "交响乐团", ico: "🎻", short: "管弦齐鸣，面向有器乐基础的同学。", full: "管弦齐鸣，大气磅礴。面向有器乐基础的同学，也欢迎向编曲与指挥方向生长。" },
  { name: "民乐团", ico: "🎶", short: "国风雅韵，民族乐器爱好者的主场。", full: "国风雅韵，丝竹声声。民族乐器爱好者的主场，传统与现代编曲兼修，奏出东方气韵。" },
  { name: "舞蹈团", ico: "💃", short: "街舞 / 民族 / 现代多舞种并行。", full: "翩若惊鸿，力与美并存。街舞、民族、现代多舞种并行，舞台表现力直接拉满。" },
  { name: "话剧团", ico: "🎭", short: "声台形表，年度大戏由你撑起。", full: "声台形表，戏梦人生。剧本、表演、舞美全能成长，年度大戏由你撑起台前幕后。" },
  { name: "主持团", ico: "🎙️", short: "校级晚会、赛事主持系统训练。", full: "妙语连珠，控场担当。校级晚会、赛事主持系统训练，让你在镜头前从容不慌。" },
  { name: "礼仪队", ico: "💐", short: "大型活动接待、颁奖礼仪，形象先锋。", full: "端庄优雅，形象先锋。大型活动接待、颁奖礼仪，气质与仪态双修，是门面的存在。" },
  { name: "更多可能", ico: "✨", short: "新方向持续孵化中。", full: "新方向持续孵化中，欢迎带着创意加入。" },
];

/** 行政部门（org.admin_teams，含完整招新文案 dept_desc） */
export const adminTeams = [
  { name: "办公室", ico: "🗂️", short: "统筹排期、会议记录、文书归档与联络。", full: "艺术团运转的「中枢」：统筹排期、会议记录、文书归档与内外联络。适合细心靠谱、喜欢把事情理顺的你。" },
  { name: "资产管理部", ico: "🎛️", short: "器材服装、道具与舞台设备调度。", full: "器材服装、道具与舞台设备的登记、维护与调度，是每场演出背后的「后勤总管」。" },
  { name: "企宣部", ico: "📣", short: "推文海报、视频拍摄与品牌包装。", full: "公众号推文、海报视频、活动现场拍摄与品牌包装。审美在线、会点设计或剪辑的同学别错过。" },
];

/** 主席团（org.*） */
export const chair = {
  title: "主席",
  desc: "统筹艺术团整体发展、对外联络与重大决策。",
  ico: "👑",
};
export const viceChairs = [
  { title: "副主席（浦东）· 陈嘉豪", desc: "分管浦东校区招新与日常运营。", ico: "🧭" },
  { title: "副主席（松江）· 郝博雅", desc: "分管松江校区招新与日常运营。", ico: "🧭" },
];

/** 招新咨询群二维码（旧栈已上传素材） */
export const consultQr = "/uploads/u20260717171010_f7be1541.png";

/** 演出/作品轮播（content.json carousel，图片路径已改指新栈 public 目录） */
export interface ShowcaseItem {
  img: string;
  title: string;
  tag: string;
  desc: string;
  href: string;
  linkText: string;
}

export const carousel: ShowcaseItem[] = [
  { img: "/uploads/showcase/sc02.jpg", tag: "舞蹈专场", title: "《扇韵》· 旗袍群舞", desc: "身着蓝白条纹旗袍的舞者以蒲扇为道具，整齐划一的队形展现东方古典韵味之美。", href: "/about#org", linkText: "团队风采" },
  { img: "/uploads/showcase/sc03.jpg", tag: "活力青春", title: "多彩青春 · 群舞绽放", desc: "彩虹色系服装的青春群舞，举手投足间洋溢着立信学子的朝气与活力。", href: "/recruit", linkText: "加入我们" },
  { img: "/uploads/showcase/sc04.jpg", tag: "古典舞", title: "《莲叶翩翩》· 全国一等奖", desc: "粉蓝渐变汉服、水袖翩跹——这支舞蹈斩获第七届全国大学生艺术展演一等奖。", href: "/about#honor", linkText: "查看荣誉" },
  { img: "/uploads/showcase/sc05.jpg", tag: "古风意境", title: "白蛇缘起 · 古风双人舞", desc: "一袭白衣执卷、一袭青衣执扇，舞台灯光下演绎东方美学的极致写意。", href: "/performances", linkText: "更多作品" },
  { img: "/uploads/showcase/sc06.jpg", tag: "现代编舞", title: "《书页之光》· 创意群舞", desc: "蓝色长裙舞者手持发光书页，在蓝色追光中铺展出一幅关于知识与梦想的画卷。", href: "/performances", linkText: "团队风采" },
  { img: "/uploads/showcase/sc07.jpg", tag: "拉丁热舞", title: "热情桑巴 · 拉丁专场", desc: "红裙飞扬、黑裙流苏，拉丁舞团用热烈节奏点燃全场，光芒与汗水交织的舞台。", href: "/about#org", linkText: "舞蹈团" },
  { img: "/uploads/showcase/sc09.jpg", tag: "敦煌飞天", title: "《千手观音》· 经典再现", desc: "多层手臂、华丽头饰、金色聚光灯——敦煌风格的震撼视觉，致敬经典艺术的永恒魅力。", href: "/about#honor", linkText: "荣誉殿堂" },
  { img: "/uploads/showcase/sc10.jpg", tag: "K-Pop街舞", title: "Z世代节拍 · 街舞风暴", desc: "迷彩工装裤+潮牌穿搭，街舞团以最in的编舞和超强律动征服年轻观众。", href: "/recruit", linkText: "加入星海" },
];

/** 全部演出照（旧栈 showcase 素材，用于演出页「更多瞬间」） */
export const showcaseAll = Array.from({ length: 23 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return `/uploads/showcase/sc${n}.jpg`;
});
