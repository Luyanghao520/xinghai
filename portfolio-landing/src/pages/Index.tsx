import { useEffect, useState } from "react";
import FixedBackground from "../components/FixedBackground";
import LoadingScreen from "../components/LoadingScreen";
import Hero from "../components/Hero";
import SelectedWorks from "../components/SelectedWorks";
import Journal from "../components/Journal";
import Explorations from "../components/Explorations";
import Stats from "../components/Stats";
import Footer from "../components/Footer";

export default function Index() {
  const params = new URLSearchParams(window.location.search);
  // `?skipload` jumps straight past the intro counter (dev/screenshot aid)
  const [isLoading, setIsLoading] = useState(() => !params.has("skipload"));
  // `?static` forces all entrance-gated elements visible (screenshot aid)
  const isStaticShot = params.has("static");

  // `?scroll=<id>` jumps to a section after mount (dev/screenshot aid)
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

        <Hero ready={!isLoading} />
        <SelectedWorks />
        <Journal />
        <Explorations />
        <Stats />
        <Footer />
      </main>
    </>
  );
}
