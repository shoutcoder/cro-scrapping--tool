import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

const EXCLUDED_PAGES = ["about", "contact", "privacy", "terms", "faq", "careers", "login", "register"];
const MAX_PAGES = 15; // Limit to 10 pages per crawl

export const scrapeWebsite = async (baseUrl) => {
  try {
    let pagesToVisit = [baseUrl];
    let visitedPages = new Set();
    let allContent = [];

    while (pagesToVisit.length > 0 && visitedPages.size < MAX_PAGES) {
      const currentUrl = pagesToVisit.shift();
      if (visitedPages.has(currentUrl)) continue;

      console.log(`Crawling: ${currentUrl}`);
      visitedPages.add(currentUrl);

      try {
        const { data } = await axios.get(currentUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);
        let pageContent = [];

        // Extract text from relevant sections
        $("h1, h2, h3, p").each((_, element) => {
          const text = $(element).text().trim();
          if (text.length > 20) pageContent.push(text);
        });

        // Extract images (potential variation images)
        let images = [];
        $("img").each((_, img) => {
          let imgSrc = $(img).attr("src");
          if (imgSrc && imgSrc.startsWith("/")) {
            imgSrc = new URL(imgSrc, baseUrl).href; // Convert relative URLs to absolute
          }
          if (imgSrc) images.push(imgSrc);
        });

        // Ensure page has at least 1 image before adding it
        if (images.length > 0) {
          allContent.push({
            url: currentUrl,
            text: pageContent.join("\n"),
            images: images,
          });
        }

        // Extract internal links and add to queue
        $("a").each((_, link) => {
          let href = $(link).attr("href");
          if (href && href.startsWith("/") && !EXCLUDED_PAGES.some((word) => href.includes(word))) {
            const fullUrl = new URL(href, baseUrl).href;
            if (!visitedPages.has(fullUrl) && !pagesToVisit.includes(fullUrl)) {
              pagesToVisit.push(fullUrl);
            }
          }
        });
      } catch (err) {
        console.error(`Failed to scrape ${currentUrl}: ${err.message}`);
      }
    }

    return allContent.length ? allContent : null;
  } catch (error) {
    console.error(`Scraper Error:`, error);
    return null;
  }
};