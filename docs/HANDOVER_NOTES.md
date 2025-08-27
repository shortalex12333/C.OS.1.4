# CelesteOS 1.4 - Engineering Handover Notes

## Project Overview
**Repository**: https://github.com/shortalex12333/C.OS.1.4  
**Local Path**: `/Users/celeste7/Documents/C.OS.1.4`  
**Production URL**: https://celesteos-v1-4-4pseb44nl-c7s-projects-4a165667.vercel.app  
**Stack**: React 18, TypeScript, Vite, TailwindCSS, Vercel

## Current State (As of Handover)

### ✅ Completed Work
1. **Enterprise Theme System** - Full dark/light/auto mode with system preference detection
2. **Authentication Flow** - Login/SignUp with webhook-based backend
3. **Chat Interface** - AI-powered chat with streaming responses
4. **Microsoft Integration** - OAuth flow for email connectivity
5. **Search Modes** - Yacht docs, email, and combined search
6. **Mobile Responsiveness** - Fully responsive with mobile-specific UI
7. **Tutorial System** - First-time user onboarding
8. **Settings Management** - Modular settings with multiple sections
9. **Handover Export** - PDF generation of conversation history

### 🔧 Recent Fixes Applied
- **Theme System Overhaul**: Fixed 8 critical faults in dark/light mode switching
  - Consolidated localStorage to single 'appearance' key
  - Removed hardcoded color values
  - Implemented proper auto-detect functionality
  - Fixed Settings component default prop conflicts
  - Replaced all inline styles with theme tokens
  - Fixed BackgroundSystem to use theme variables
  - Corrected theme flow between App and Settings components
  - Added appearance export in useThemedStyle hook

### 📋 Known Issues & Considerations
1. **Build Warnings**: NODE_ENV warning in Vite build (cosmetic, doesn't affect functionality)
2. **OAuth Redirect**: Currently uses localhost:8003 for Microsoft OAuth callback
3. **Webhook Dependency**: Requires backend services to be running for full functionality
4. **Token Refresh**: Implemented but needs monitoring for edge cases

## Critical Files to Understand

### Core Architecture
- `src/contexts/ThemeContext.tsx` - Global theme provider (recently refactored)
- `src/services/webhookServiceComplete.ts` - All backend API communications
- `src/App.tsx` - Main application orchestrator
- `src/components/Settings.tsx` - Complex settings modal with integrations

### Theme System
- `src/styles/darkModeTheme.ts` - Theme token definitions
- `src/styles/globals.css` - CSS custom properties
- `src/components/BackgroundSystem.tsx` - Dynamic gradient backgrounds

### Authentication
- `src/components/Login.tsx` & `SignUp.tsx` - User authentication
- Session stored in localStorage: `celesteos_user`, `celesteos_access_token`

## Environment Variables Required
```bash
VITE_WEBHOOK_BASE_URL=<backend_api_url>
VITE_SUPABASE_URL=<supabase_project_url>
VITE_SUPABASE_ANON_KEY=<supabase_public_key>
```

## Development Workflow

### Local Development
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (auto-assigns port)
npm run build           # Build for production
npm run preview         # Preview production build
```

### Deployment
```bash
npm run build           # Build first
vercel --prod --yes     # Deploy to production
```

### Testing Theme System
1. Open app and check Settings modal
2. Toggle between Light/Dark/Auto modes
3. Verify persistence after page refresh
4. Check system preference detection in Auto mode

## Key Architectural Decisions

### Theme Management
- Single source of truth: `localStorage['appearance']`
- Three modes: 'light', 'dark', 'auto'
- Auto mode respects system preferences
- All components use theme tokens (no hardcoded colors)

### State Management
- React Context for global state (theme, auth)
- Local component state with hooks
- localStorage for persistence
- No external state management library

### API Communication
- Centralized through webhookServiceComplete.ts
- Automatic token refresh mechanism
- Error handling with user feedback
- Request/response interceptors

### Component Architecture
- Functional components with hooks
- TypeScript for type safety
- Modular component structure
- Responsive design patterns

## Important Context for Next Engineer

### Recent Theme System Refactor
The theme system was completely overhauled to fix persistent dark/light mode issues. The previous implementation had 8 different faults causing conflicts. Everything now flows through ThemeContext with a single localStorage key.

### Microsoft Integration
The Microsoft OAuth integration is functional but the redirect URI is currently set to localhost:8003. This will need adjustment for different deployment environments.

### Search Modes
The app supports three search modes:
- 'yacht': Searches yacht documentation
- 'email': Searches through integrated emails
- 'email-yacht': Combined search

These modes are selected in the Sidebar and passed through to the webhook service.

### Mobile Considerations
The app uses a 768px breakpoint for mobile detection. Mobile UI has:
- Collapsible menu (hamburger icon)
- Bottom input area
- Simplified navigation
- Touch-optimized interactions

## Maintenance Tasks

### Regular
- Monitor webhook service health
- Check token refresh mechanism
- Update dependencies monthly
- Review Vercel deployment logs

### Occasional
- Audit theme consistency across new components
- Performance profiling (especially on mobile)
- Security review of authentication flow
- Accessibility testing with screen readers

## Contact & Resources
- **Repository**: https://github.com/shortalex12333/C.OS.1.4
- **Deployment**: Vercel (auto-deploys from main branch)
- **Backend**: Custom webhook service (separate repository)
- **Database**: Supabase

## Tips for Success
1. Always test theme changes in both light and dark modes
2. Check mobile view when making UI changes
3. Use theme tokens from ThemeContext, never hardcode colors
4. Test with backend services running for full functionality
5. Clear browser cache if theme seems stuck
6. Use Chrome DevTools to toggle prefers-color-scheme for testing

---

## Prompt for Next Engineer

"You are taking over development of CelesteOS 1.4, an enterprise-grade AI chat interface for yacht engineering. The codebase is in `/Users/celeste7/Documents/C.OS.1.4` (GitHub: shortalex12333/C.OS.1.4).

Key points:
1. The theme system was recently refactored - it uses a single 'appearance' localStorage key with values: 'light', 'dark', or 'auto'
2. All theme colors flow through ThemeContext - never hardcode colors
3. The app has three search modes (yacht/email/email-yacht) selected via Sidebar
4. Microsoft OAuth integration exists but redirect URI may need updating
5. Mobile breakpoint is 768px with specific mobile UI components
6. Backend communication goes through webhookServiceComplete.ts

Recent work focused on fixing theme switching issues. The system now properly syncs between UI state and Settings modal, with auto-detect following system preferences.

The production deployment is on Vercel. Use 'npm run dev' for local development and 'vercel --prod --yes' to deploy after building.

Please familiarize yourself with:
- src/contexts/ThemeContext.tsx (theme provider)
- src/services/webhookServiceComplete.ts (API layer)
- src/components/Settings.tsx (complex settings implementation)
- ARCHITECTURE.md (full system documentation)

The app requires backend webhook services to be running for full functionality. Check environment variables in .env.local for API endpoints."