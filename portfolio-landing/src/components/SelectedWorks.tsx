import { motion } from "framer-motion";
import CardSpread from "./CardSpread";

/** 05 风采展示 —— 扇形卡组一屏呈现（6~8 张代表作） */
export default function SelectedWorks() {
  return (
    <section id="gallery" className="py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        {/* Header */}
        <motion.div
          className="mb-6 flex items-end justify-between gap-6 md:mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-stroke" />
              <span className="text-xs uppercase tracking-[0.3em] text-muted">
                Gallery
              </span>
            </div>
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
              风采{" "}
              <em className="font-display font-normal italic">展示</em>
            </h2>
          </div>
        </motion.div>

        <CardSpread />
      </div>
    </section>
  );
}
