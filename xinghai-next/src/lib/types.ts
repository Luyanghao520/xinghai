/**
 * 实体类型与存储接口 —— 数据层的「合同」。
 *
 * 页面 / API / 迁移脚本只依赖这些类型；换数据库（SQLite → Postgres）
 * 时新写一个实现 DataStore 接口的类即可，业务代码零改动。
 */

/** 招新报名提交内容（对齐旧栈 registrations 表字段，见 recruit.html 表单） */
export interface RegistrationInput {
  /** 意向方向/组别（必填） */
  target: string;
  /** 姓名（必填） */
  name: string;
  /** 性别：男 / 女（必填） */
  gender: string;
  /** 校区：浦东 / 松江（必填） */
  campus: string;
  /** 院系（必填） */
  college: string;
  /** 专业 / 班级（必填） */
  major: string;
  /** 手机号（必填，防重复键之一） */
  phone: string;
  /** 出生年月（选填） */
  birth?: string;
  /** 微信号（选填） */
  wechat?: string;
  /** 邮箱（选填，防重复键之一） */
  email?: string;
  /** 特长 / 才艺 / 相关经历（选填） */
  skill?: string;
  /** 报名动机 / 自我介绍（选填） */
  motive?: string;
  /** 是否服从调剂（所报方向满员时可调配） */
  adjust?: boolean;
}

/** 报名记录（入库后的完整形态，含迁移来的历史数据） */
export interface RegistrationRecord extends Required<
  Pick<RegistrationInput, "target" | "name" | "gender" | "campus" | "college" | "major" | "phone">
> {
  id: string;
  time: string;
  birth: string | null;
  wechat: string | null;
  email: string | null;
  skill: string | null;
  motive: string | null;
  adjust: number;
  /** 旧栈归档流程的承接字段（新提交为空） */
  status: string | null;
  archivedAt: string | null;
  /** 数据来源：new=新栈提交 / legacy=旧库导入 / legacy-archive=旧库归档表导入 */
  source: string;
}

/** 招新申请记录（旧栈 applies：学号+密码 的审核体系）。⚠ pwd 永不对外返回 */
export interface ApplyRecord {
  id: string;
  xh: string;
  name: string;
  campus: string | null;
  status: string;
  created: string | null;
  updated: string | null;
  source: string;
}

/** 申请账号的认证行（内部使用，含密码哈希；严禁出库到接口/页面） */
export interface ApplyAuthRow {
  id: string;
  xh: string;
  name: string;
  campus: string | null;
  status: string;
  created: string | null;
  updated: string | null;
  source: string;
  pwd: string;
}

/** 学生自己可见的申请信息（/me 页与 /api/auth/me 返回） */
export interface ApplySelfView {
  xh: string;
  name: string;
  campus: string | null;
  status: string;
  created: string | null;
  updated: string | null;
}

/** 新建申请账号的入参（pwd 为**哈希后**的值，调用方先 hashPassword） */
export interface ApplyCreateInput {
  xh: string;
  name: string;
  campus: string;
  pwdHash: string;
}

/** 成员记录（公开页只展示 name/grade/dept/position/skill 等非联系方式字段） */
export interface MemberRecord {
  id: string;
  xh: string | null;
  name: string;
  gender: string | null;
  campus: string | null;
  college: string | null;
  major: string | null;
  phone: string | null;
  wechat: string | null;
  email: string | null;
  role: string | null;
  dept: string | null;
  joinDate: string | null;
  grade: string | null;
  status: string | null;
  skill: string | null;
  note: string | null;
  position: string | null;
  updated: string | null;
  source: string;
}

/** 校友记录 */
export interface AlumniRecord {
  id: string;
  xh: string | null;
  name: string;
  gender: string | null;
  campus: string | null;
  college: string | null;
  major: string | null;
  phone: string | null;
  wechat: string | null;
  email: string | null;
  role: string | null;
  dept: string | null;
  joinDate: string | null;
  grade: string | null;
  position: string | null;
  leaveDate: string | null;
  note: string | null;
  source: string;
}

/** 报名列表查询条件（后台搜索，对齐旧栈 admin 的 name/phone/target 搜索） */
export interface RegistrationQuery {
  /** 模糊匹配姓名/手机号/意向方向/院系 */
  q?: string;
  /** 只看某数据来源（如 'new'） */
  source?: string;
  /**
   * 按状态筛选：'pending'=未处理（status 为空）、'archived'=已归档、
   * 'admitted'=已录取；其余值按原样精确匹配；不传=全部
   */
  status?: string;
  limit?: number;
}

/** 报名统计（后台看板） */
export interface RegistrationStats {
  total: number;
  today: number;
  byTarget: Record<string, number>;
}

/** 申请审核统计（后台看板） */
export interface ApplyStats {
  total: number;
  byStatus: Record<string, number>;
  pending: number;
}

/**
 * 数据存储接口 —— 换数据库时实现它即可。
 * 抛错语义：重复提交抛 DuplicateRegistrationError，其余异常原样上抛。
 */
export interface DataStore {
  createRegistration(input: RegistrationInput): Promise<RegistrationRecord>;
  findRegistrationDuplicate(
    keys: Pick<RegistrationInput, "phone" | "email">,
  ): Promise<{ phone: boolean; email: boolean }>;
  listRegistrations(query?: RegistrationQuery): Promise<RegistrationRecord[]>;
  registrationStats(): Promise<RegistrationStats>;

  /**
   * 更新报名状态（后台写操作）。
   * status 传 '已归档'/'已录取' 等会同时写入 archived_at；传 null 恢复为未处理。
   * @returns 是否确实更新了一行（id 不存在返回 false）
   */
  updateRegistrationStatus(id: string, status: string | null): Promise<boolean>;
  /** 硬删除一条报名记录（仅建议用于垃圾/测试数据） */
  deleteRegistration(id: string): Promise<boolean>;
  /**
   * 录取：把一条报名转成成员记录（部门=意向方向、届别=当前年份），
   * 并把报名标记为 '已录取'。报名不存在或已是录取态时返回 null。
   */
  admitRegistration(id: string): Promise<MemberRecord | null>;

  listApplies(): Promise<ApplyRecord[]>;
  applyStats(): Promise<ApplyStats>;
  /** 更新申请审核状态（'待审'/'已通过'/'已驳回'），同时刷新 updated */
  setApplyStatus(id: string, status: string): Promise<boolean>;

  /** 新建申请账号（学号重复抛 DuplicateApplyError） */
  createApply(input: ApplyCreateInput): Promise<ApplyRecord>;
  /** 按学号查申请账号（含密码哈希，仅供认证流程内部使用） */
  findApplyAuthByXh(xh: string): Promise<ApplyAuthRow | null>;
  /** 更新申请账号密码哈希（登录升级旧格式 / 重置密码），同时刷新 updated */
  updateApplyPassword(xh: string, pwdHash: string): Promise<boolean>;

  listMembers(): Promise<MemberRecord[]>;
  listAlumni(): Promise<AlumniRecord[]>;
}

/** 重复报名错误（新提交的手机号/邮箱已存在） */
export class DuplicateRegistrationError extends Error {
  readonly keys: { phone: boolean; email: boolean };
  constructor(keys: { phone: boolean; email: boolean }) {
    const what = [
      keys.phone ? "手机号" : null,
      keys.email ? "邮箱" : null,
    ]
      .filter(Boolean)
      .join("和");
    super(`该${what}已提交过报名，请勿重复提交`);
    this.name = "DuplicateRegistrationError";
    this.keys = keys;
  }
}

/** 学号已被注册（申请账号） */
export class DuplicateApplyError extends Error {
  constructor() {
    super("该学号已申请过账号");
    this.name = "DuplicateApplyError";
  }
}
