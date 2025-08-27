# CelesteOS 1.4 - Architecture & File Dependency Structure

## Overview
CelesteOS is an enterprise-grade AI chat interface with yacht engineering context, featuring dark/light themes, Microsoft integration, and webhook-based backend communication.

## Core Architecture

```
src/
├── App.tsx                     # Root application component
├── main.tsx                    # React entry point
├── index.html                  # HTML template
│
├── contexts/                   # React Context Providers
│   └── ThemeContext.tsx        # Global theme management (dark/light/auto)
│
├── components/                 # React Components
│   ├── BackgroundSystem.tsx    # Dynamic gradient backgrounds
│   ├── ChatArea.tsx            # Main chat interface
│   ├── InputArea.tsx           # Message input with search modes
│   ├── Sidebar.tsx             # Navigation and search type selector
│   ├── Settings.tsx            # Settings modal with sections
│   ├── Login.tsx               # Authentication screen
│   ├── SignUp.tsx              # User registration
│   ├── AnimatedIntro.tsx      # First-time user animation
│   ├── TutorialOverlay.tsx    # Interactive tutorial
│   ├── PreloadedQuestions.tsx # FAQ suggestions
│   ├── ChatMessage.tsx        # Individual message renderer
│   ├── MobileHeader.tsx       # Mobile-specific navigation
│   ├── AskAlex.tsx            # AI assistant feature
│   └── AskAlexPage.tsx        # Dedicated Alex interface
│
├── services/                   # Backend Services
│   ├── webhookServiceComplete.ts  # Main webhook API handler
│   ├── tokenService.ts           # Token usage tracking
│   └── supabase.ts              # Supabase client config
│
├── styles/                     # Styling System
│   ├── globals.css            # Base styles & CSS variables
│   ├── darkModeTheme.ts       # Theme definitions & tokens
│   └── enterpriseComponents.css # Component-specific styles
│
├── config/                     # Configuration
│   └── webhookConfig.ts       # API endpoints & settings
│
├── utils/                      # Utility Functions
│   ├── appUtils.ts            # App-wide helpers
│   └── responseFormatter.ts   # Message formatting
│
└── types/                      # TypeScript Definitions
    └── webhook.ts              # API type interfaces
```

## Data Flow & Dependencies

### 1. Theme System
```
ThemeContext.tsx (Provider)
    ├─> App.tsx (Consumer)
    ├─> BackgroundSystem.tsx (Dynamic backgrounds)
    ├─> Settings.tsx (Theme selector)
    └─> All components (via useTheme/useThemedStyle hooks)

Storage: localStorage['appearance'] = 'light' | 'dark' | 'auto'
```

### 2. Authentication Flow
```
Login.tsx / SignUp.tsx
    └─> webhookServiceComplete.ts
        └─> Backend API (/auth endpoints)
            └─> localStorage (tokens & user data)
                └─> App.tsx (session restoration)
```

### 3. Chat System
```
InputArea.tsx (User input)
    └─> App.tsx (handleStartChat)
        └─> webhookServiceComplete.ts (sendTextChat)
            └─> Backend Webhooks
                └─> ChatArea.tsx (Display messages)
                    └─> ChatMessage.tsx (Render individual)
```

### 4. Search Modes
```
Sidebar.tsx (Search type selector)
    ├─> 'yacht' - Yacht documentation search
    ├─> 'email' - Email integration search
    └─> 'email-yacht' - Combined search
        └─> InputArea.tsx (Shows active mode)
            └─> webhookServiceComplete.ts (Includes in API call)
```

### 5. Microsoft Integration
```
Settings.tsx (Connectors section)
    └─> handleMicrosoftConnect()
        └─> OAuth flow (popup)
            └─> Backend webhook (microsoft-auth)
                └─> Email sync capabilities
```

## Key Systems Explained

### Theme Architecture
- **ThemeContext** provides global theme state
- Supports system preference auto-detection
- CSS custom properties for runtime theme switching
- Glass morphism effects in dark mode
- WCAG AAA contrast compliance

### Webhook Service
- Centralized API communication layer
- Handles authentication, chat, and integrations
- Token refresh mechanism
- Request/response interceptors
- Error handling and retry logic

### Responsive Design
- Mobile-first approach
- Breakpoint: 768px (isMobile detection)
- Collapsible sidebar on desktop
- Bottom navigation on mobile
- Touch-optimized interactions

### State Management
- React hooks for local state
- Context API for global state (theme, auth)
- localStorage for persistence
- Session restoration on app load

### Message Processing
- Streaming animation for AI responses
- Markdown rendering support
- Code syntax highlighting
- Source attribution for yacht docs
- Confidence scoring display

### Settings Architecture
Modular sections:
- General (name, language, appearance)
- Connectors (Microsoft/Email integration)
- Handover (Export conversations)
- Help & Contact (Support system)

### Performance Optimizations
- Lazy loading for heavy components
- Debounced input handling
- Virtual scrolling for long chats
- Build-time optimization (Vite)
- CSS-in-JS elimination for theme system

## External Dependencies

### Core Framework
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (utility styles)

### UI Libraries
- Lucide React (icons)
- Radix UI (accessible components)
- Framer Motion (animations)

### Backend Services
- Custom webhook endpoints
- Supabase (database/auth)
- Microsoft Graph API
- OpenAI/Claude APIs

### Deployment
- Vercel (hosting)
- GitHub (version control)
- Environment variables for API keys

## Environment Configuration
```
VITE_WEBHOOK_BASE_URL    # Backend API endpoint
VITE_SUPABASE_URL        # Supabase project URL
VITE_SUPABASE_ANON_KEY   # Supabase public key
```

## Build & Development
```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
vercel --prod        # Deploy to production
```

## File Relationships

### Critical Path Dependencies
1. `main.tsx` → `App.tsx` → All components
2. `ThemeContext.tsx` → Theme-aware components
3. `webhookServiceComplete.ts` → API-dependent features
4. `globals.css` + `darkModeTheme.ts` → Visual styling

### Component Hierarchy
```
App.tsx
├── ThemeProvider
├── BackgroundSystem
├── AnimatedIntro (first visit)
├── TutorialOverlay (new users)
├── Login/SignUp (unauthenticated)
└── Main Interface (authenticated)
    ├── Sidebar
    ├── ChatArea
    ├── InputArea
    └── Settings (modal)
```

## Data Persistence
- User session: `localStorage['celesteos_user']`
- Access token: `localStorage['celesteos_access_token']`
- Theme preference: `localStorage['appearance']`
- Tutorial status: `localStorage['hasCompletedTutorial']`
- Microsoft OAuth: `localStorage['ms_user_id']`

## API Integration Points
- `/auth/login` - User authentication
- `/auth/signup` - User registration
- `/chat/text` - Message processing
- `/microsoft-auth` - Email integration
- `/handover-export` - Conversation export
- `/token-usage` - Usage tracking

This architecture ensures scalability, maintainability, and a premium user experience across all devices and themes.