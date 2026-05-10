# Hand-Drawn SVG Assets

This folder is the drop zone for your custom hand-drawn SVG illustrations.

## File Naming Conventions

The site automatically loads SVG files if they exist, and falls back to rough.js placeholders if they don't. All files are optional.

### Waypoint Dots

Place SVG files for individual waypoints here:
- `dot-CH-LENZ.svg` → Lenzburg dot
- `dot-CH-ARMY.svg` → Army/SPHAIR dot
- `dot-CH-HSG.svg` → St. Gallen dot
- `dot-CA-VAN.svg` → Vancouver dot
- `dot-XX-NEXT.svg` → Pending waypoint dot

**Expected structure:** A single SVG element, typically a `<circle>` or `<g>`, roughly 24x24px.

### Route Lines

Animated connections between waypoints:
- `line-1-2.svg` → Lenzburg to Army
- `line-2-3.svg` → Army to St. Gallen
- `line-3-4.svg` → St. Gallen to Vancouver
- `line-4-5.svg` → Vancouver to Pending

**Expected structure:** A single `<path>` element with a stroke. The app animates `stroke-dashoffset` from full length to 0 over 800ms.

### Chapter Sketches

Illustrations for each chapter content panel:
- `sketch-mediamatiker.svg` → Chapter 1 (Lenzburg)
- `sketch-army.svg` → Chapter 2 (Army/SPHAIR)
- `sketch-hsg.svg` → Chapter 3 (St. Gallen)
- `sketch-caseit.svg` → Chapter 4 (Vancouver)
- `sketch-next.svg` → Chapter 5 (Pending)

**Expected structure:** Any SVG composition. The container is 140x140px with overflow hidden.

### Map Background (Optional)

- `map-base.svg` → Abstract route diagram background

**Expected structure:** An SVG with a background or terrain texture suggesting geography.

## Testing Your Assets

1. Save an SVG file with the correct name in this directory.
2. Open `index.html` in your browser.
3. The app will load your SVG instead of the rough.js placeholder.
4. If the SVG doesn't load, the fallback will appear automatically (no errors).

## SVG Tips

- Keep SVG files small (< 20KB each).
- Use `viewBox` instead of hardcoded dimensions.
- For animated lines, ensure the `<path>` has a `stroke` attribute.
- Test in a real browser, not just Figma preview.
