import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const HOST = "www.yieldnest.online";
const KEY = "caef2d2b54404d86b8fecc69ca144cfc";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

async function submitToIndexNow() {
  console.log(`🌐 [IndexNow] Preparing submission for ${HOST} with key ${KEY}...`);

  const sitemapPath = path.join(rootDir, "public", "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    console.error("❌ sitemap.xml not found!");
    process.exit(1);
  }

  const sitemapXml = fs.readFileSync(sitemapPath, "utf-8");
  const urlMatches = sitemapXml.match(/<loc>(https:\/\/[^<]+)<\/loc>/g) || [];
  const urls = urlMatches.map((m) => m.replace(/<\/?loc>/g, "").trim());

  if (urls.length === 0) {
    console.error("❌ No URLs found in sitemap.xml!");
    process.exit(1);
  }

  console.log(`📡 [IndexNow] Found ${urls.length} URLs to submit.`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🚀 Sending payload to ${endpoint}...`);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      console.log(`  Response Status: ${response.status} ${response.statusText}`);
      if (response.status === 200 || response.status === 202) {
        console.log(`  ✓ Successfully submitted ${urls.length} URLs to ${endpoint}!`);
      } else {
        const text = await response.text();
        console.warn(`  ⚠️ Search engine returned ${response.status}: ${text}`);
      }
    } catch (err: any) {
      console.warn(`  ⚠️ Could not contact ${endpoint}:`, err?.message || err);
    }
  }

  console.log("✨ [IndexNow] Submission process completed.");
}

submitToIndexNow().catch((err) => {
  console.error("❌ IndexNow submission error:", err);
});
