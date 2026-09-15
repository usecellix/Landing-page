// Renders every route in src/routes.tsx to its own static HTML file and emits a
// matching sitemap.
//
// Runs after both Vite builds: the client build produces dist/index.html with
// the hashed script/style tags, the SSR build produces dist-ssr/entry-server.js.
// Each route gets the shell with its own <head> block and its markup inside
// #root, so crawlers and social unfurlers receive real HTML.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(fileURLToPath(import.meta.url), '../..')
const distDir = path.join(root, 'dist')
const htmlPath = path.join(distDir, 'index.html')
const ssrEntry = path.join(root, 'dist-ssr/entry-server.js')

const ROOT_PLACEHOLDER = '<div id="root"></div>'
const SEO_START = '<!--seo:start-->'
const SEO_END = '<!--seo:end-->'

const OG_IMAGE = '/images/og-cover.png'
const OG_IMAGE_WIDTH = '2000'
const OG_IMAGE_HEIGHT = '1000'

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const { render, routeManifest, SITE_ORIGIN } = await import(
  pathToFileURL(ssrEntry).href
)

const template = await readFile(htmlPath, 'utf8')

for (const marker of [ROOT_PLACEHOLDER, SEO_START, SEO_END]) {
  if (!template.includes(marker)) {
    throw new Error(
      `prerender: could not find ${marker} in dist/index.html — the shell changed, update this script.`,
    )
  }
}

/** Absolute URL for a route path, without a trailing slash except at the root. */
const absolute = (routePath) =>
  routePath === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${routePath}`

function buildHead(meta, routePath) {
  const canonical = absolute(routePath)
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const image = `${SITE_ORIGIN}${OG_IMAGE}`

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${canonical}" />`,
  ]

  if (meta.noindex) {
    tags.push('<meta name="robots" content="noindex,nofollow" />')
  }

  tags.push(
    '<meta property="og:type" content="website" />',
    `<meta property="og:url" content="${canonical}" />`,
    '<meta property="og:site_name" content="CELLIX" />',
    '<meta property="og:locale" content="en_IN" />',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />`,
    '<meta property="og:image:alt" content="CELLIX — Intelligent Excel AI for Indian CAs" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  )

  if (meta.jsonLd?.length) {
    const graph = JSON.stringify(
      { '@context': 'https://schema.org', '@graph': meta.jsonLd },
      null,
      2,
    )
    // JSON-LD is not HTML-escaped, so escape "<" as \u003c (valid JSON, parsed
    // back to "<") to stop a string value terminating the script element early.
    tags.push(
      `<script type="application/ld+json">\n${graph.replace(/</g, '\\u003c')}\n</script>`,
    )
  }

  return tags.map((tag) => `    ${tag}`).join('\n')
}

const seoStart = template.indexOf(SEO_START)
const seoEnd = template.indexOf(SEO_END) + SEO_END.length
const before = template.slice(0, seoStart)
const after = template.slice(seoEnd)

const written = []
const shellOnly = []

for (const { path: routePath, meta } of routeManifest) {
  // Client-only routes (the signed-in /app surface) read the Better Auth
  // session, which exists only in a browser. Rendering them here would bake a
  // signed-out snapshot into the HTML that flashes before hydration corrects
  // it — so they get the empty shell with their <head>, and mount on the
  // client. A route with a path parameter also has no single URL to write.
  if (meta.clientOnly || routePath.includes(':')) {
    if (routePath.includes(':')) {
      shellOnly.push(`  ${routePath.padEnd(28)} (client-only, dynamic path)`)
      continue
    }
    const html = before + buildHead(meta, routePath).trimStart() + after
    const outPath = path.join(distDir, routePath.replace(/^\//, ''), 'index.html')
    await mkdir(path.dirname(outPath), { recursive: true })
    await writeFile(outPath, html)
    shellOnly.push(`  ${routePath.padEnd(28)} (client-only shell)`)
    continue
  }

  const appHtml = render(routePath)
  const html =
    before +
    buildHead(meta, routePath).trimStart() +
    after.replace(ROOT_PLACEHOLDER, () => `<div id="root">${appHtml}</div>`)

  const outPath =
    routePath === '/'
      ? htmlPath
      : path.join(distDir, routePath.replace(/^\//, ''), 'index.html')

  await mkdir(path.dirname(outPath), { recursive: true })
  await writeFile(outPath, html)
  written.push(
    `  ${routePath.padEnd(20)} ${appHtml.length.toLocaleString().padStart(8)} chars${meta.noindex ? '  (noindex)' : ''}`,
  )
}

// Sitemap lists only the indexable routes.
const lastmod = new Date().toISOString().slice(0, 10)
const indexable = routeManifest.filter(({ meta }) => !meta.noindex)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable
  .map(({ path: routePath, meta }) =>
    [
      '  <url>',
      `    <loc>${absolute(routePath)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      meta.changefreq ? `    <changefreq>${meta.changefreq}</changefreq>` : null,
      meta.priority ? `    <priority>${meta.priority}</priority>` : null,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n'),
  )
  .join('\n')}
</urlset>
`
await writeFile(path.join(distDir, 'sitemap.xml'), sitemap)

// The SSR bundle is a build artifact only — nothing should deploy it.
await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true })

console.log('prerender: wrote')
console.log(written.join('\n'))
if (shellOnly.length) {
  console.log('prerender: shells only (mounted on the client)')
  console.log(shellOnly.join('\n'))
}
console.log(`prerender: sitemap.xml lists ${indexable.length} indexable routes`)
