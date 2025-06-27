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

### Authentication Screen
```css
.auth-title, .auth-screen h1 {
  font-weight: 600; /* SemiBold - strong brand presence */
}

.auth-tagline, .auth-screen p {
  font-weight: 300; /* Light - welcoming and approachable */
}

.auth-input, .auth-screen input {
  font-weight: 400; /* Regular - clear, confident user input */
}

.auth-input::placeholder {
  font-weight: 300; /* Light - subtle, non-intrusive guidance */
}

.auth-button, .auth-primary-button {
  font-weight: 600; /* SemiBold - commands attention */
}

.auth-toggle-button {
  font-weight: 400; /* Regular - clear but secondary */
}

.auth-error {
  font-weight: 400; /* Regular - clear error communication */
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

## Recent Updates:
✅ Sign up screen typography implemented
✅ Authentication form elements properly weighted
✅ Error messages and loading states styled
✅ Button hierarchy established