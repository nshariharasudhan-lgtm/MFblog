import fs from "fs";
import { INITIAL_ARTICLES } from "../src/lib/seedData";
import { TOPIC_HUBS } from "../src/data/topicHubsData";

console.log("=== AUDITING ARTICLES FOR SPECIFIC FUND NAMES OR RECOMMENDATIONS ===");

INITIAL_ARTICLES.forEach((art, index) => {
  console.log(`\n--- Article #${index + 1}: ${art.title} ---`);
  console.log(`  Slug: ${art.slug}`);
  console.log(`  Category: ${art.category}`);
  
  // Check if title or content has specific funds named
  const titleLower = art.title.toLowerCase();
  const contentLower = art.content.toLowerCase();
  
  const fundKeywords = [
    "parag parikh",
    "mirae asset",
    "quant small cap",
    "nippon india",
    "hdfc",
    "icici prudential",
    "sbi mutual",
    "kotak",
    "axis mutual",
    "motilal oswal"
  ];
  
  fundKeywords.forEach((k) => {
    if (titleLower.includes(k)) {
      console.log(`  ⚠️ Title contains specific fund name: "${k}"`);
    }
    if (contentLower.includes(k)) {
      // count occurrences
      const matches = contentLower.split(k).length - 1;
      console.log(`  ⚠️ Content contains "${k}" (${matches} times)`);
    }
  });

  // Check for recommendation phrasing
  const recPhrases = [
    "we recommend",
    "our recommendation",
    "best fund to buy",
    "top pick",
    "should invest in",
    "must buy",
    "strong buy"
  ];
  recPhrases.forEach((p) => {
    if (contentLower.includes(p)) {
      console.log(`  🚨 RECOMMENDATION PHRASE FOUND: "${p}"`);
    }
  });
});
