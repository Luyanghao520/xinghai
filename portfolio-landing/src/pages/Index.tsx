import { useEffect, useState } from "react";
import FixedBackground from "../components/FixedBackground";
import LoadingScreen from "../components/LoadingScreen";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import About from "../components/About";
import SelectedWorks from "../components/SelectedWorks";
import Teams from "../components/Teams";
import FitQuiz from "../components/FitQuiz";
import Journal from "../components/Journal";
import Footer from "../components/Footer";

export default function Index() {
  const params = new URLSearchParams(window.location.search);
  // `?skipload` jumps straight past the intro counter (dev/screenshot aid)
  const [isLoading, setIsLoading] = useState(() => !params.has("skipload"));
  // `?static` forces all entrance-gated elements visible (screenshot aid)
  const isStaticShot = params.has("static");

  // `?scroll=<id>` jumps to a section after mount (dev/screenshot aid) —
  // plain #hash anchors don't work before React has rendered the sections.
  useEffect(() => {
    const target = params.get("scroll");
    if (!target) return;
    document.getElementById(target)?.scrollIntoView({ behavior: "instant" });
  }, []);

  return (
    <>
      {/* 全屏固定背景视频 —— 不随内容滚动 */}
      <FixedBackground />

      <main
        className={`relative z-10 font-body text-text-primary ${
          isStaticShot ? "static-shot" : ""
        }`}
      >
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

        {/* v2 首页八块：Hero(02) → 信任条(03) → 关于(04) → 风采(05) → 团队全景(06) → 我适合哪里(07) → 动态+页脚(08) */}
        <Hero ready={!isLoading} />
        <Stats />
        <About />
        <SelectedWorks />
        <Teams />
        <FitQuiz />
        <Journal />
        <Footer />
      </main>
    </>
  );
}
