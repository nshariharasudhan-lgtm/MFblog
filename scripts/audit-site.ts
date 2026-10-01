import fs from "fs";
import path from "path";
import { INITIAL_ARTICLES } from "../src/lib/seedData";
import { TOPIC_HUBS } from "../src/data/topicHubsData";
import { GLOSSARY_TERMS } from "../src/data/glossaryData";
import keywordsData from "../src/data/keywords.json";

console.log("=========================================");
console.log("       COMPREHENSIVE AUDIT REPORT        ");
console.log("=========================================\n");

// 1. AUDIT SPECIFIC FUND NAMES & RECOMMENDATIONS
console.log("--- 1. AUDITING ARTICLES & CONTENT FOR SPECIFIC FUND NAMES OR RECOMMENDATIONS ---");
INITIAL_ARTICLES.forEach((a) => {
  const hasSpecificNames = /parag parikh|mirae asset|quant small cap|nippon india|hdfc|icici|sbi/i.test(a.title);
  const hasRecommendationWord = /best |top |recommend|pick/i.test(a.title);
  if (hasSpecificNames || hasRecommendationWord) {
    console.log(`[SPECIFIC/RECOMMENDATION DETECTED] ID: ${a.id} | Slug: ${a.slug}`);
    console.log(`  Title: "${a.title}"`);
    console.log(`  Excerpt: "${a.excerpt.substring(0, 120)}..."`);
  }
});

// Check keywords.json for recommendations
let recCount = 0;
keywordsData.forEach((k: any) => {
  if (k.answer && (/we recommend|you should buy|best fund to invest|invest in this scheme/i.test(k.answer))) {
    recCount++;
    console.log(`[KEYWORD RECOMMENDATION]: Query: "${k.query}" | Answer: ${k.answer.substring(0, 100)}...`);
  }
});
console.log(`Total promotional recommendations in keywords.json: ${recCount}`);

// 2. AUDIT BROKEN LINKS & ROUTE COVERAGE
console.log("\n--- 2. AUDITING INTERNAL LINKS ACROSS ALL TSX FILES ---");
const srcDir = path.resolve("./src");
function getAllFiles(dir: string, ext: string[]): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(file, ext));
    } else {
      if (ext.some((e) => file.endsWith(e))) results.push(file);
    }
  });
  return results;
}

const allTsxFiles = getAllFiles(srcDir, [".tsx", ".ts"]);
const hrefPattern = /href=["'`]((\/[a-zA-Z0-9_\-\/]*))/g;
const links = new Set<string>();

allTsxFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf-8");
  let match;
  while ((match = hrefPattern.exec(content)) !== null) {
    const p = match[1];
    if (!p.startsWith("/api") && !p.startsWith("/assets")) {
      links.add(p);
    }
  }
});

console.log(`Found ${links.size} distinct internal paths in code:`);
const validArticleSlugs = new Set(INITIAL_ARTICLES.map((a) => `/article/${a.slug}`));
const validHubSlugs = new Set(TOPIC_HUBS.map((h) => `/hub/${h.slug}`));

Array.from(links).sort().forEach((link) => {
  // Check if link matches a known route in App.tsx
  const isKnown =
    link === "/" ||
    link === "/calculators" ||
    link === "/calculator" ||
    link.startsWith("/calculators/") ||
    link.startsWith("/calculator/") ||
    link === "/faq" ||
    link === "/glossary" ||
    link === "/guides" ||
    link === "/guides/how-to-choose-a-mutual-fund" ||
    link === "/how-to-choose-a-mutual-fund" ||
    link === "/guides/redemption-checklist" ||
    link === "/redemption-checklist" ||
    link === "/hubs" ||
    link === "/topics" ||
    link.startsWith("/category/") ||
    link.startsWith("/sitemap") ||
    link.startsWith("/robots") ||
    link.startsWith("/llms") ||
    validHubSlugs.has(link) ||
    validArticleSlugs.has(link);

  if (!isKnown) {
    console.log(`  ❌ UNMATCHED / POTENTIALLY BROKEN LINK: ${link}`);
  } else {
    console.log(`  ✓ Valid Route: ${link}`);
  }
});

// 3. AUDIT IMAGES: Check for <img> tags and verify loading, alt, dimensions
console.log("\n--- 3. AUDITING IMAGES FOR LAZY LOADING & PERFORMANCE ---");
allTsxFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf-8");
  if (content.includes("<img")) {
    const lines = content.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("<img")) {
        console.log(`  Image in ${path.relative(".", file)}:${i + 1}`);
        console.log(`    Code: ${line.trim()}`);
        if (!line.includes("loading=") && !content.includes("loading=\"lazy\"")) {
          console.log(`    ⚠️ Missing loading="lazy" attribute`);
        }
        if (!line.includes("alt=")) {
          console.log(`    ⚠️ Missing alt attribute`);
        }
      }
    });
  }
});

// 4. AUDIT DISCLAIMERS ACROSS PAGES
console.log("\n--- 4. AUDITING REGULATORY DISCLAIMERS ACROSS COMPONENTS ---");
const pageComponents = [
  "src/components/ArticleReader.tsx",
  "src/components/TopicHubPage.tsx",
  "src/components/TopicHubsIndexPage.tsx",
  "src/components/FAQPage.tsx",
  "src/components/GlossaryPage.tsx",
  "src/components/guides/HowToChooseFundGuide.tsx",
  "src/components/guides/RedemptionChecklistPage.tsx",
  "src/components/guides/GuidesIndexPage.tsx",
  "src/components/CalculatorSuitePage.tsx",
  "src/components/calculators/CalculatorsHubPage.tsx",
  "src/components/calculators/SipCalculatorPage.tsx",
  "src/components/calculators/StepUpSipCalculatorPage.tsx",
  "src/components/calculators/LumpsumCalculatorPage.tsx",
  "src/components/Footer.tsx",
  "src/components/Navbar.tsx"
];

pageComponents.forEach((cmp) => {
  if (fs.existsSync(cmp)) {
    const content = fs.readFileSync(cmp, "utf-8");
    const hasDisclaimer =
      /disclaimer|statutory|market risk|not sebi|educational/i.test(content);
    if (!hasDisclaimer) {
      console.log(`  ⚠️ MISSING STATUTORY DISCLAIMER: ${cmp}`);
    } else {
      console.log(`  ✓ Disclaimer present: ${cmp}`);
    }
  }
});
