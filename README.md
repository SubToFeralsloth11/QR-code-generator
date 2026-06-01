# QR Code Generator

A free, no-account-needed QR code generator. Paste a URL, customize the QR code, and download it as PNG, SVG, or PDF — instantly, in your browser.

## Features

- **Instant generation** — QR code updates as you type
- **Auto-detection** — recognizes YouTube, Vimeo, and other video links
- **Full customization** — colors, size, error correction level
- **Multiple formats** — download PNG, SVG, and PDF
- **Shareable links** — copy a URL that opens the generator pre-filled with your link
- **No accounts, no backend** — everything runs in the browser
- **Mobile-friendly** — works on phones, tablets, and desktops
- **SEO optimized** — ready to appear in Google search results

## Tech Stack

| Piece | Choice | Notes |
|-------|--------|-------|
| QR generation | [qrcode](https://github.com/soldair/node-qrcode) | Browser build via CDN |
| PDF export | [jsPDF](https://github.com/parallax/jsPDF) | Client-side PDF creation |
| Styling | Vanilla CSS | CSS custom properties, no framework |
| Hosting | Netlify (free) | Custom domain + auto SSL |
| Ads | Google AdSense | Monetization |

## Project Structure

```
qr-code-generator/
├── index.html          # Main page — QR code generator
├── about.html          # About the tool
├── privacy.html        # Privacy policy (required for AdSense)
├── _redirects           # Netlify routing config
├── css/
│   └── style.css       # All styles
├── js/
│   └── app.js          # QR generation, downloads, customization
└── README.md
```

## Getting Started (Development)

No npm install. No build step. Just open a file:

```bash
# Option 1: Open directly
open index.html

# Option 2: Use a local server (recommended for URL features)
npx serve .

# Option 3: Python
python3 -m http.server 8080
```

## Deployment

### 1. Deploy to Netlify (recommended)

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import an existing project"
3. Connect your GitHub repo
4. Netlify auto-detects the settings — no build command needed (it's static HTML)
5. Click Deploy

### 2. Add your custom domain

1. In Netlify, go to **Site settings → Domain management → Add custom domain**
2. Enter your domain (e.g., `yourdomain.com`)
3. Update your domain's DNS records:
   - CNAME record: `www` → `your-site.netlify.app`
   - Or use Netlify DNS (recommended for apex domain)
4. SSL certificate is auto-provisioned — wait a few minutes

### 3. Set up Google AdSense

1. Sign up at [adsense.google.com](https://adsense.google.com)
2. Once approved, get your AdSense code snippet
3. Replace the placeholder comment in `index.html` (`<!-- AdSense code -->`) with your actual AdSense code
4. Add ad unit code in the designated `<!-- Ad unit -->` spots

## Monetization Plan

| Step | What | Timeline |
|------|------|----------|
| 1 | Launch site on custom domain | Day 1 |
| 2 | Build organic traffic via SEO | Weeks 1-4 |
| 3 | Apply for Google AdSense | After ~30 days / decent traffic |
| 4 | Place ads (1-2 per page max) | Once approved |
| 5 | Optimize placement over time | Ongoing |

Ad placement strategy:
- One banner below the generator (always visible, non-intrusive)
- Keep the generator itself ad-free so users have a good experience
- AdSense revenue depends on traffic — focus on SEO and word of mouth

## SEO Strategy

- Descriptive title tags and meta descriptions
- Semantic HTML (`<main>`, `<section>`, `<nav>`)
- Fast load times (static HTML, no JS framework bloat)
- Mobile-friendly responsive design (Google ranks this)
- Privacy policy page (helps with AdSense approval and trust)
- Clean URL structure

## Future Ideas

- Logo/image overlay on QR codes
- QR code style presets (dots, rounded, etc.)
- Bulk generation (paste multiple URLs)
- Dark mode toggle
- PWA support (install as an app)
- Scan tracking/analytics (optional)

## License

MIT
