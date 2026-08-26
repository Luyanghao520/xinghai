import { motion } from "framer-motion";
import { PROJECTS } from "../lib/data";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function SelectedWorks() {
  return (
    <section id="work" className="bg-bg/75 py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        {/* Header */}
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
                Selected Stage
              </span>
            </div>
            <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
              登台的{" "}
              <em className="font-display font-normal italic">高光时刻</em>
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted">
              从排练厅到聚光灯下——每一次登台，都是星海的名场面。
            </p>
          </div>

          <a
            href="#explorations"
            className="g-hover hidden shrink-0 items-center gap-2 rounded-full border border-stroke bg-bg px-5 py-2.5 text-sm text-text-primary transition-all duration-300 hover:scale-105 hover:border-transparent md:inline-flex"
          >
            更多风采
            <span aria-hidden>→</span>
          </a>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {PROJECTS.map((project, i) => (
            <motion.article
              key={project.title}
              className={`group relative overflow-hidden rounded-3xl border border-stroke bg-surface ${project.span} ${project.aspect}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.9,
                delay: (i % 2) * 0.08,
                ease: EASE,
              }}
            >
              {/* Background image */}
              <img
                src={project.image}
                alt={project.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Halftone overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-20 mix-blend-multiply"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #000 1px, transparent 1px)",
                  backgroundSize: "4px 4px",
                }}
              />

              {/* Title chip (resting state) */}
              <span className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1.5 text-[11px] tracking-[0.2em] text-white/85 backdrop-blur-sm">
                {project.tag} · {project.title}
              </span>

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-bg/70 opacity-0 backdrop-blur-lg transition-opacity duration-500 group-hover:opacity-100">
                <span className="animated-g-border inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm text-black">
                  回顾 —{" "}
                  <em className="font-display italic">{project.title}</em>
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
