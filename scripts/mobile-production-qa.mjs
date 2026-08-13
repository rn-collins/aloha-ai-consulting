import { chromium } from "playwright";
import fs from "node:fs/promises";

const base = "https://aloha-ai-consulting.vercel.app";
const routes = ["/", "/start", "/work", "/organizations", "/learning", "/tools", "/contact", "/work/ai-opportunity-clinic", "/learning/decision-desk"];
const out = "mobile-production-qa";
await fs.mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  screen: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();
const consoleErrors = [];
page.on("console", message => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", error => consoleErrors.push(error.message));

const results = [];
for (const route of routes) {
  const response = await page.goto(base + route, { waitUntil: "networkidle", timeout: 30000 });
  const data = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const overflowing = [...document.querySelectorAll("body *")].flatMap(element => {
      const box = element.getBoundingClientRect();
      if (box.left >= -2 && box.right <= width + 2) return [];
      const style = getComputedStyle(element);
      if (style.position === "fixed" && box.width <= width + 2) return [];
      return [{
        tag: element.tagName,
        className: String(element.className).slice(0, 100),
        text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 100),
        left: Math.round(box.left),
        right: Math.round(box.right),
      }];
    }).slice(0, 20);
    return {
      title: document.title,
      h1: document.querySelector("h1")?.innerText,
      mains: document.querySelectorAll("main").length,
      overlay: Boolean(document.querySelector("[data-nextjs-dialog],.vite-error-overlay,#webpack-dev-server-client-overlay")),
      viewportWidth: width,
      scrollWidth: document.documentElement.scrollWidth,
      overflowing,
    };
  });
  const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "--");
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  results.push({ route, status: response?.status(), ...data });
}

await browser.close();
const report = { testedAt: new Date().toISOString(), viewport: "390x844", results, consoleErrors };
await fs.writeFile(`${out}/results.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

const failures = results.filter(result =>
  result.status !== 200 ||
  result.mains !== 1 ||
  result.overlay ||
  result.scrollWidth > result.viewportWidth + 2 ||
  result.overflowing.length
);
if (consoleErrors.length || failures.length) process.exitCode = 1;
