import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { routes } from './routes.tsx'

const root = document.getElementById('root')!

const app = (
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </BrowserRouter>
  </StrictMode>
)

// `npm run build` prerenders every route into its own HTML file (see
// scripts/prerender.mjs), so a production load hydrates existing markup.
// `npm run dev` serves an empty shell and falls back to a client-side mount.
if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
