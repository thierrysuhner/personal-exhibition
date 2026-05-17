# Flight Log — Personal Exhibition

An interactive pilot's logbook as a personal portfolio, telling a non-standard career story through 5 "flight legs." 

**Core concept:** Formal printed aviation logbook structure + hand-drawn personal annotations. Visitors connect the dots literally—click waypoints on the route map, drag to the next, watch a hand-drawn line animate, and the corresponding chapter reveals itself.

**Tech Stack:** Vanilla HTML, CSS, JavaScript. No framework. Google Fonts: Caveat (handwritten) + IBM Plex Mono (formal) + Inter (body text).

## Quick Start

### Local Development

**Option 1: Simple (just open the file)**
```bash
open index.html
```

**Option 2: With a local server (recommended)**
```bash
# Using Python 3
python3 -m http.server 8000

# Or Node.js http-server
npx serve

# Then visit: http://localhost:8000 (or whatever port is shown)
```

### File Structure

```
/
├── index.html              # Main page structure
├── style.css               # All styling, design tokens, layout
├── main.js                 # App initialization, state management, intro sequence
├── chapters.js             # Chapter content data array
├── map.js                  # Route map logic, dot interaction, line animation
├── assets/
│   ├── drawings/           # Hand-drawn PNG assets
│   │   ├── README.md       # Asset notes
│   │   ├── Leg_1.PNG       # Chapter 1 illustration
│   │   ├── Leg_2.png       # Chapter 2 illustration
│   │   ├── Leg_3.PNG       # Chapter 3 illustration
│   │   ├── Leg_4.PNG       # Chapter 4 illustration
│   │   └── Leg_5.PNG       # Chapter 5 illustration
│   └── textures/           # Texture assets (reserved)
└── README.md               # This file
```

## Configuration

### Step 1: Edit Chapter Content

Open `chapters.js` and replace all `PLACEHOLDER` values:

```javascript
{
  id: 1,
  leg: "LEG 01",
  location: "LENZBURG, CH",
  dateRange: "2019–2022",
  dot: "CH-LENZ",
  dotLabel: "Lenzburg",
  title: "YOUR CHAPTER TITLE",
  body: "Write your story here. ~150 words. One concrete moment, specific and grounded.",
  callout: "One sentence key insight or decision.",
  stampText: "LOGGED"
}
```

For the final chapter (id: 5), the last chapter uses a different layout:
```javascript
{
  // ... other fields ...
  stampText: null,  // No stamp for the final chapter
  contactEmail: "you@example.com",
  contactLinkedin: "linkedin.com/in/yourhandle"
}
```

### Step 2: Add Hand-Drawn Illustrations

Drop PNG files into `assets/drawings/` with these exact filenames:

- `Leg_1.PNG` — Chapter 1 (Early Responsibility)
- `Leg_2.png` — Chapter 2 (Pressure & Self-Override)
- `Leg_3.PNG` — Chapter 3 (Building Direction)
- `Leg_4.PNG` — Chapter 4 (Collaboration at Intensity)
- `Leg_5.PNG` — Chapter 5 (Systems at Scale)

If a file is missing, the site shows a simple placeholder automatically.

## Layout

Two-page logbook spread (landscape, fixed viewport):

```
┌────────────────────────────────────────────────────┐
│ FLIGHT LOG // T.S.           [header with date]    │
│ ──────────────────────────────────────────────────  │
│                         │                          │
│  LEFT: ROUTE MAP        │  RIGHT: CHAPTER         │
│  5 dots, user clicks    │  Content reveals        │
│  and connects them      │  after each connection  │
│                         │                          │
│ ──────────────────────────────────────────────────  │
│ [dot indicators]                    [hint text]     │
└────────────────────────────────────────────────────┘
```

**Interaction Flow:**
1. Intro sequence (5 sec): typewriter warning + fade in
2. Visitor sees route map with 5 waypoints
3. First dot (Lenzburg) is ready (green, pulsing)
4. Click dot → it becomes origin
5. Preview line follows cursor (dashed, amber)
6. Click next dot → line animates (hand-drawn style, 800ms)
7. Chapter panel fades in
8. Bottom indicator lights up green
9. Next dot becomes ready
10. Repeat until all 5 connected

### Intro Sequence

Typewritten animation (35ms per character, black background):

```
WARNING: NON-STANDARD ROUTE DETECTED    [red]
                                        [pause 900ms]
INITIATING FLIGHT LOG...                [amber]
                                        [pause 700ms, then fade]
```

A "skip intro" button appears bottom-right for users who want to proceed immediately. Total ~5 seconds if not skipped.

### Route Map (Left Page)

**Dot Positions (percentage-based):**
- CH-LENZ (Early Responsibility): 20% left, 70% top
- CH-ARMY (Pressure & Self-Override): 25% left, 40% top
- CH-HSG (Building Direction): 45% left, 55% top
- CA-VAN (Collaboration at Intensity): 72% left, 35% top
- CH-GOOG (Systems at Scale): 88% left, 50% top

**Dot States:**
- `locked`: grey, no label, not clickable (other dots before connected)
- `ready`: aviation green, pulsing glow, label visible, clickable
- `connected`: filled green, label visible, no longer interactive

**Connection Rules:**
- Only sequential connections allowed (can't skip legs)
- User can only connect to the next waypoint in sequence
- All previous dots remain visible and connected

### Chapter Content (Right Page)

Renders after a dot is connected:

```
LEG 01 — LENZBURG, CH     2019–2022
────────────────────────────────

[140x140 sketch image or rough.js placeholder]

[Chapter narrative text]

┌──────────────────────┐
│ "Key insight here."  │  (italicized)
└──────────────────────┘

LOGGED        [stamped, rotated, semi-transparent]
              [appears with bounce animation]
```

Chapter 5 (pending) shows contact info instead of stamp:

```
STATUS: FILED. AWAITING CLEARANCE.

→ you@example.com  or  linkedin.com/in/yourhandle
```

### Design Tokens

**Colors:**
- Background: `#F5F0E8` (aged logbook paper)
- Grid lines: `#D6E4EE` (faint blue, 20px, always subtle)
- Dark ink: `#1A1A1A` (printed text)
- Handwriting: `#2C2C2C` (Caveat font)
- Aviation green: `#1B4332` (active, connected)
- Amber: `#C97D10` (warnings, hovers)
- Warning red: `#8B1A1A` (intro warning text)
- Stamp ink: `#8B6B4A` (LOGGED stamp)

**Fonts:**
- Caveat 400/700: all handwritten content
- IBM Plex Mono 400/500: printed logbook fields

## State Management

Simple JS object (no external library):

```javascript
state = {
  currentChapter: 1,       // 1-indexed
  connectedDots: [1],      // starts with dot 1 active
  activeOrigin: null,      // dot currently selected as connection start
  isAnimating: false       // prevent double-clicks during line animation
};
```

State persists in `sessionStorage`, so page refreshes retain progress within a session.

## Responsive Design

**Primary:** Laptop 1280px+, landscape (fully featured)
**Tablet:** 768px–1279px (scaled layout, same interaction)
**Mobile:** < 768px (single column: map above, chapter below)

On mobile, the map is 40vh, chapter is 50vh. Dots rearrange to a horizontal strip. The page remains fully functional.

## Deployment

### GitHub Pages

1. Push to your GitHub repository:
   ```bash
   git add .
   git commit -m "Initial flight log"
   git push origin main
   ```

2. Enable GitHub Pages in repo settings:
   - Go to **Settings > Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** (or your default branch), **/ (root)**
   - Save

3. Site available at: `https://<your-username>.github.io/<repo-name>/`

### Custom Domain

If hosted elsewhere (Vercel, Netlify, etc.), just push the files—it's a static site.

## Testing Checklist

- [ ] Intro sequence plays (5 seconds)
- [ ] First dot is ready (green, pulsing)
- [ ] Click first dot → selected
- [ ] Move cursor → preview line follows
- [ ] Click next dot → line animates (800ms)
- [ ] Chapter fades in
- [ ] Dot indicator fills green
- [ ] Next dot becomes ready
- [ ] Repeat for all 5 dots
- [ ] All chapters display correctly
- [ ] Text, images, stamps render
- [ ] Responsive on tablet / mobile
- [ ] No console errors

## Customization Tips

### Change Intro Text

Edit `main.js`, function `runIntroSequence()`:
```javascript
const warning = 'YOUR WARNING TEXT HERE';
const initiating = 'YOUR INITIATING TEXT HERE';
```

### Change Hint Text

Edit `main.js`, function `updateHintText()`:
```javascript
hintEl.textContent = 'your custom hint';
```

### Adjust Color Scheme

Edit `style.css`, `:root` section:
```css
--green-active: #1B4332;  /* Change this */
--amber-warn: #C97D10;    /* And this */
```

### Adjust Dot Positions

Edit `chapters.js`, object `dotPositions`:
```javascript
const dotPositions = {
  "CH-LENZ": { x: 20, y: 70 },  // x, y as percentages
  // ... etc
};
```

## Fallback System

If a PNG illustration is missing or fails to load, the site renders a simple dashed placeholder with the chapter number. No errors, no blank spaces.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires ES6 (async/await)

## Troubleshooting

### SVG not loading?
1. Check filename matches exactly (case-sensitive)
2. Verify SVG is valid XML (test in browser directly)
3. Check file size (< 20KB recommended)
4. Check console for CORS/network errors

### Intro doesn't play?
1. Make sure `main.js` loaded (check Network tab)
2. Check console for JS errors
3. Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### State not persisting?
This is normal on private browsing. `sessionStorage` is per-session only. Use regular browsing.

## License

This project is yours. Use, modify, share however you wish.

## Credits

- **Fonts:** Google Fonts (Caveat, IBM Plex Mono, Inter)
- **Illustrations:** Hand-drawn PNGs
- **Interaction:** Vanilla JavaScript, SVG animations

---

**Questions?** Edit `chapters.js` with your content, drop SVGs in `assets/drawings/`, and deploy. The site handles the rest.
