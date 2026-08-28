import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EXPLORATIONS } from "../lib/data";

/* card-spread 同语义：一叠扇形排列的卡组，悬停（移动端点按）展开 */
export default function CardSpread() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const upd = () => setIsMobile(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  const n = EXPLORATIONS.length;
  const mid = (n - 1) / 2;
  const spreadX = isMobile ? 52 : 118;
  const restX = isMobile ? 10 : 24;

  return (
    <div className="relative mb-14 select-none">
      <div
        className="relative mx-auto flex h-[280px] cursor-pointer items-center justify-center sm:h-[360px]"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        role="group"
        aria-label="舞台瞬间照片卡组"
      >
        {EXPLORATIONS.map((item, i) => {
          const off = i - mid;
          return (
            <motion.figure
              key={item.title}
              className="absolute w-36 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl sm:w-44"
              style={{ zIndex: open ? 10 + i : n - i, aspectRatio: "3 / 4" }}
              initial={false}
              animate={
                open
                  ? { x: off * spreadX, rotate: off * 3.5, y: Math.abs(off) * -8 }
                  : { x: off * restX, rotate: off * 9, y: Math.abs(off) * 12 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <img
                src={item.image}
                alt={item.title}
                draggable={false}
                className="h-full w-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2.5 pt-7 text-[10px] tracking-[0.2em] text-white/85">
                {item.title}
              </figcaption>
            </motion.figure>
          );
        })}
      </div>
      <p className="text-center text-[11px] uppercase tracking-[0.3em] text-muted">
        Stage Moments · {open ? "收起" : isMobile ? "点按展开" : "悬停展开"}
      </p>
    </div>
  );
}
