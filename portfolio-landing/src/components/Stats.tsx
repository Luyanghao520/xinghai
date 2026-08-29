import { motion } from "framer-motion";
import { FACTS } from "../lib/data";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/** 03 数据信任条 —— 紧跟 Hero，一行四格（真实口径，勿改数字） */
export default function Stats() {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-stroke bg-stroke/60 md:grid-cols-4">
          {FACTS.map((fact, i) => (
            <motion.div
              key={fact.label}
              className="bg-bg/80 px-4 py-7 text-center backdrop-blur-sm md:py-9"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
            >
              <div className="font-display text-3xl italic text-text-primary drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] md:text-4xl">
                {fact.value}
              </div>
              <div className="mt-2.5 text-[11px] leading-relaxed tracking-[0.12em] text-muted">
                {fact.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
