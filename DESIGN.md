# MathTools Design System

> A design system for an educational platform that bridges exposition and understanding.

## Design Philosophy

MathTools is an **educational resource**, not a developer tool. The design should feel:

- **Warm and approachable** — like a well-lit classroom, not a code editor
- **Trustworthy and academic** — conveying expertise without intimidation
- **Content-first** — the tools are the star, not the chrome around them
- **Inclusive** — accessible to students, teachers, and parents across all experience levels

---

## Color Palette

### Core Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--theme-page` | `#FEFCF9` (Warm Cream) | `#111827` (Warm Gray) | Page background |
| `--theme-card` | `#FFFFFF` (White) | `#1F2937` (Slate 800) | Card/panel backgrounds |
| `--theme-main` | `#1F2937` (Charcoal) | `#F9FAFB` (Gray 50) | Primary text |
| `--theme-muted` | `#6B7280` (Gray 500) | `#9CA3AF` (Gray 400) | Secondary text, captions |
| `--theme-border` | `#E5E7EB` (Gray 200) | `#374151` (Gray 700) | Borders, dividers |

### Accent Colors

| Token | Value | Semantic Meaning |
|-------|-------|------------------|
| `--color-primary` | `#2563EB` (Blue 600) | Primary actions, links, interactive elements |
| `--color-success` | `#059669` (Emerald 600) | Confirmations, correct answers, positive states |
| `--color-danger` | `#DC2626` (Red 600) | Destructive actions, errors, delete buttons |
| `--color-warning` | `#D97706` (Amber 600) | Cautions, important notices |
| `--color-info` | `#0891B2` (Cyan 600) | Informational highlights, tips |

### Category Colors (Optional)

For tool categorization, use softer accent tints:

| Category | Color | Usage |
|----------|-------|-------|
| Mathematics | `#3B82F6` (Blue 500) | Math tool icons, section headers |
| Computing | `#10B981` (Emerald 500) | Computing tool icons, section headers |
| Statistics | `#8B5CF6` (Violet 500) | Future statistics tools |
| Geometry | `#F59E0B` (Amber 500) | Future geometry tools |

### Color Application Rules

1. **Never use gradients for text** — use solid accent colors
2. **Avoid neon glows** — shadows should be soft and subtle (`shadow-sm`, `shadow-md`)
3. **Background blobs are banned** — no `blur-[120px]` ambient effects
4. **Dark mode should feel warm** — use gray-based darks, not pure black (`#020617`)

---

## Typography

### Font Stack

| Purpose | Font Family | Fallback | CSS Variable |
|---------|-------------|----------|--------------|
| **Headings** | Merriweather | Georgia, serif | `--font-heading` |
| **Body** | Inter | system-ui, sans-serif | `--font-sans` |
| **Code** | JetBrains Mono | monospace | `--font-mono` |

### Type Scale

| Element | Size | Weight | Font | Line Height |
|---------|------|--------|------|-------------|
| H1 (Hero) | `text-5xl` / `text-6xl` | 700 (Bold) | Serif | 1.1 |
| H1 (Page) | `text-4xl` / `text-5xl` | 700 (Bold) | Serif | 1.2 |
| H2 | `text-2xl` / `text-3xl` | 600 (Semibold) | Serif | 1.3 |
| H3 | `text-xl` | 600 (Semibold) | Sans | 1.4 |
| Body | `text-base` | 400 (Regular) | Sans | 1.6 |
| Small/Caption | `text-sm` | 400 (Regular) | Sans | 1.5 |
| Button | `text-sm` | 500 (Medium) | Sans | 1 |

### Typography Rules

1. **Serif headings create trust** — Merriweather evokes academic authority while remaining highly readable
2. **Sans-serif body ensures readability** — especially for younger readers
3. **Generous line-height** — educational content needs breathing room
4. **Avoid all-caps except for tiny labels** — it's harder to read

---

## Design Elements

### Cards

Cards are the primary container for content and tools.

```
┌─────────────────────────────────────┐
│  Content area                       │
│  - 24px padding (p-6)              │
│  - 12px border-radius (rounded-xl)  │
│  - 1px solid border                 │
│  - Subtle shadow (shadow-sm)        │
└─────────────────────────────────────┘
```

**Specifications:**
- Border radius: `12px` (`rounded-xl`)
- Border: `1px solid var(--theme-border)`
- Background: `var(--theme-card)`
- Shadow: `shadow-sm` default, `shadow-md` on hover
- Padding: `24px` (`p-6`)

**What we don't use:**
- ❌ Gradient borders (`p-[1px]` trick with gradient background)
- ❌ 2rem+ border radius (`rounded-[2rem]`)
- ❌ Background glow effects (`blur-[60px]`)
- ❌ Hover scale transforms (`hover:scale-[1.02]`)

### Buttons

#### Primary Button
For main actions (e.g., "Explore Tools", "Add Counter")

```css
background: var(--color-primary);
color: white;
padding: 12px 24px;
border-radius: 8px;
font-weight: 500;
box-shadow: 0 1px 2px rgba(0,0,0,0.05);
```

Hover: Slightly darker background, no glow effects.

#### Secondary Button
For alternative actions (e.g., "Learn More", "Cancel")

```css
background: var(--theme-card);
color: var(--theme-main);
border: 1px solid var(--theme-border);
padding: 12px 24px;
border-radius: 8px;
```

#### Danger Button
For destructive actions (e.g., "Clear All", "Delete")

```css
background: var(--color-danger);
color: white;
/* or outline variant: */
background: transparent;
color: var(--color-danger);
border: 1px solid var(--color-danger);
```

#### Button Rules

1. **Buttons should feel tactile** — solid fills, subtle shadows
2. **No gradient backgrounds** — solid colors only
3. **No glow shadows** — use standard box-shadows
4. **Consistent border-radius** — `8px` (`rounded-lg`)
5. **Clear visual hierarchy** — primary stands out, secondary is neutral

### Inputs

```css
background: var(--theme-card);
border: 1px solid var(--theme-border);
border-radius: 8px;
padding: 8px 12px;
/* Focus state: */
border-color: var(--color-primary);
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
```

### Icons

- **Source:** Lucide Icons (already in use)
- **Size:** 20px default, 16px for inline, 24px for emphasis
- **Color:** Inherit from text color, or use category colors

### Navbar

```css
background: var(--theme-page);
border-bottom: 1px solid var(--theme-border);
/* Subtle blur is acceptable: */
backdrop-filter: blur(8px);
background: rgba(var(--theme-page-rgb), 0.95);
```

**What we don't use:**
- ❌ Heavy blur (`backdrop-blur-md`)
- ❌ Low opacity backgrounds (`/80`)

---

## Spacing System

Use Tailwind's default spacing scale consistently:

| Token | Value | Usage |
|-------|-------|-------|
| `gap-2` | 8px | Between inline elements |
| `gap-4` | 16px | Between related items |
| `gap-6` | 24px | Between sections |
| `gap-8` | 32px | Between major sections |
| `p-4` | 16px | Small container padding |
| `p-6` | 24px | Card padding |
| `p-8` | 32px | Section padding |

---

## Tool Interface Guidelines

The interactive tools have their own considerations:

### Canvas Area
- Background: Slightly different from page (subtle distinction)
- Light: `#F3F4F6` (Gray 100)
- Dark: `#0F172A` (Slate 900)

### Toolbar
- Clean, minimal chrome
- Group related actions
- Use icon + text for clarity when space permits

### Sidebar
- Fixed width: `192px` (`w-48`)
- Subtle border separation
- Logical groupings with section headers

### Interactive Elements (Counters, Tiles)
- High contrast for visibility
- Distinct positive/negative colors
- Smooth animations (300ms default)

---

## Breakpoint Policy (Canvas Tools)
      
| Range | Device Class | UI Policy | Label Visibility | Layout Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **≥ 1024px** | **Desktop / Landscape Tablet** | **Full Experience** | **Visible** (`inline`) | Single Row. |
| **768px - 1023px** | **Portrait Tablet** | **Compact Experience** | **Hidden** (`hidden`) | Single Row preferred, icons only. |
| **< 768px** | **Mobile / Phablet** | **Restricted** | **Hidden** (`hidden`) | **Banner Active**. Override enables Multi-row wrapping (`flex-wrap`). |
      
### Banner Implementation
- **Trigger**: Screen width < 768px.
- **Content**: "This tool is designed for tablets and desktops. Please use a larger device for the best experience."
- **Action**: "Continue Anyway" (Dismiss).

---

## Responsive Behavior
---

## Accessibility Requirements

1. **Color contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
2. **Focus indicators:** Visible focus rings on all interactive elements
3. **Touch targets:** Minimum 44x44px for mobile
4. **Motion:** Respect `prefers-reduced-motion`
5. **Screen readers:** Proper ARIA labels on icons and interactive elements

---

## Anti-Patterns (What Not To Do)

| Pattern | Why It's Bad | Alternative |
|---------|--------------|-------------|
| Gradient text | Reads as "AI generated" | Solid accent color |
| Background blur blobs | Distracting, slow on mobile | Clean solid backgrounds |
| Neon glow shadows | Feels like a game, not a tool | Subtle `shadow-sm` |
| Dark mode by default | Unwelcoming for education | Light mode default |
| Bento grid cards | Overused in tech | Content-first layouts |
| Glassmorphism navbar | Trendy but dated | Simple solid with subtle blur |
| 2rem+ border radius | Feels like a toy | 8-12px is professional |
| Animated gradients | Performance issues, distracting | Static, purposeful color |

---

## Implementation Checklist

When implementing new components or pages, verify:

- [ ] Colors use CSS variables, not hardcoded values
- [ ] Headings use serif font, body uses sans-serif
- [ ] Cards follow the specification (radius, shadow, border)
- [ ] Buttons match the button system
- [ ] No gradients on text or backgrounds
- [ ] No blur blob backgrounds
- [ ] Responsive at all breakpoints
- [ ] Accessible (contrast, focus states)
