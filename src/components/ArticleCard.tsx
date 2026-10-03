import React from "react";
import { Clock, ArrowUpRight, BarChart2 } from "lucide-react";
import { ArticlePost } from "../types";

interface ArticleCardProps {
  post: ArticlePost;
  onOpen: (post: ArticlePost) => void;
  featured?: boolean;
}

export function ArticleCard({ post, onOpen, featured = false }: ArticleCardProps) {
  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const primaryAmfi = post.amfiDataSnapshot?.[0];
  const articleHref = `/article/${post.slug}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let browser handle middle-click, ctrl/cmd click to open in new tab
    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      onOpen(post);
    }
  };

  if (featured) {
    return (
      <a
        href={articleHref}
        onClick={handleClick}
        className="block group text-inherit no-underline"
        title={`Read: ${post.title}`}
      >
        <article className="p-6 sm:p-8 md:p-10 bg-[#F4F2EB] rounded-2xl border border-[#E6E3D8] hover:border-[#CFCBBF] transition-all">
          <div className="flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="bg-[#1A1A1A] text-white px-2.5 py-0.5 rounded text-[11px] font-medium tracking-wide">
                  Featured Analysis
                </span>
                <span className="bg-stone-200 text-stone-800 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide">
                  {post.category}
                </span>
                <span className="text-[#878378]">•</span>
                <span className="text-[#69655C] font-mono-data text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTimeMinutes} min read
                </span>
              </div>

              <h2 className="font-serif-editorial text-2xl sm:text-3xl md:text-4xl text-[#1A1A1A] font-semibold leading-tight group-hover:text-emerald-800 transition-colors max-w-4xl">
                {post.title}
              </h2>

              <p className="text-[#4F4C44] text-sm sm:text-base leading-relaxed max-w-4xl line-clamp-3 sm:line-clamp-4">
                {post.excerpt}
              </p>
            </div>

            {/* Analyzed Scheme Focus */}
            {primaryAmfi && (
              <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E3DFC2]/60 flex flex-wrap items-center justify-between gap-3 text-xs max-w-3xl">
                <div className="flex items-center gap-2 text-stone-800">
                  <BarChart2 className="w-3.5 h-3.5 text-stone-600" />
                  <span className="font-mono-data text-xs">
                    Scheme Focus: <span className="font-semibold text-stone-900">{primaryAmfi.schemeName}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono-data text-stone-500">
                  <span>Code: {primaryAmfi.schemeCode}</span>
                  <span>•</span>
                  <span className="italic">AMFI &amp; MFINDIA Sourced • As on Date</span>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-[#E6E3D8]/80 text-xs text-[#736F65]">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#1A1A1A]">Research Desk</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
              <span className="flex items-center gap-1 font-medium text-[#1A1A1A] group-hover:translate-x-0.5 transition-transform">
                Read Analysis <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </article>
      </a>
    );
  }

  return (
    <a
      href={articleHref}
      onClick={handleClick}
      className="block group text-inherit no-underline h-full"
      title={`Read: ${post.title}`}
    >
      <article className="flex flex-col justify-between h-full p-5 sm:p-6 bg-white rounded-xl border border-[#EAE8E0] hover:border-[#D1CDBC] hover:shadow-xs transition-all">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-xs font-semibold text-[#57534E] uppercase tracking-wider font-mono-data">
              {post.category}
            </span>
            <span className="text-[#57534E] font-mono-data text-[11px] font-medium">
              {post.readTimeMinutes} min read
            </span>
          </div>

          <h3 className="font-serif-editorial text-xl sm:text-2xl text-[#1A1A1A] font-semibold leading-snug group-hover:text-emerald-800 transition-colors">
            {post.title}
          </h3>

          <p className="text-[#44403C] text-xs sm:text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>

          {primaryAmfi && (
            <div className="pt-1.5 flex items-center justify-between text-[11px] font-mono-data text-stone-600 border-t border-stone-100">
              <span className="truncate max-w-[220px]">Scheme: {primaryAmfi.schemeName}</span>
              <span className="text-[10px] text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">
                AMFI &amp; MFINDIA • As on Date
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 mt-4 flex items-center justify-between border-t border-[#F0EFEA] text-xs text-[#57534E]">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#1A1A1A]">Research Desk</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
          <span className="flex items-center gap-1 font-medium text-[#1A1A1A] group-hover:translate-x-0.5 transition-transform">
            Read <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </article>
    </a>
  );
}
