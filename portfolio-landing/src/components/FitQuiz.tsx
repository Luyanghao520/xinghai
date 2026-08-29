import { useState } from "react";
import { motion } from "framer-motion";
import { FIT_QUIZ } from "../lib/data";
import { recommend, type QuizAnswers } from "../lib/fitQuiz";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const RECRUIT_URL = "/recruit#depts";

/** 07 我适合哪里 —— 三问交互，纯前端推荐 1~2 支队伍（逻辑在 lib/fitQuiz.ts） */
export default function FitQuiz() {
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});

  const step = FIT_QUIZ.findIndex((q) => !answers[q.key]);
  const done = step === -1;
  const results = done ? recommend(answers as QuizAnswers) : [];

  const pick = (key: QuizQuestion_key, value: string) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-[860px] px-6 md:px-10">
        {/* Header */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-stroke" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted">
              Find Your Team
            </span>
            <span className="h-px w-8 bg-stroke" />
          </div>
          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            我{" "}
            <em className="font-display font-normal italic">适合哪里</em>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            回答三个问题，看看哪个方向最适合你。
          </p>
        </motion.div>

        {/* 问答卡 */}
        <motion.div
          className="rounded-3xl border border-stroke bg-surface/70 p-7 backdrop-blur-md md:p-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          {/* 进度点 */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {FIT_QUIZ.map((q, i) => (
              <span
                key={q.key}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  (answers[q.key] ? 3 : step === i ? 2 : 1) === 3
                    ? "w-8 bg-text-primary"
                    : step === i
                      ? "w-8 bg-text-primary/50"
                      : "w-4 bg-stroke"
                }`}
              />
            ))}
          </div>

          {!done ? (
            <div key={step}>
              <p className="text-center text-xs tracking-[0.2em] text-muted">
                Q{step + 1} / {FIT_QUIZ.length}
              </p>
              <h3 className="mt-3 text-center text-xl font-medium md:text-2xl">
                {FIT_QUIZ[step].title}
              </h3>
              <div
                className={`mt-8 grid gap-3 ${
                  FIT_QUIZ[step].options.length > 3
                    ? "grid-cols-2 sm:grid-cols-3"
                    : "sm:grid-cols-2"
                }`}
              >
                {FIT_QUIZ[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => pick(FIT_QUIZ[step].key, opt)}
                    className={`rounded-2xl border border-stroke bg-bg/60 px-4 py-4 text-sm text-muted transition-all duration-200 hover:border-white/20 hover:bg-surface hover:text-text-primary ${
                      FIT_QUIZ[step].options.length === 2 ? "py-6 text-base" : ""
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-center text-xs tracking-[0.2em] text-muted">
                你的推荐方向
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {results.map((team) => (
                  <a
                    key={team.id}
                    href={RECRUIT_URL}
                    className="group rounded-2xl border border-stroke bg-bg/60 p-6 transition-all duration-300 hover:border-white/20 hover:bg-surface"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{team.name}</h4>
                      <span className="rounded-full border border-stroke px-2.5 py-0.5 text-[11px] text-muted">
                        {team.type}
                      </span>
                    </div>
                    <p className="mt-1 font-display text-sm italic text-muted">
                      {team.tagline}
                    </p>
                    <p className="mt-3 text-[13px] leading-relaxed text-muted">
                      {team.intro}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-text-primary transition-transform duration-300 group-hover:translate-x-1">
                      去招新网页看详情 <span aria-hidden>→</span>
                    </span>
                  </a>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => setAnswers({})}
                  className="rounded-full border border-stroke px-6 py-2.5 text-sm text-muted transition-colors duration-200 hover:border-white/20 hover:text-text-primary"
                >
                  重新测一测
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

type QuizQuestion_key = (typeof FIT_QUIZ)[number]["key"];
