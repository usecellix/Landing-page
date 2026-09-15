import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { Route, Routes, StaticRouter } from 'react-router-dom'
import { routes } from './routes.tsx'

export { routeManifest, SITE_ORIGIN } from './routes.tsx'

/**
 * Build-time render of a single route. Every marketing route is rendered once
 * during `npm run build` and written to its own HTML file, so crawlers that do
 * not execute JavaScript (GPTBot, ClaudeBot, PerplexityBot, most social
 * unfurlers) get real HTML instead of an empty `#root`.
 */
export function render(url: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </StaticRouter>
    </StrictMode>,
  )
}
