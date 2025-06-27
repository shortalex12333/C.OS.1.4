# CelesteOS Font Weight System

## Eloquia Font Weights Available:
- **100** - Thin (skipped for readability)
- **200** - ExtraLight
- **300** - Light  
- **400** - Regular
- **600** - SemiBold

## Usage Guidelines:

### Logo & Branding
```css
.logo, .celeste-logo, .chat-title {
  font-weight: 600; /* SemiBold - brand consistency */
}
```

### Chat Interface
```css
.user-message {
  font-weight: 400; /* Regular - clear, confident */
}

.ai-response {
  font-weight: 300; /* Light - easier on eyes for longer reading */
}

.ai-response h3, .ai-response strong {
  font-weight: 600; /* SemiBold - creates hierarchy within responses */
}
```

### UI Elements
```css
.page-headers {
  font-weight: 600; /* SemiBold - clear hierarchy */
}

.cta-button, .premium-button {
  font-weight: 600; /* SemiBold - commands attention */
}

.input-placeholder {
  font-weight: 300; /* Light - subtle, non-intrusive */
}

.timestamp, .metadata {
  font-weight: 200; /* ExtraLight - de-emphasized */
}
```

## To Activate Eloquia Fonts:
1. Add font files to `/app/frontend/public/fonts/`
2. Uncomment the @font-face declarations in `/app/frontend/src/styles/fonts.css`
3. Restart frontend service

Currently using Inter as fallback until Eloquia fonts are added.