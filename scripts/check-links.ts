import fs from "fs";
import path from "path";
import { INITIAL_ARTICLES } from "../src/lib/seedData";
import { TOPIC_HUBS } from "../src/data/topicHubsData";

const validRoutes = new Set([
  "/",
  "/calculators",
  "/calculator",
  "/calculators/sip",
  "/calculator/sip",
  "/calculators/step-up-sip",
  "/calculator/step-up-sip",
  "/calculators/lumpsum",
  "/calculator/lumpsum",
  "/calculators/swp",
  "/calculator/swp",
  "/calculators/goal-planner",
  "/calculator/goal-planner",
  "/calculators/tax-estimator",
  "/calculator/tax-estimator",
  "/calculator/direct-vs-regular",
  "/calculators/direct-vs-regular",
  "/calculator/cost-of-delay",
  "/calculators/cost-of-delay",
  "/calculator/sip-vs-lumpsum",
  "/calculators/sip-vs-lumpsum",
  "/faq",
  "/glossary",
  "/guides",
  "/guides/how-to-choose-a-mutual-fund",
  "/how-to-choose-a-mutual-fund",
  "/guides/redemption-checklist",
  "/redemption-checklist",
  "/hubs",
  "/topics",
  "/sitemap.xml",
  "/robots.txt",
  "/llms.txt",
  "/admin"
]);

INITIAL_ARTICLES.forEach((a) => validRoutes.add(`/article/${a.slug}`));
TOPIC_HUBS.forEach((h) => {
  validRoutes.add(`/hub/${h.slug}`);
  validRoutes.add(`/topic/${h.slug}`);
});

[
  "fund-comparison",
  "performance-analysis",
  "market-trends",
  "category-deep-dive",
  "sip-strategies"
].forEach((c) => validRoutes.add(`/category/${c}`));

function walk(dir: string): string[] {
  let res: string[] = [];
  fs.readdirSync(dir).forEach((f) => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) res = res.concat(walk(full));
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) res.push(full);
  });
  return res;
}

const files = walk("./src");
let brokenCount = 0;
files.forEach((f) => {
  const content = fs.readFileSync(f, "utf-8");
  const matches = content.matchAll(/href=["'`]((\/[^"'`#?]*))/g);
  for (const m of matches) {
    const link = m[1];
    if (link.startsWith("/api") || link.startsWith("/assets")) continue;
    if (!validRoutes.has(link)) {
      console.log(`POTENTIAL BROKEN LINK: "${link}" in ${f}`);
      brokenCount++;
    }
  }
});

console.log(`Scan completed. Unresolved internal link count: ${brokenCount}`);
