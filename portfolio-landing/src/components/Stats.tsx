import { motion } from "framer-motion";
import { STATS } from "../lib/data";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function Stats() {
  // 背景透明：视频背景全页透出
  return (
    <section id="stats" className="py-16 md:py-24">
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-12 px-6 sm:grid-cols-3 sm:gap-6 md:px-10">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
          >
            <div className="font-display text-5xl italic text-text-primary drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] md:text-6xl">
              {stat.value}
            </div>
            <div className="mt-3 text-xs tracking-[0.2em] text-muted">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
