const base = process.env.SITE_BASE_URL || 'https://aloha-ai-consulting.vercel.app';
const routes = ['/', '/services', '/strategy', '/intelligence', '/legal-ai', '/trust-stack', '/university', '/content', '/build-your-team', '/ai-native-coo', '/launch-stack', '/engagements', '/workspace', '/methods'];
const failures = [];
for (const route of routes) {
  try {
    const response = await fetch(`${base}${route}`, { redirect: 'follow' });
    const body = await response.text();
    if (!response.ok) failures.push(`${route}: HTTP ${response.status}`);
    else if (!body.toLowerCase().includes('<html')) failures.push(`${route}: response is not HTML`);
    else console.log(`OK ${route} ${response.status}`);
  } catch (error) {
    failures.push(`${route}: ${error.message}`);
  }
}
if (failures.length) {
  console.error(`Smoke test failed with ${failures.length} route error(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Smoke tested ${routes.length} canonical routes at ${base}.`);
