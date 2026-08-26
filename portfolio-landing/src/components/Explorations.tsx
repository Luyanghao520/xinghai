import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import type { Exploration } from "../lib/data";
import { EXPLORATIONS } from "../lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function Explorations() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<Exploration | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: pinRef.current,
        pinSpacing: false,
      });

      gsap.fromTo(
        col1Ref.current,
        { y: 60 },
        {
          y: -260,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
      gsap.fromTo(
        col2Ref.current,
        { y: 140 },
        {
          y: -520,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const half = Math.ceil(EXPLORATIONS.length / 2);
  const col1 = EXPLORATIONS.slice(0, half);
  const col2 = EXPLORATIONS.slice(half);

  return (
    <section
      id="explorations"
      ref={sectionRef}
      className="relative min-h-[300vh]"
    >
      <div
        ref={pinRef}
        className="flex h-screen items-center justify-center px-6"
      >
        <div className="z-10 flex max-w-xl flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-stroke" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted">
              Behind the Scenes
            </span>
            <span className="h-px w-8 bg-stroke" />
          </div>
          <h2 className="text-3xl font-medium tracking-tight md:text-5xl">
            幕后的{" "}
            <em className="font-display font-normal italic">星光碎片</em>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
            排练、候场与谢幕之后——那些被镜头悄悄记下的瞬间。
          </p>
          <a
            href="#contact"
            className="g-hover mt-8 inline-flex items-center gap-2 rounded-full border border-stroke bg-bg px-5 py-2.5 text-sm text-text-primary transition-all duration-300 hover:scale-105 hover:border-transparent"
          >
            想和我们一起登台？
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <div className="mx-auto grid h-full max-w-[1400px] grid-cols-2 gap-12 px-6 md:gap-40 lg:px-16">
          <div
            ref={col1Ref}
            className="flex flex-col justify-between py-[12vh]"
          >
            {col1.map((item) => (
              <ExploreCard
                key={item.title}
                item={item}
                onClick={() => setLightbox(item)}
              />
            ))}
          </div>
          <div
            ref={col2Ref}
            className="flex flex-col justify-between py-[28vh]"
          >
            {col2.map((item) => (
              <ExploreCard
                key={item.title}
                item={item}
                onClick={() => setLightbox(item)}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[500] flex items-center justify-center bg-bg/90 p-6 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.figure
              className="max-w-lg"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <img
                src={lightbox.image}
                alt={lightbox.title}
                className="aspect-square w-full rounded-3xl border border-stroke object-cover"
              />
              <figcaption className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-muted">
                {lightbox.title}
              </figcaption>
            </motion.figure>
            <button
              aria-label="关闭"
              onClick={() => setLightbox(null)}
              className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-full border border-stroke bg-surface text-text-primary transition-colors hover:bg-stroke/50"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ExploreCard({
  item,
  onClick,
}: {
  item: Exploration;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group pointer-events-auto relative mx-auto aspect-square w-full max-w-[320px] cursor-pointer overflow-hidden rounded-3xl border border-stroke bg-surface transition-transform duration-500 hover:scale-[1.03] ${item.rotation}`}
      aria-label={`放大查看 ${item.title}`}
    >
      <img
        src={item.image}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 bg-bg/50 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100" />
      <span className="absolute inset-x-0 bottom-4 text-center text-[11px] uppercase tracking-[0.25em] text-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {item.title}
      </span>
    </button>
  );
}
