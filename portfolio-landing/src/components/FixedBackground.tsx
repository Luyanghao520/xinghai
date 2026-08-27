import { useEffect, useRef, useState } from "react";

/**
 * 全屏固定背景：本地星空视频（同源直出，无外网 CDN 依赖）。
 * - position: fixed —— 页面滚动时纹丝不动，所有模块从它上面滑过；
 * - 本地 mp4 直接 video.src，无 HLS 切片 → 无马赛克、无卡顿、离线可用；
 * - 蓝色星云辉光层（screen 混合、持续脉动）压在视频暗部之上，
 *   消除画面下半的死黑并让背景始终"活着"；
 * - 降级链：视频 → 海报 ken-burns 漂移（同样是持续动画）。
 */
const VIDEO_SRC = "/static/uploads/bg-starfield.mp4";
const POSTER = "/static/uploads/bg-starfield.jpg";
export default function FixedBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /* 真正开始渲染第一帧才淡入 */
    const onPlaying = () => setReady(true);
    video.addEventListener("playing", onPlaying, { once: true });
    video.src = VIDEO_SRC;
    void video.play().catch(() => {});

    /* 标签页隐藏时暂停，回来即续播 —— 省电 */
    const onVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        void video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      video.removeEventListener("playing", onPlaying);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden bg-bg">
      {/* 海报兜底层：视频就绪后让位；未就绪时持续 ken-burns 漂移，背景永远是活的 */}
      <img
        src={POSTER}
        alt=""
        className={`absolute inset-0 h-full w-full animate-bg-kenburns object-cover will-change-transform transition-opacity duration-1000 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
      />

      <video
        ref={videoRef}
        className={`absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover will-change-transform transition-opacity duration-1000 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      />

      {/* 蓝色星云辉光：screen 混合点亮视频暗部，持续脉动 —— 移植自旧首页 */}
      <div className="bg-nebula bg-nebula-1" />
      <div className="bg-nebula bg-nebula-2" />

      {/* 顶/底轻渐变：只保导航与页脚文字可读 */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg/60 to-transparent" />
    </div>
  );
}
