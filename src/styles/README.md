# Design Tokens & Tailwind CSS v4 Setup

## Overview

This project uses Tailwind CSS v4 with custom design tokens from Figma exported as JSON.

## Alias Imports

The following aliases are available:

```typescript
import Component from "@/components/Component.astro";
import Layout from "@layouts/Layout.astro";
import "@styles/global.css";
import Logo from "@assets/logo.svg";
import data from "@constants/data.json";
```

## Color Palette

Use these colors in your Tailwind classes:

- `pure-white` - #FFFFFF
- `red` - #FC4747
- `dark-blue` - #10141E
- `greyish-blue` - #5A698F
- `semi-dark-blue` - #161D2F

### Usage Examples:

```html
<div class="bg-dark-blue text-pure-white">
  <h1 class="text-red">Entertainment Web App</h1>
</div>
```

## Typography Classes

### Headings

- `.heading-l` - 2rem (32px) / Light (300) / -0.03125rem letter spacing
- `.heading-m` - 1.5rem (24px) / Light (300)
- `.heading-s` - 1.5rem (24px) / Medium (500)
- `.heading-xs` - 1.125rem (18px) / Medium (500)

### Body Text

- `.body-m` - 0.9375rem (15px) / Light (300)
- `.body-s` - 0.8125rem (13px) / Light (300)

### Usage Examples:

```html
<h1 class="heading-l">Large Heading</h1>
<h2 class="heading-m">Medium Heading</h2>
<h3 class="heading-s">Small Heading</h3>
<h4 class="heading-xs">Extra Small Heading</h4>
<p class="body-m">Medium body text</p>
<p class="body-s">Small body text</p>
```

## CSS Custom Properties

All design tokens are also available as CSS variables:

### Colors:

- `var(--color-pure-white)`
- `var(--color-red)`
- `var(--color-dark-blue)`
- `var(--color-greyish-blue)`
- `var(--color-semi-dark-blue)`

### Typography:

> Font is download from [fontsource](https://fontsource.org) package.

- `var(--font-outfit)`
- `var(--font-size-heading-l)` through `var(--font-size-body-s)`
- `var(--font-weight-heading-l)` through `var(--font-weight-body-s)`
- `var(--line-height-heading-l)` through `var(--line-height-body-s)`
- `var(--letter-spacing-heading-l)` through `var(--letter-spacing-body-s)`

### Usage in Custom CSS:

```css
.custom-element {
  color: var(--color-red);
  font-size: var(--font-size-heading-m);
  font-weight: var(--font-weight-heading-m);
}
```

## Tailwind CSS v4 Features

This project uses Tailwind CSS v4 with the Vite plugin. The configuration is done via CSS using the `@theme` directive in `global.css`.

### Key Features:

- CSS-based configuration
- Design token integration
- Custom color palette
- Typography system
- Full Tailwind utility classes available
