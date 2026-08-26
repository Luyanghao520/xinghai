import { motion } from "framer-motion";
import { JOURNAL } from "../lib/data";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function Journal() {
  return (
    <section id="journal" className="bg-bg/70 py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <motion.div
          className="mb-10 flex items-end justify-between gap-6 md:mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-stroke" />
              <span className="text-xs uppercase tracking-[0.3em] text-muted">
                Journal
              </span>
            </div>
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
              近期{" "}
              <em className="font-display font-normal italic">动态</em>
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted">
              演出、获奖与招新的第一手消息。
            </p>
          </div>

          <a
            href="https://Luyanghao.pythonanywhere.com/recruit"
            target="_blank"
            rel="noreferrer"
            className="g-hover hidden shrink-0 items-center gap-2 rounded-full border border-stroke bg-bg px-5 py-2.5 text-sm text-text-primary transition-all duration-300 hover:scale-105 hover:border-transparent md:inline-flex"
          >
            查看全部
            <span aria-hidden>→</span>
          </a>
        </motion.div>

        <div className="flex flex-col gap-3">
          {JOURNAL.map((entry, i) => (
            <motion.a
              key={entry.title}
              href="#contact"
              className="group flex items-center gap-4 rounded-[40px] border border-stroke bg-surface/40 p-4 transition-colors duration-300 hover:bg-surface sm:gap-6 sm:rounded-full"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
            >
              <img
                src={entry.image}
                alt=""
                loading="lazy"
                className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
              />
              <h3 className="flex-1 text-sm font-medium leading-snug sm:text-base">
                {entry.title}
              </h3>
              <span className="hidden shrink-0 rounded-full border border-stroke px-2.5 py-1 text-[11px] text-muted sm:block">
                {entry.tag}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-muted">
                {entry.date}
              </span>
              <span className="ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-stroke text-muted transition-colors duration-300 group-hover:border-transparent group-hover:bg-text-primary group-hover:text-bg">
                <span aria-hidden>↗</span>
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
