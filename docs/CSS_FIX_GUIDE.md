# CSS Variable Fix for Tailwind

## Issue
The original `index.css` used opacity modifiers with CSS variables (`focus:ring-primary/10`) which Tailwind doesn't support directly.

## Solution
Updated `index.css` to use explicit CSS custom properties for focus states and other dynamic values.

## Changes Made

### Before (Problematic)
```css
.btn-primary {
  @apply bg-primary text-white hover:bg-primary-dark focus:ring-primary/10;
}
```

### After (Fixed)
```css
.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:focus {
  --tw-ring-color: var(--color-primary);
  --tw-ring-opacity: 0.5;
}
```

## Key Points

1. **Use CSS Variables Directly**: Instead of Tailwind's utility classes, use `background-color: var(--color-primary)`

2. **No Opacity Modifiers with Variables**: Can't use `bg-primary/50` or `ring-primary/10` with CSS variables

3. **Set Ring Color Manually**: For focus states, set `--tw-ring-color` and `--tw-ring-opacity` separately

4. **Custom Utility Classes**: Created `.bg-primary-custom`, `.text-primary-custom` etc. for when you need CSS variable colors

## How to Use Theme Colors

### In Components

**Good** ✅:
```jsx
// Use custom classes
<div className="bg-primary-custom text-white">

// Or use inline styles
<div style={{ backgroundColor: 'var(--color-primary)' }}>

// Or use Tailwind's arbitrary values
<div className="bg-[var(--color-primary)]">
```

**Avoid** ❌:
```jsx
// This won't work with CSS variables
<div className="bg-primary/50 ring-primary/10">
```

### Available Custom Classes

**Text Colors**:
- `.text-primary-custom`
- `.text-accent-custom`

**Background Colors**:
- `.bg-primary-custom`
- `.bg-primary-dark-custom`
- `.bg-primary-light-custom`
- `.bg-accent-custom`
- `.bg-accent-light-custom`

**Border Colors**:
- `.border-primary-custom`

**Gradients**:
- `.gradient-primary`
- `.gradient-accent`

**Shadows**:
- `.shadow-primary`
- `.shadow-accent`

## Tailwind Config

The `tailwind.config.js` is updated to use CSS variables as fallbacks:

```js
colors: {
  primary: {
    DEFAULT: 'var(--color-primary, #047857)',
    dark: 'var(--color-primary-dark, #065f46)',
    light: 'var(--color-primary-light, #d1fae5)',
  }
}
```

This means:
- `text-primary` works and uses the CSS variable
- But `text-primary/50` doesn't work (no opacity modifiers)

## Complete Fix Applied

The updated `index.css` file has been included in your package with:
- ✅ All problematic classes fixed
- ✅ Custom utility classes added
- ✅ Proper CSS variable usage
- ✅ Focus states working correctly
- ✅ Theme colors functional

Just replace your existing `src/index.css` with the one provided!
