# CELLIX Landing Page — Video Reference

All videos used in the hero section and related demo areas of this project.

---

## Currently active

### 1. Hero background video

| Field | Details |
|-------|---------|
| **Role** | Full-viewport ambient background behind navbar, headline, and waitlist |
| **Active URL** | See [Hero background library](#hero-background-library) below — currently **#4** |
| **File in repo** | Remote URL (not stored locally) |
| **Component** | `src/components/Hero.tsx` |
| **Playback** | `autoPlay`, `muted`, `loop`, `playsInline` |
| **Layout** | Fixed to one viewport height (`h-screen`); does not expand with the product demo below |

#### Hero background library

All CloudFront hero background candidates. Swap any URL into `Hero.tsx` to use it.

| # | Date / time (from filename) | URL | Status |
|---|----------------------------|-----|--------|
| 1 | 2026-03-19 · 01:59:52 | `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4` | Available |
| 2 | 2026-07-02 · 08:09:59 | `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4` | Available |
| 3 | 2026-07-02 · 08:10:42 | `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4` | Available |
| 4 | 2026-07-02 · 08:11:27 | `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4` | **Active** |
| 5 | 2026-07-02 · 09:20:26 | `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4` | Available |

**Direct links (copy-paste):**

1. https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4
2. https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4
3. https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4
4. https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4
5. https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4

```tsx
<video
  className="h-full w-full object-cover"
  src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4"
  autoPlay
  muted
  loop
  playsInline
/>
```

---

### 2. Product demo video (hero card)

| Field | Details |
|-------|---------|
| **Role** | Main product preview inside the frosted-glass card below the waitlist |
| **Original filename** | `vidssave.com Collaborate with Claude across Microsoft365 apps 1080P.mp4` |
| **Bundled file** | `src/assets/product-demo.mp4` (~9.0 MB) |
| **Config** | `src/config/demo.ts` → `productDemoVideoSrc` |
| **Component** | `src/components/DashboardPreview.tsx` (via `Hero.tsx`) |
| **Playback** | `autoPlay`, `muted`, `loop`, `playsInline` |
| **Layout** | Full-width 16:9 video card; no sidebar when video is set |
| **Note** | Placeholder demo (Claude / Microsoft 365) until a CELLIX-specific recording is ready |

```ts
// src/config/demo.ts
import demoVideo from '@/assets/product-demo.mp4'
export const productDemoVideoSrc = demoVideo
```

**Local copies in project:**

| Path | Notes |
|------|-------|
| `src/assets/product-demo.mp4` | Used by the app at build/runtime |
| `vidssave.com Collaborate with Claude across Microsoft365 apps 1080P.mp4` | Original file in project root |
| `dist/assets/product-demo-*.mp4` | Production build output (hashed filename) |

---

## Previously used (replaced)

### 3. YouTube product demo

| Field | Details |
|-------|---------|
| **Role** | Product demo embed in the dashboard area (before local MP4) |
| **Watch URL** | https://www.youtube.com/watch?v=F6dzjaBCBtU |
| **Video ID** | `F6dzjaBCBtU` |
| **Embed URL** | `https://www.youtube-nocookie.com/embed/F6dzjaBCBtU` |
| **Replaced by** | `src/assets/product-demo.mp4` |
| **When** | User requested local MP4 instead of YouTube |

Embed params that were used:

- `autoplay=1`
- `mute=1`
- `loop=1`
- `playlist=F6dzjaBCBtU` (required for YouTube loop)
- `rel=0`
- `modestbranding=1`
- `playsinline=1`

---

## Hero section layout (how both videos relate)

```
┌─────────────────────────────────────────┐
│  Navbar (fixed, frosted glass)          │
│                                         │
│  Headline + subtext + waitlist          │
│         ▲                               │
│         │  Hero background video        │
│         │  (CloudFront MP4, h-screen)   │
│  ┌─────────────────────────────────┐    │
│  │  Product demo video             │    │
│  │  (product-demo.mp4)             │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
         │ bottom half of demo card
         ▼
   White page background → Features section
```

The background video stays at viewport height. The product demo card sits half over the video and half over the white section below.

---

## How to swap videos

### Change hero background

Edit the `src` on the `<video>` tag in `src/components/Hero.tsx`, or move the URL into `src/config/demo.ts` and import it.

### Change product demo

1. Replace `src/assets/product-demo.mp4` with your new file (keep the same name), **or**
2. Add a new file under `src/assets/` and update the import in `src/config/demo.ts`.

### Re-enable YouTube (optional)

`DashboardPreview` currently supports a local `demoVideoSrc` prop only. To use YouTube again, you would need to restore iframe embed logic in `DashboardPreview.tsx` and pass a video ID from config.

---

## Deployment notes

- The **hero background** loads from CloudFront at runtime — no extra build size, but it depends on that URL staying available.
- The **product demo** is bundled into `dist/` (~9 MB). Large deploys or slow first loads may benefit from hosting the demo on a CDN and referencing a public URL instead.

---

## Quick checklist

| Video | Active | Type | Where defined |
|-------|--------|------|----------------|
| Hero background #4 | Yes | Remote MP4 (CloudFront) | `Hero.tsx` |
| Hero background #1–#3, #5 | No | Remote MP4 (CloudFront) | `VIDEOS.md` library |
| Product demo | Yes | Local MP4 | `src/assets/product-demo.mp4` + `demo.ts` |
| YouTube `F6dzjaBCBtU` | No | YouTube embed | Replaced by local MP4 |
