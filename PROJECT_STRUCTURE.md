# CelesteOS 1.4 - Project Structure

## 📁 Directory Organization

```
C.OS.1.4/
├── src/                    # Source code
│   ├── frontend-ux/        # Frontend React components
│   │   ├── components/     # React components
│   │   ├── styles/         # CSS and style files
│   │   ├── assets/         # Images and static assets
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Frontend utilities
│   ├── backend/            # Backend code
│   │   ├── api/            # API endpoints
│   │   │   ├── auth/       # Authentication
│   │   │   └── db/         # Database connections
│   │   └── security/       # Security configurations
│   ├── services/           # Shared services
│   ├── data/               # Static data (FAQ database)
│   ├── config/             # App configuration
│   └── types/              # TypeScript types
├── config/                 # Build & tool configurations
│   ├── postcss.config.js   # PostCSS configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── tsconfig.json       # TypeScript config (TO MOVE)
│   └── tsconfig.node.json  # Node TypeScript config (TO MOVE)
├── deployment/             # Deployment configurations
│   ├── netlify/            # Netlify functions
│   ├── netlify.toml        # Netlify config
│   └── vercel.json         # Vercel config
├── docs/                   # Documentation
├── scripts/                # Build and deployment scripts
├── tests/                  # Test files
├── backups/                # Backup files
├── public/                 # Public static files
│   └── fonts/              # Web fonts
├── dist/                   # Build output
└── node_modules/           # Dependencies

## Key Files (Root Level)
- index.html                # Entry HTML (required by Vite)
- vite.config.ts            # Vite configuration
- package.json              # Project dependencies
- README.md                 # Project readme

## Cleanup Completed
✅ Removed duplicate `/frontend` folder
✅ Moved API and security to `/src/backend`
✅ Consolidated deployment configs to `/deployment`
✅ Moved PostCSS and Tailwind configs to `/config`
✅ Updated Vite config to reference new paths

## Import Path Updates Required
- Backend imports may need updating from `../../api` to `../../backend/api`
- Security imports may need updating from `../../security` to `../../backend/security`