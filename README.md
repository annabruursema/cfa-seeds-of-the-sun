# Seeds of the Sun — CFA Online Voting System

A voting platform for the Milan Art Gallery "Seeds of the Sun" Call for Art exhibition.

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom gallery color palette
- **Vote Storage**: Netlify Blobs (built-in key-value store)
- **Artwork Data**: Static JSON from Notion (32 selected artworks)
- **Hosting**: Netlify

## Pages

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Public voting gallery | Public |
| `/admin` | Vote results dashboard | Password protected |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```
ADMIN_PASSWORD=your-secure-password
```

### 3. Add artwork images

Place artwork images in `public/images/artworks/` matching the filenames in `data/artworks.json`.

Each artwork expects an image at: `/images/artworks/{artwork-id}.jpg`

For example:
- `before-the-bloom-zahn-du-plessis.jpg`
- `morning-glory-kyle-trudelle.jpg`

If you have a local folder "CFA-Seeds of the Sun" with images, rename them to match the IDs.

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` for the voting page and `http://localhost:3000/admin` for the dashboard.

> Note: Netlify Blobs requires Netlify CLI for local dev. Install it with `npm i -g netlify-cli` and run `netlify dev` instead.

## Deploy to Netlify

### Option A: Git-based deploy (recommended)

1. Push this project to a GitHub/GitLab repo
2. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import an existing project
3. Connect your repo
4. Build settings should auto-detect from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables in Netlify dashboard → Site settings → Environment variables:
   - `ADMIN_PASSWORD` = your admin password
6. Deploy!

### Option B: Manual deploy

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## Syncing Artwork Data from Notion

If you need to refresh artwork data from Notion:

```bash
NOTION_API_KEY=secret_xxx \
NOTION_GENERAL_DB_ID=30a49f730f668193b44cc262234b24f5 \
NOTION_SOPA_DB_ID=30a49f730f6681d69086d499453f9757 \
npm run sync-notion
```

> Note: Notion image URLs expire. For production, download images locally.

## Voting Logic

- Users enter their email to vote (stored as cookie for convenience)
- Up to 3 votes per email address
- Votes can be added and removed
- Duplicate votes for the same artwork are prevented
- All vote data stored in Netlify Blobs

## File Structure

```
cfa-voting-system/
├── data/artworks.json          # 32 artworks from Notion
├── scripts/sync-notion.mjs     # Notion → JSON sync script
├── public/images/artworks/     # Artwork images go here
├── src/
│   ├── app/
│   │   ├── layout.js           # Root layout
│   │   ├── page.js             # Public voting page
│   │   ├── globals.css         # Tailwind + custom styles
│   │   ├── admin/page.js       # Admin dashboard
│   │   └── api/
│   │       ├── vote/route.js   # POST vote, GET voter status
│   │       ├── results/route.js # GET vote tallies (admin)
│   │       └── admin/route.js  # POST auth check
│   ├── components/
│   │   ├── VotingGallery.jsx   # Main gallery + vote logic
│   │   ├── ArtworkCard.jsx     # Individual artwork card
│   │   ├── ArtworkModal.jsx    # Lightbox detail view
│   │   ├── EmailPrompt.jsx     # Email entry modal
│   │   └── AdminDashboard.jsx  # Full admin UI
│   └── lib/
│       ├── artworks.js         # Artwork data helpers
│       └── votes.js            # Netlify Blobs vote storage
├── netlify.toml
├── next.config.js
├── tailwind.config.js
└── package.json
```
