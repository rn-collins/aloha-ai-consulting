const ORIGIN = 'https://aloha-ai-consulting.vercel.app';
const DEFAULT_IMAGE = `${ORIGIN}/og-image.png`;

export function absoluteUrl(pathname = '/') {
  if (/^https?:\/\//.test(pathname)) return pathname;
  return `${ORIGIN}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

export function buildMetadata({
  title,
  description,
  pathname = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  robots = 'index, follow'
}) {
  if (!title) throw new Error('Metadata title is required');
  if (!description) throw new Error('Metadata description is required');

  const canonical = absoluteUrl(pathname);
  return {
    title,
    description,
    canonical,
    robots,
    openGraph: { type, title, description, image: absoluteUrl(image), url: canonical },
    twitter: { card: 'summary_large_image', title, description, image: absoluteUrl(image) }
  };
}

export function renderMetadata(meta) {
  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}">`,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}">`,
    `<meta name="robots" content="${escapeHtml(meta.robots)}">`,
    `<meta property="og:type" content="${escapeHtml(meta.openGraph.type)}">`,
    `<meta property="og:title" content="${escapeHtml(meta.openGraph.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.openGraph.description)}">`,
    `<meta property="og:image" content="${escapeHtml(meta.openGraph.image)}">`,
    `<meta property="og:url" content="${escapeHtml(meta.openGraph.url)}">`,
    `<meta name="twitter:card" content="${escapeHtml(meta.twitter.card)}">`,
    `<meta name="twitter:title" content="${escapeHtml(meta.twitter.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(meta.twitter.description)}">`,
    `<meta name="twitter:image" content="${escapeHtml(meta.twitter.image)}">`
  ].join('\n');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
