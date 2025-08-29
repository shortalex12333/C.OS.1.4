# Solution Card Confidence System - Complete Specification

## Confidence Badge Visual System

### Circle Badge Dimensions (EXACT from AISolutionCard.tsx lines 436-440)
```css
width: 24px (mobile) | 28px (desktop)
height: 24px (mobile) | 28px (desktop)  
min-width: 24px (mobile) | 28px (desktop)
min-height: 24px (mobile) | 28px (desktop)
border: none
border-radius: 50%
cursor: pointer
```

### Confidence Score to Color Mapping (EXACT from getConfidenceCircleStyle function)

#### High Confidence (≥75%)
- **Light Mode**: `linear-gradient(135deg, #059669 0%, #047857dd 100%)`
- **Dark Mode**: `linear-gradient(135deg, #10b981 0%, #10b981dd 100%)`
- **Shadow Light**: `0 3px 12px rgba(5, 150, 105, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)`
- **Shadow Dark**: `0 3px 12px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`

#### Medium Confidence (50-74%)
- **Light Mode**: `linear-gradient(135deg, #d97706 0%, #d97706dd 100%)`
- **Dark Mode**: `linear-gradient(135deg, #f59e0b 0%, #f59e0bdd 100%)`
- **Shadow Light**: `0 3px 12px rgba(217, 119, 6, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)`
- **Shadow Dark**: `0 3px 12px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`

#### Low Confidence (<50%)
- **Light Mode**: `linear-gradient(135deg, #dc2626 0%, #dc2626dd 100%)`
- **Dark Mode**: `linear-gradient(135deg, #ef4444 0%, #ef4444dd 100%)`
- **Shadow Light**: `0 3px 12px rgba(220, 38, 38, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)`
- **Shadow Dark**: `0 3px 12px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)`

### Base Circle Style (Applied to all confidence levels)
```css
transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1)
display: flex
align-items: center  
justify-content: center
```

### Hover/Active States
- **Hover**: `transform: scale(1.1)` (110% scale)
- **Active**: `transform: scale(0.95)` (95% scale) 
- **Title**: `"${confidenceScore}% confidence"`
- **Aria Label**: `"Confidence level: ${confidenceScore}%"`

## Step Icon System (EXACT from getStepIcon function)

### Icon Type Mapping
```typescript
type StepType = "normal" | "warning" | "tip"
```

#### Normal Steps (default)
- **Icon**: ✅ CheckCircle  
- **Color**: `text-green-500` (#10b981)
- **Usage**: Standard diagnostic/procedure steps

#### Warning Steps  
- **Icon**: ⚠️ AlertTriangle
- **Color**: `text-amber-500` (#f59e0b)
- **Usage**: Safety warnings, critical steps, hazards

#### Tip Steps
- **Icon**: 💡 Info  
- **Color**: `text-blue-500` (#3b82f6)
- **Usage**: Helpful hints, best practices, recommendations

### Icon Specifications
- **Size Mobile**: `w-3.5 h-3.5` (14px)
- **Size Desktop**: `w-4 h-4` (16px)
- **Position**: `mt-0.5` (2px margin-top alignment)
- **Flex**: `flex-shrink-0` (prevent icon compression)

## Step Text Formatting (EXACT from AISolutionCard.tsx lines 550-562)

```css
font-size: 15px (mobile) | 16px (desktop)
line-height: 23px (mobile) | 25px (desktop)  
color: var(--solution-text-color)
font-family: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
font-weight: 500 (normal) | 600 (bold headers)
letter-spacing: -0.01em
```

### Step Text Variants
- **Regular Steps**: `font-weight: 500`
- **Bold Headers**: `font-weight: 600`, `isBold: true`
- **Mobile Gap**: `16px` between icon and text
- **Desktop Gap**: `12px` between icon and text

## Technical Specifications Display

### Parts Needed Section
```css
font-weight: 600 (label)
color: var(--solution-title-color) (label)
color: var(--solution-secondary-color) (items)
margin-left: 16px (bullet indent)
```

### Safety Warnings Section  
```css
color: var(--confidence-medium-text) (amber warning color)
icon: AlertTriangle w-4 h-4 mt-0.5 flex-shrink-0
gap: 8px (between icon and text)
```

### Time Estimates
```css
font-weight: 600 (label "Estimated Time:")
color: var(--solution-title-color) (label)
color: var(--solution-secondary-color) (value)
```

## Source Document Chip (EXACT from lines 452-475)

### Chip Styling
```css
display: inline-flex
align-items: center
gap: 8px
padding: 6px 12px (px-3 py-1.5)
border-radius: 6px (rounded-md)
font-size: 13px
line-height: 18px
color: var(--solution-secondary-color)
font-family: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
background-color: var(--solution-card-bg)
border: 1px solid var(--solution-card-border)
```

### Source Text Format
- **Icon**: ExternalLink `w-3 h-3`
- **Title**: Full document title (desktop) | Truncated 20 chars (mobile)  
- **Page**: `" p.47"` (if available)
- **Revision**: `", Rev 2024.1"` (if available)

## Animation System (EXACT motion variants)

### Content Expand/Collapse
- **Collapsed**: `opacity: 0, height: 0, y: -4px`
- **Expanded**: `opacity: 1, height: auto, y: 0px`
- **Duration**: `0.28s expand` / `0.2s collapse`
- **Easing**: `cubic-bezier(0.22, 0.61, 0.36, 1)` 
- **Height Duration**: `0.25s expand` / `0.18s collapse`
- **Opacity Duration**: `0.2s expand (delay 0.05s)` / `0.15s collapse`

### Chevron Rotation
- **Collapsed**: `rotate: 0deg`
- **Expanded**: `rotate: 90deg` 
- **Duration**: `0.18s`
- **Easing**: `cubic-bezier(0.22, 0.61, 0.36, 1)`

### Step Stagger Animation
- **Stagger Children**: `0.06s` (60ms delay between steps)
- **Delay Children**: `0.1s` (start after main content)
- **Step Duration**: `0.25s`
- **Step Transform**: `y: 8px → y: 0px`, `opacity: 0 → 1`

## Container Specifications (EXACT from lines 369-373)

### Solutions Container
```css
className: "w-full flex flex-col solutions_container solution-cards-dark-theme"
padding: 8px (mobile) | 12px (desktop)
gap: 16px (mobile) | 20px (desktop)
```

### Individual Card Container  
```css
className: "overflow-hidden solution_card"
border-radius: 8px
background-color: var(--solution-card-bg) | var(--solution-card-bg-expanded)
backdrop-filter: blur(20px) saturate(1.4)
-webkit-backdrop-filter: blur(20px) saturate(1.4)
box-shadow: var(--solution-card-shadow) | var(--solution-card-shadow-expanded)
border: 1px solid var(--solution-card-border) | var(--solution-card-border-expanded)
```

## Header Section (EXACT from lines 403-408)

### Header Padding
- **Mobile Collapsed**: `16px`
- **Mobile Expanded**: `20px`
- **Desktop**: `24px`

### Title Specifications (EXACT from lines 414-430)
```css
font-size: 18px (mobile) | 20px (desktop)
line-height: 25px (mobile) | 28px (desktop)
font-weight: 700
color: var(--solution-title-color)
font-family: 'Eloquia Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
letter-spacing: -0.025em
white-space: nowrap (mobile) | normal (desktop)
overflow: hidden (mobile) | visible (desktop) 
text-overflow: ellipsis (mobile) | clip (desktop)
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8) (dark mode only)
```

## Feedback System (EXACT from lines 745-837)

### Button Container
```css
display: flex
gap: 12px (desktop) | flex-col (mobile)
padding: 20px 24px (footer section)
border-top: 1px solid var(--solution-card-border)
```

### Helpful Button Styling
```css
border-radius: 8px
background: transparent | var(--button-helpful-bg) (selected)
backdrop-filter: blur(16px) saturate(1.2)
border: 1px solid rgba(34, 197, 94, 0.25) | var(--button-helpful-border) (selected)
box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1) | 0 4px 16px rgba(34, 197, 94, 0.2) (selected)
font-size: 13px (mobile) | 14px (desktop)
font-weight: 500
color: #6b7280 | var(--button-helpful-text) (selected)
font-family: 'Eloquia Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
```

### Button Interaction States  
- **Mouse Down**: `translateY(1px) scale(0.98)`
- **Mouse Up**: `translateY(0px) scale(1)`
- **Mouse Leave**: `translateY(0px) scale(1)`
- **Icon Hover**: `scale(1.1)` on ThumbsUp/ThumbsDown icons

This completes the exact technical specifications for all solution card visual elements and interactions.