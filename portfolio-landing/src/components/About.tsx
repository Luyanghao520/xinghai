import { motion } from "framer-motion";
import { ABOUT } from "../lib/data";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/** 04 关于星海 —— 100~120 字介绍 + 一句话精神内核 */
export default function About() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="mx-auto max-w-[860px] px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-stroke" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted">
              About
            </span>
          </div>
          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            关于{" "}
            <em className="font-display font-normal italic">星海</em>
          </h2>
          <p className="mt-7 text-base leading-loose text-muted md:text-lg">
            {ABOUT.body}
          </p>
          <p className="mt-8 border-l-2 border-stroke pl-5 font-display text-xl italic leading-relaxed text-text-primary md:text-2xl">
            「{ABOUT.spirit}」
          </p>
        </motion.div>
      </div>
    </section>
  );
}
