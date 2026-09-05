import type { Metadata } from "next";
import Image from "next/image";
import Carousel from "@/components/Carousel";
import { carousel, showcaseAll } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "演出作品",
  description:
    "星海艺术团历年演出作品：《扇韵》《莲叶翩翩》《千手观音》等舞台瞬间，含全国大学生艺术展演一等奖作品",
};

/** 演出/作品页：轮播（真实作品与剧照文案）+ 更多瞬间照片墙 */
export default function PerformancesPage() {
  const carouselImgs = new Set(carousel.map((c) => c.img));
  const extraPhotos = showcaseAll.filter((img) => !carouselImgs.has(img));

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold">演出作品</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        迎新晚会、十佳歌手、毕业季草坪音乐会、全国大学生艺术展演……
        这里收录星海舞台的高光瞬间（剧照与介绍持续补充中）。
      </p>

      {/* 主轮播：8 个代表性作品 */}
      <div className="mt-8">
        <Carousel items={carousel} />
      </div>

      {/* 更多瞬间：照片墙 */}
      <h2 className="mt-14 text-2xl font-bold">更多瞬间</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        排练厅与舞台的随手记录（{extraPhotos.length} 张，点开可看大图）。
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {extraPhotos.map((img) => (
          <a
            key={img}
            href={img}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-background"
          >
            <Image
              src={img}
              alt="星海艺术团演出瞬间"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
