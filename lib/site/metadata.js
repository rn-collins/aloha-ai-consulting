const ORIGIN = 'https://aloha-ai-consulting.vercel.app';
const DEFAULT_IMAGE = `${ORIGIN}/og-image.png`;
const TITLE_LIMIT = 70;
const DESCRIPTION_MIN = 70;
const DESCRIPTION_LIMIT = 180;
const DEFAULT_DESCRIPTION_SUFFIX = 'Explore source-grounded guidance, evidence, and practical implementation details from Aloha AI.';

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

  const boundedTitle = metadataTitle(title);
  const boundedDescription = metadataDescription(description);
  const canonical = absoluteUrl(pathname);
  return {
    title: boundedTitle,
    description: boundedDescription,
    canonical,
    robots,
    openGraph: { type, title: boundedTitle, description: boundedDescription, image: absoluteUrl(image), url: canonical },
    twitter: { card: 'summary_large_image', title: boundedTitle, description: boundedDescription, image: absoluteUrl(image) }
  };
}

export function metadataTitle(value, suffix = '') {
  const text = compact(value);
  const ending = suffix && !text.endsWith(suffix) ? suffix : '';
  return truncate(`${text}${ending}`, TITLE_LIMIT);
}

export function metadataDescription(value) {
  let text = compact(value);
  if (text.length < DESCRIPTION_MIN) text = `${text.replace(/[.!?]?$/, '.')} ${DEFAULT_DESCRIPTION_SUFFIX}`;
  return truncate(text, DESCRIPTION_LIMIT);
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

function compact(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function truncate(value, limit) {
  if (value.length <= limit) return value;
  const candidate = value.slice(0, limit - 1);
  const boundary = candidate.lastIndexOf(' ');
  return `${candidate.slice(0, boundary >= Math.floor(limit * 0.65) ? boundary : limit - 1).replace(/[,:;.!?—-]+$/, '')}…`;
}
