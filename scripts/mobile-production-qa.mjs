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
  const data = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.innerText,
    mains: document.querySelectorAll("main").length,
    overlay: Boolean(document.querySelector("[data-nextjs-dialog],.vite-error-overlay,#webpack-dev-server-client-overlay")),
    viewportWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "--");
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  results.push({ route, status: response?.status(), ...data });
}

await page.goto(base, { waitUntil: "networkidle", timeout: 30000 });
const menuSummary = page.locator("details.mobile-menu > summary");
await menuSummary.click();
const menuState = await page.evaluate(() => {
  const button = [...document.querySelectorAll("button")].find(element => /menu/i.test(element.textContent || ""));
  const visibleNavLinks = [...document.querySelectorAll("nav a[href]")].filter(element => {
    const box = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  });
  return {
    expanded: document.querySelector("details.mobile-menu")?.open ? "true" : "false",
    visibleLinkCount: visibleNavLinks.length,
    linkLabels: visibleNavLinks.map(link => (link.textContent || "").trim()).filter(Boolean),
    viewportWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  };
});
await page.screenshot({ path: `${out}/home--menu-open.png`, fullPage: true });

await browser.close();
const report = { testedAt: new Date().toISOString(), viewport: "390x844", results, menuState, consoleErrors };
await fs.writeFile(`${out}/results.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

const failures = results.filter(result =>
  result.status !== 200 ||
  result.mains !== 1 ||
  result.overlay ||
  result.scrollWidth > result.viewportWidth + 2
);
const menuFailed =
  menuState.expanded !== "true" ||
  menuState.visibleLinkCount < 5 ||
  menuState.scrollWidth > menuState.viewportWidth + 2;
if (consoleErrors.length || failures.length || menuFailed) process.exitCode = 1;
