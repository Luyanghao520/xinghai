import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const HLS_SRC =
  "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8";

/** 视频就绪前的海报兜底（敦煌《千手观音》，金色调与视频氛围一致） */
const POSTER = "/showcase/sc09.jpg";

/**
 * 全屏固定背景视频。
 * - position: fixed —— 页面滚动时纹丝不动，所有模块从它上面滑过；
 * - 超清：ABR 配置乐观（高初始带宽估计 + 激进升档因子），快速爬到最高码率档；
 * - 流畅不卡切片：60s 前向大缓冲吸收网络抖动，Web Worker 解复用不占主线程，
 *   且视频完全可播前隐藏（只显示海报），避免半加载切片的马赛克闪现；
 * - 降级链：hls.js → Safari 原生 HLS → 静态海报（网络不可用时页面依旧成立）。
 */
export default function FixedBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [motionOk] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (!motionOk) return;
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    let recovered = false;

    /* 真正开始渲染第一帧才淡入 —— 杜绝“糊一下再清晰”的切片感 */
    const onPlaying = () => setReady(true);
    video.addEventListener("playing", onPlaying, { once: true });

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true, // demux/remux 进 worker，主线程零负担
        lowLatencyMode: false, // 要丝滑不要低延迟
        maxBufferLength: 60, // 前向缓冲 60s —— 抗抖动核心
        maxMaxBufferLength: 600,
        backBufferLength: 30,
        maxBufferHole: 0.5, // 收紧缓冲空洞，卡顿即补
        abrEwmaDefaultEstimate: 5_000_000, // 高初始带宽估计
        abrBandWidthUpFactor: 2, // 升档最快
        capLevelToPlayerSize: false, // 全屏下允许满分辨率档位
      });
      hls.loadSource(HLS_SRC);
      hls.attachMedia(video);

      /* 清单解析后锁定最高清档（1708×1212 @ ~4.5Mbps）：
         恒定最高画质 + 零档位切换抖动 —— “更高清”的最强保证。 */
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!hls) return;
        const top = hls.levels.length - 1;
        if (top >= 0) {
          hls.currentLevel = top;
          hls.nextLevel = top;
        }
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          if (!recovered) {
            recovered = true;
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR)
              hls?.recoverMediaError();
            else hls?.startLoad();
            return;
          }
          /* 二次致命错误：放弃流媒体，停留在海报层 */
          hls?.destroy();
          hls = null;
          return;
        }
        /* 非致命但缓冲耗尽（锁最高档遇弱网）：临时放开 auto 保流畅 */
        if (
          data.type === Hls.ErrorTypes.MEDIA_ERROR &&
          data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR &&
          hls &&
          hls.currentLevel !== -1
        ) {
          hls.currentLevel = -1;
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = HLS_SRC; // Safari 原生 HLS
    }

    /* 标签页隐藏时暂停，回来即续播 —— 省电省带宽 */
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
      hls?.destroy();
    };
  }, [motionOk]);

  return (
    <div aria-hidden className="fixed inset-0 z-0 overflow-hidden bg-bg">
      {/* 海报兜底层：视频就绪后让位 */}
      <img
        src={POSTER}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
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

      {/* 可读性叠层：轻压暗保通透（画面更清晰）+ 顶/底渐变过渡 */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg/90 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg/90 to-transparent" />
    </div>
  );
}
