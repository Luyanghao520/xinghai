export interface Project {
  title: string;
  tag: string;
  image: string;
  /** Tailwind column span on md+ */
  span: string;
  aspect: string;
}

export interface JournalEntry {
  title: string;
  tag: string;
  date: string;
  image: string;
}

export interface Exploration {
  title: string;
  image: string;
  rotation: string;
}

/* ------------------------------------------------------------------ */
/* 星海艺术团 · 内容数据                                                */
/* 图片来自官网实拍 static/uploads/showcase（已复制到 public/showcase） */
/* ------------------------------------------------------------------ */

/** 精选舞台 — bento 四宫格（跨度 7/5/5/7 交替） */
export const PROJECTS: Project[] = [
  {
    title: "扇韵 · 旗袍群舞",
    tag: "舞蹈专场",
    image: "/showcase/sc02.jpg",
    span: "md:col-span-7",
    aspect: "aspect-[16/10]",
  },
  {
    title: "莲叶翩翩 · 全国一等奖",
    tag: "古典舞",
    image: "/showcase/sc04.jpg",
    span: "md:col-span-5",
    aspect: "aspect-[4/3]",
  },
  {
    title: "千手观音 · 敦煌飞天",
    tag: "经典再现",
    image: "/showcase/sc09.jpg",
    span: "md:col-span-5",
    aspect: "aspect-[4/3]",
  },
  {
    title: "Z世代节拍 · 街舞风暴",
    tag: "活力青春",
    image: "/showcase/sc10.jpg",
    span: "md:col-span-7",
    aspect: "aspect-[16/10]",
  },
];

/** 近期动态 */
export const JOURNAL: JournalEntry[] = [
  {
    title: "2026 级新生招新正式启动",
    tag: "招新",
    date: "2026.09",
    image: "/showcase/sc03.jpg",
  },
  {
    title: "《莲叶翩翩》再夺全国大艺展一等奖",
    tag: "获奖",
    date: "2026.06",
    image: "/showcase/sc04.jpg",
  },
  {
    title: "毕业季草坪音乐会 · 全场大合唱",
    tag: "演出",
    date: "2026.06",
    image: "/showcase/sc06.jpg",
  },
  {
    title: "十佳歌手大赛落幕 · 星海人闪耀全场",
    tag: "赛事",
    date: "2026.05",
    image: "/showcase/sc07.jpg",
  },
];

/** 幕后碎片 — 视差画廊 */
export const EXPLORATIONS: Exploration[] = [
  { title: "星光集 · 壹", image: "/showcase/sc01.jpg", rotation: "-rotate-2" },
  { title: "星光集 · 贰", image: "/showcase/sc05.jpg", rotation: "rotate-2" },
  { title: "星光集 · 叁", image: "/showcase/sc08.jpg", rotation: "-rotate-1" },
  { title: "星光集 · 肆", image: "/showcase/sc11.jpg", rotation: "rotate-1" },
  { title: "星光集 · 伍", image: "/showcase/sc12.jpg", rotation: "-rotate-2" },
  { title: "星光集 · 陆", image: "/showcase/sc13.jpg", rotation: "rotate-2" },
];

/** 数据 */
export const STATS = [
  { value: "40+", label: "近五年斩获国家级·市级奖项" },
  { value: "3", label: "连续三届全国大艺展一等奖" },
  { value: "11", label: "演出与职能部门方向" },
];

/** 招新咨询群二维码（复用仓库根 static/uploads 下的原图） */
export const CONSULT_QR = "/u20260717171010_f7be1541.png";

/* ================================================================== */
/* 首页改版 v2 数据（单一来源：团队全景 / 我适合哪里 / 关于 / 信任条）      */
/* ================================================================== */

export type Campus = "松江" | "浦东";
export type TeamType = "演出团" | "职能部门";
/** 三问第二题的能力标签（teams.tags 与 quiz 选项共用） */
export type FitTag =
  | "唱歌"
  | "器乐"
  | "舞蹈形体"
  | "表达表演"
  | "文字设计"
  | "沟通组织";

export interface Team {
  /** 锚点/关键 id（小写拼音） */
  id: string;
  name: string;
  /** 一句话定位 */
  tagline: string;
  /** 1~2 句简介：演什么/干什么、适合什么人、零基础可进？ */
  intro: string;
  type: TeamType;
  campuses: Campus[];
  /** 零基础可加入 */
  noBasics: boolean;
  /** 三问推荐用能力标签 */
  tags: FitTag[];
}

/** 组织事实基线：7 演出团 + 4 职能部门 = 11 支；主持团仅浦东（AI_CONTEXT §4.2） */
export const TEAMS: Team[] = [
  // ---- 演出团 · 7 ----
  {
    id: "hechang",
    name: "合唱团",
    tagline: "天籁和声",
    intro: "用和声讲述故事，分声部系统训练，参演迎新晚会与毕业季音乐会。零基础可加入。",
    type: "演出团",
    campuses: ["松江", "浦东"],
    noBasics: true,
    tags: ["唱歌"],
  },
  {
    id: "jiaoxiang",
    name: "交响乐团",
    tagline: "管弦齐鸣",
    intro: "大气磅礴的管弦编制，面向有器乐基础的同学，也欢迎向编曲与指挥方向生长。",
    type: "演出团",
    campuses: ["松江", "浦东"],
    noBasics: false,
    tags: ["器乐"],
  },
  {
    id: "minyue",
    name: "民乐团",
    tagline: "国风雅韵",
    intro: "民族乐器爱好者的主场，传统与现代编曲兼修，奏出东方气韵。有基础更佳。",
    type: "演出团",
    campuses: ["松江", "浦东"],
    noBasics: false,
    tags: ["器乐"],
  },
  {
    id: "wudao",
    name: "舞蹈团",
    tagline: "翩若惊鸿",
    intro: "街舞、民族、现代多舞种并行，力与美并存，舞台表现力直接拉满。零基础可培养。",
    type: "演出团",
    campuses: ["松江", "浦东"],
    noBasics: true,
    tags: ["舞蹈形体"],
  },
  {
    id: "huaju",
    name: "话剧团",
    tagline: "声台形表",
    intro: "剧本、表演、舞美全能成长，年度大戏由你撑起台前幕后。零基础可加入。",
    type: "演出团",
    campuses: ["松江", "浦东"],
    noBasics: true,
    tags: ["表达表演"],
  },
  {
    id: "zhuchi",
    name: "主持团",
    tagline: "妙语连珠",
    intro: "校级晚会、赛事主持系统训练，让你在镜头前从容不慌。唯一仅浦东招新的演出团。",
    type: "演出团",
    campuses: ["浦东"],
    noBasics: true,
    tags: ["表达表演"],
  },
  {
    id: "liyi",
    name: "礼仪队",
    tagline: "端庄优雅",
    intro: "大型活动接待、颁奖礼仪，气质与仪态双修，是星海门面的存在。零基础可加入。",
    type: "演出团",
    campuses: ["松江", "浦东"],
    noBasics: true,
    tags: ["舞蹈形体"],
  },
  // ---- 职能部门 · 4（职责文案为草案，待 owner 核对）----
  {
    id: "qixuan",
    name: "企宣部",
    tagline: "品牌与内容",
    intro: "推文、海报、现场摄影摄像与新媒体运营；学排版设计、内容策划与图文制作。零基础，会教。",
    type: "职能部门",
    campuses: ["松江", "浦东"],
    noBasics: true,
    tags: ["文字设计"],
  },
  {
    id: "wailian",
    name: "外联部",
    tagline: "资源与联络",
    intro: "拉赞助、校际交流、活动对接；学商务沟通、资源拓展与活动策划。敢开口就行。",
    type: "职能部门",
    campuses: ["松江", "浦东"],
    noBasics: true,
    tags: ["沟通组织"],
  },
  {
    id: "bangong",
    name: "办公室",
    tagline: "中枢与统筹",
    intro: "统筹排期、会议记录、文书归档与通知下达；学行政统筹与跨部门协调。细心负责，零基础。",
    type: "职能部门",
    campuses: ["松江", "浦东"],
    noBasics: true,
    tags: ["沟通组织"],
  },
  {
    id: "ziguan",
    name: "资产管理部",
    tagline: "物资与保障",
    intro: "服装道具、乐器设备与场地的登记借还维护；学物资台账与流程规范。踏实靠谱，零基础。",
    type: "职能部门",
    campuses: ["松江", "浦东"],
    noBasics: true,
    tags: ["沟通组织"],
  },
];

/** 04 关于星海 */
export const ABOUT = {
  body: "星海艺术团是上海立信会计金融学院校级学生艺术团体，由校团委指导，浦东、松江双校区协同运作。七大演出团与四个职能部门并行——演出团负责舞台，职能部门让舞台发生。自 2004 年建团以来，星海人以艺术实践为载体，把热爱唱成奖杯，把方案落成掌声。",
  spirit: "培养有审美、有担当、有舞台的青年",
};

/** 03 数据信任条（真实口径，勿编造） */
export const FACTS = [
  { value: "3 届", label: "连续全国大艺展一等奖" },
  { value: "40+", label: "近五年国家级·市级奖项" },
  { value: "7 · 4", label: "演出团 · 职能部门" },
  { value: "304 项", label: "2004 年建团以来累计获奖" },
];

/** 07 我适合哪里 · 三问 */
export interface QuizQuestion {
  key: "stage" | "skill" | "time";
  title: string;
  options: string[];
}

export const FIT_QUIZ: QuizQuestion[] = [
  { key: "stage", title: "你想站在舞台上，还是让舞台发生？", options: ["上台表演", "幕后统筹"] },
  { key: "skill", title: "你更擅长哪一个？", options: ["唱歌", "器乐", "舞蹈形体", "表达表演", "文字设计", "沟通组织"] },
  { key: "time", title: "每周能投入多少时间？", options: ["1-2 小时", "3-5 小时", "5 小时以上"] },
];
