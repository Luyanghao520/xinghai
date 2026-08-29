import { TEAMS, type QuizQuestion, type Team } from "./data";

export type QuizAnswers = {
  [K in QuizQuestion["key"]]: string;
};

/**
 * 三问推荐（纯函数）：按「能力标签 > 上台/幕后 > 零基础轻投入」打分，
 * 返回得分最高的 1~2 支队伍。与组件解耦，可独立测试。
 */
export function recommend(answers: QuizAnswers, teams: Team[] = TEAMS): Team[] {
  const skill = answers.skill as Team["tags"][number];
  const onStage = answers.stage === "上台表演";
  const lightTime = answers.time === "1-2 小时";

  const scored = teams.map((team) => {
    let score = 0;
    if (team.tags.includes(skill)) score += 3;
    if (onStage === (team.type === "演出团")) score += 2;
    if (lightTime && team.noBasics) score += 1;
    return { team, score };
  });

  const max = Math.max(...scored.map((s) => s.score));
  const best = scored
    .filter((s) => s.score === max)
    .map((s) => s.team);
  // 并列过多时只取前 2（保持数据数组原序，展示稳定）
  return best.slice(0, 2);
}
