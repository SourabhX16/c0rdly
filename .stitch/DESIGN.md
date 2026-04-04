# Design System: C0rdly — Midnight Galaxy

## 1. Visual Theme & Atmosphere

A deep, cosmic interface that evokes star-gazing through precision-cut obsidian glass. The atmosphere is dense yet sophisticated — "Stochastic Crystallization" where data elements emerge from an infinite dark canvas like crystalline structures catching distant starlight. The visual density is balanced (5/10) — enough breathing room for premium feel, enough data for operational confidence. Motion intensity at 6/10 — fluid, purposeful micro-interactions without cinematic excess.

**Signature Technique:** 1% opacity generative noise texture overlay across the entire canvas, creating a star-field grain effect that adds analog depth to the digital surface.

## 2. Color Palette & Roles

### Primary Canvas
- **Cosmic Navy** (#0F172A) — Primary background surface. The infinite dark canvas
- **Deep Abyss** (#020617) — Sidebar and elevated dark surfaces. Slate-950 depth
- **Midnight Panel** (#1E293B) — Card backgrounds, table containers. Slate-800

### Accent
- **Electric Indigo** (#4F46E5) — Single accent for CTAs, active states, focus rings, navigation highlights. The crystalline glow

### Text Hierarchy
- **Slate White** (#F8FAFC) — Primary text. Headlines, important data
- **Frost Gray** (#94A3B8) — Secondary text. Descriptions, labels, metadata. Slate-400
- **Dim Steel** (#64748B) — Tertiary text. Timestamps, disabled states. Slate-500

### Status Colors (Semantic)
- **Emerald Signal** (#10B981) — Success, "Done" status. Paired with Emerald-100/Emerald-700 badges
- **Amber Pulse** (#F59E0B) — Warning, "Received/Pending" status. Paired with Amber-100/Amber-700 badges
- **Sky Current** (#3B82F6) — Info, "In Progress" status. Paired with Blue-100/Blue-700 badges
- **Crimson Alert** (#EF4444) — Danger, error states, destructive actions

### Surface & Border
- **Glass White** (rgba(255,255,255,0.05)) — Glassmorphism card fill
- **Crystal Edge** (rgba(255,255,255,0.08)) — Glassmorphism card borders
- **Indigo Shimmer** (rgba(79,70,229,0.15)) — Hover state backgrounds, active row tint

## 3. Typography Rules

- **Display/Headlines:** Space Grotesk — Geometric sans-serif with technical character. Track-tight (-0.025em), weight-driven hierarchy (600–700). Feels premium, mathematical, precise
- **Body/Labels:** Inter — Clean, highly legible for UI text. Regular (400) and Medium (500) weights. Leading relaxed, max 65ch per line
- **Data/Mono:** Space Grotesk or JetBrains Mono — For numbers, stats, monospace blocks, share URLs. Numbers appear large and confident (text-3xl to text-4xl for stat cards)
- **Scale:** Stats = text-4xl font-bold. Page titles = text-2xl font-semibold. Section headers = text-lg font-semibold. Body = text-sm. Metadata = text-xs

## 4. Component Stylings

### Buttons
- **Primary:** Electric Indigo (#4F46E5) fill + white text + soft indigo shadow (shadow-lg shadow-indigo-600/25). Rounded-xl (12px). Hover: darken to #4338CA + slight lift (-translate-y-0.5). Active: scale(0.98).
- **Secondary:** Transparent + Slate-200 border + Frost Gray text. Hover: bg-white/5
- **Danger:** Red-50/10 bg + Red-400 text. Hover: Red-500/20 bg

### Cards / Containers (Crystalline Glass)
- **Elevation Tier 1 (Flat):** Midnight Panel (#1E293B) bg + Crystal Edge border (1px). No shadow. Used for table containers
- **Elevation Tier 2 (Raised):** Glass White bg + backdrop-blur-xl + Crystal Edge border + shadow-sm. Used for stat cards
- **Elevation Tier 3 (Floating):** Glass White bg + backdrop-blur-2xl + Crystal Edge border + shadow-lg. Used for modals, dropdowns
- **All corners:** 12px (rounded-xl) or 16px (rounded-2xl). Never sharp, never pill

### Inputs / Forms
- **Background:** Slate-800/50 (#1E293B at 50%)
- **Border:** Slate-600 (#475569) default. Focus: Electric Indigo with 4px ring (ring-2 ring-indigo-500/40 + border-indigo-500)
- **Text:** Slate White for value, Frost Gray for placeholder
- **No box-shadows on inputs.** Clean, flat appearance
- **Labels:** Above input, text-sm font-medium text-slate-300
- **Required asterisk:** Crimson Alert (#EF4444)

### Tables
- **Sticky header:** bg-slate-800/80 + backdrop-blur-sm
- **Alternating rows:** Even rows at bg-white/[0.02]
- **Hover:** Indigo Shimmer bg (rgba(79,70,229,0.08)) + left border indigo glow
- **Header text:** text-xs uppercase tracking-wider font-semibold text-slate-400

### Status Badges (Pill Shape)
- **Received:** bg-indigo-500/10 text-indigo-400 border border-indigo-500/20
- **In Progress:** bg-amber-500/10 text-amber-400 border border-amber-500/20
- **Done:** bg-emerald-500/10 text-emerald-400 border border-emerald-500/20

### Navigation (Sidebar)
- **Width:** 260px fixed
- **Background:** Deep Abyss (#020617)
- **Active item:** 3px left border Electric Indigo + bg-indigo-500/10 + text-indigo-400
- **Inactive item:** text-slate-400. Hover: text-slate-200 + bg-white/5
- **Logo area:** Top, with indigo glow accent

## 5. Layout Principles

- Grid-first responsive architecture with CSS Grid
- Admin sidebar: 260px fixed, content fills remaining space
- Max content width: 1280px (max-w-7xl) centered with generous horizontal padding
- Base spacing unit: 4px. Card internal padding: 24px (p-6). Section gaps: 32px (gap-8)
- Generous whitespace inside cards — numbers breathe, labels have room
- Mobile (< 1024px): sidebar becomes hamburger with glass overlay, cards stack to 1-col

## 6. Motion & Interaction

- **Hover transitions:** 150ms ease-out on all interactive elements
- **Card lifts:** 200ms ease-out, -translate-y-1 + shadow increase
- **Page entrance:** 400ms ease-out fade-in with 8px translateY
- **Staggered reveals:** 50ms delay per item for lists/grids
- **Shimmer effect:** Continuous subtle gradient animation on glass cards (very subtle)
- **Icon rotation:** 6deg on hover for portal form cards
- **Spring physics:** Not used (keeping CSS-only for performance)
- **Hardware acceleration:** Animate only transform + opacity. Never layout properties

## 7. Anti-Patterns (Banned)

- No pure black (#000000) — always use Cosmic Navy or Deep Abyss
- No sharp corners (0px radius) or pill shapes (999px) — only 12px or 16px
- No generic Bootstrap card layouts — use glassmorphism crystalline style
- No bright/neon outer glows — only subtle indigo inner tints
- No oversaturated accent colors — Indigo at controlled saturation
- No generic placeholder names — use contextual Indian printing press terminology
- No circular loading spinners — use skeletal shimmers
- No AI copywriting clichés — concrete, operational language
- No light-mode-first design — dark canvas is primary, light only for public forms
- No broken image links — use SVG illustrations or Lucide icons
