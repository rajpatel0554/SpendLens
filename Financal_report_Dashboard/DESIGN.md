---
name: Luminous Finance
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff516a'
  on-tertiary-container: '#5b0017'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-data:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system focuses on a high-fidelity, data-centric experience tailored for modern personal finance. The brand personality is professional and precise, yet energized by vibrant digital accents. It evokes a sense of clarity and control over complex financial data.

The aesthetic blends **Modern Corporate** structure with **Glassmorphism**. It utilizes semi-transparent surfaces and subtle backdrop blurs to create a sense of depth and sophistication without overwhelming the user. The interface prioritizes high-contrast data visualizations against a deep, immersive background, ensuring that critical financial insights remain the focal point.

## Colors
The palette is designed for high legibility in a dark environment. 

- **Primary (Electric Indigo):** Reserved for primary actions, active states, and focal points.
- **Secondary (Emerald Green):** Indicates positive financial trends, growth, and successful transactions.
- **Tertiary (Rose Red):** Used for alerts, over-budget warnings, and negative trends.
- **Neutral (Slate Grays):** A scale of slates provides structure for borders, secondary text, and inactive states. 
- **Surface Strategy:** Backgrounds utilize the deep `#121826` base, while interactive surfaces use slightly lighter slate variants with reduced opacity to facilitate glassmorphism.

## Typography
This design system employs **Inter** for its exceptional legibility and neutral, modern tone. For technical data points and labels, **Geist** is introduced to provide a precise, developer-grade feel to financial figures and monospaced data sets.

Headlines use tighter letter spacing and heavier weights to command authority. Body text maintains generous line heights to ensure readability during long sessions of expense reviewing. Data-heavy tables should exclusively use the `mono-data` role to ensure numerical alignment.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum container width of 1280px for desktop viewing. It utilizes a 12-column system for dashboard layouts and a 4-column system for mobile.

- **Desktop:** 24px gutters and 40px side margins. 
- **Tablet:** 16px gutters and 24px side margins. 
- **Mobile:** 16px gutters and 16px side margins.

Vertical rhythm is strictly maintained using a 4px baseline grid. Components such as cards and list items should use `lg` (24px) padding to maintain a spacious, high-end feel.

## Elevation & Depth
Depth is established through **Glassmorphism** and tonal layering rather than traditional heavy shadows.

- **Level 0 (Base):** The #121826 background.
- **Level 1 (Cards/Surfaces):** A semi-transparent overlay (e.g., White at 5% opacity) with a `backdrop-filter: blur(12px)`.
- **Level 2 (Modals/Popovers):** A more opaque overlay (e.g., White at 10% opacity) with a `backdrop-filter: blur(20px)` and a subtle 1px border using `Slate-700` at 50% opacity.
- **Highlighting:** Elements "lift" via increased border-brightness and a subtle `0px 4px 20px` shadow tinted with the Primary Indigo color at 15% opacity.

## Shapes
The shape language is consistently **Rounded**. A base radius of 8px (`0.5rem`) is applied to standard components like buttons and input fields. Larger containers, such as dashboard widgets and modals, utilize `rounded-xl` (24px) to soften the analytical nature of the data and contribute to the modern aesthetic.

## Components
- **Buttons:** Primary buttons use a solid Electric Indigo fill with white text. Secondary buttons use a glass background with an Indigo border.
- **Inputs:** Fields are dark with a 1px Slate-800 border. On focus, the border transitions to Primary Indigo with a subtle outer glow.
- **Cards:** Dashboard widgets must feature a `backdrop-filter: blur` and a thin, 1px border (`rgba(255,255,255,0.1)`) to define edges against the dark background.
- **Chips:** Used for transaction categories. They should have a low-opacity background tint matching their category color (e.g., Green for "Income") with high-contrast text.
- **Data Visualizations:** Charts should use high-saturation strokes (Indigo, Emerald, Rose) with semi-transparent area gradients that "glow" against the dark background.
- **Lists:** Transaction rows should be separated by subtle 1px Slate-800 lines, with hover states triggering a slight background highlight.