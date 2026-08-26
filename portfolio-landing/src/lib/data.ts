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
